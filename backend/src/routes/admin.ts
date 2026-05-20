import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize('ADMIN'));

adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [users, properties, tours, payments] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.tourSession.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCEEDED' } }),
    ]);

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }, take: 5,
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
    });

    const topProperties = await prisma.property.findMany({
      orderBy: { viewCount: 'desc' }, take: 5,
      select: { id: true, title: true, city: true, price: true, viewCount: true, favoriteCount: true },
    });

    res.json({
      stats: { users, properties, tours, revenue: payments._sum.amount ?? 0 },
      recentUsers,
      topProperties,
    });
  } catch (err) { next(err); }
});

adminRouter.get('/users', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', role, q } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (role) where.role = role;
    if (q) where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
    ];

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total });
  } catch (err) { next(err); }
});

adminRouter.patch('/users/:id/role', async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role } });
    res.json(user);
  } catch (err) { next(err); }
});

adminRouter.patch('/users/:id/toggle', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user!.isActive },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

adminRouter.get('/properties/pending', async (_req, res, next) => {
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'PENDING' },
      include: { owner: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json(properties);
  } catch (err) { next(err); }
});

adminRouter.patch('/properties/:id/approve', async (req, res, next) => {
  try {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' },
    });
    res.json(property);
  } catch (err) { next(err); }
});
