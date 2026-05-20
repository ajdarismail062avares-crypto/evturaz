import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const toursRouter = Router();

toursRouter.post('/', authenticate, async (req: any, res, next) => {
  try {
    const { propertyId, scheduledAt, isMultiplayer } = req.body;
    const session = await prisma.tourSession.create({
      data: { propertyId, hostId: req.user.id, scheduledAt: scheduledAt ? new Date(scheduledAt) : null, isMultiplayer: isMultiplayer ?? false },
    });
    res.status(201).json(session);
  } catch (err) { next(err); }
});

toursRouter.get('/:roomCode', async (req, res, next) => {
  try {
    const session = await prisma.tourSession.findUnique({
      where: { roomCode: req.params.roomCode },
      include: {
        property: { select: { id: true, title: true, tourRoomData: true, images: true } },
        host: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });
    if (!session) return res.status(404).json({ error: 'Tour not found' });
    res.json(session);
  } catch (err) { next(err); }
});

toursRouter.patch('/:id/end', authenticate, async (req, res, next) => {
  try {
    const session = await prisma.tourSession.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });
    res.json(session);
  } catch (err) { next(err); }
});

toursRouter.post('/:propertyId/upload-model', authenticate, async (req: any, res, next) => {
  try {
    const { model3dUrl, tourRoomData } = req.body;
    const property = await prisma.property.update({
      where: { id: req.params.propertyId },
      data: { model3dUrl, tourRoomData, has3DTour: true },
    });
    res.json(property);
  } catch (err) { next(err); }
});
