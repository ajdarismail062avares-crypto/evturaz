import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

export const propertiesRouter = Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'CONDO', 'COMMERCIAL', 'LAND', 'TOWNHOUSE', 'VILLA']),
  listingType: z.enum(['FOR_SALE', 'FOR_RENT', 'FOR_LEASE', 'AUCTION']),
  price: z.number().positive(),
  pricePerMonth: z.number().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().optional(),
  squareFeet: z.number().positive(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  images: z.array(z.string()).optional(),
  yearBuilt: z.number().int().optional(),
  garage: z.boolean().optional(),
  pool: z.boolean().optional(),
});

propertiesRouter.get('/', async (req, res, next) => {
  try {
    const {
      page = '1', limit = '12', city, state, type, listingType,
      minPrice, maxPrice, minBeds, minBaths, minSqft,
      lat, lng, radius, q, sort = 'createdAt_desc',
    } = req.query as Record<string, string>;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { status: 'ACTIVE' };

    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = state;
    if (type) where.propertyType = type;
    if (listingType) where.listingType = listingType;
    if (minPrice || maxPrice) where.price = { gte: minPrice ? +minPrice : undefined, lte: maxPrice ? +maxPrice : undefined };
    if (minBeds) where.bedrooms = { gte: +minBeds };
    if (minBaths) where.bathrooms = { gte: +minBaths };
    if (minSqft) where.squareFeet = { gte: +minSqft };
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
    ];

    if (lat && lng && radius) {
      const r = parseFloat(radius);
      const latD = r / 111;
      const lngD = r / (111 * Math.cos((parseFloat(lat) * Math.PI) / 180));
      where.latitude = { gte: +lat - latD, lte: +lat + latD };
      where.longitude = { gte: +lng - lngD, lte: +lng + lngD };
    }

    const [sortField, sortDir] = sort.split('_');
    const orderBy: any = { [sortField]: sortDir };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where, skip, take: parseInt(limit), orderBy,
        include: { owner: { select: { firstName: true, lastName: true, avatar: true } } },
      }),
      prisma.property.count({ where }),
    ]);

    res.json({ properties, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
});

propertiesRouter.get('/:id', async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true, phone: true } },
        agent: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true, phone: true, licenseNumber: true } },
        reviews: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } }, orderBy: { createdAt: 'desc' } },
        amenities: true,
      },
    });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    await prisma.property.update({ where: { id: req.params.id }, data: { viewCount: { increment: 1 } } });
    res.json(property);
  } catch (err) {
    next(err);
  }
});

propertiesRouter.post('/', authenticate, authorize('SELLER', 'AGENT', 'ADMIN'), async (req: any, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const property = await prisma.property.create({
      data: { ...data, ownerId: req.user.id, images: data.images ?? [] },
    });
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
});

propertiesRouter.patch('/:id', authenticate, async (req: any, res, next) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop) return res.status(404).json({ error: 'Not found' });
    if (prop.ownerId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.property.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

propertiesRouter.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    const prop = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!prop) return res.status(404).json({ error: 'Not found' });
    if (prop.ownerId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

propertiesRouter.post('/:id/favorite', authenticate, async (req: any, res, next) => {
  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId: req.user.id, propertyId: req.params.id } },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      await prisma.property.update({ where: { id: req.params.id }, data: { favoriteCount: { decrement: 1 } } });
      return res.json({ favorited: false });
    }
    await prisma.favorite.create({ data: { userId: req.user.id, propertyId: req.params.id } });
    await prisma.property.update({ where: { id: req.params.id }, data: { favoriteCount: { increment: 1 } } });
    res.json({ favorited: true });
  } catch (err) {
    next(err);
  }
});

propertiesRouter.get('/user/favorites', authenticate, async (req: any, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { property: { include: { owner: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites.map(f => f.property));
  } catch (err) {
    next(err);
  }
});
