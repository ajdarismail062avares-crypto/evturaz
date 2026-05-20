import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.patch('/me', authenticate, async (req: any, res, next) => {
  try {
    const { firstName, lastName, phone, bio, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone, bio, avatar },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, bio: true, avatar: true, role: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

usersRouter.get('/:id/properties', async (req, res, next) => {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.params.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    res.json(properties);
  } catch (err) { next(err); }
});

usersRouter.get('/me/dashboard', authenticate, async (req: any, res, next) => {
  try {
    const [properties, favorites, tours, notifications] = await Promise.all([
      prisma.property.findMany({ where: { ownerId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.favorite.count({ where: { userId: req.user.id } }),
      prisma.tourSession.findMany({ where: { hostId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.notification.findMany({ where: { userId: req.user.id, isRead: false }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);
    res.json({ properties, favorites, tours, notifications });
  } catch (err) { next(err); }
});
