import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const contractsRouter = Router();

contractsRouter.post('/', authenticate, async (req: any, res, next) => {
  try {
    const { propertyId, buyerId, price, closingDate, content, type } = req.body;
    const contract = await prisma.contract.create({
      data: { propertyId, buyerId, sellerId: req.user.id, price, closingDate: new Date(closingDate), content, type },
    });
    res.status(201).json(contract);
  } catch (err) { next(err); }
});

contractsRouter.patch('/:id/sign', authenticate, async (req: any, res, next) => {
  try {
    const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!contract) return res.status(404).json({ error: 'Not found' });

    const isBuyer = contract.buyerId === req.user.id;
    const isSeller = contract.sellerId === req.user.id;
    if (!isBuyer && !isSeller) return res.status(403).json({ error: 'Forbidden' });

    const data: any = isBuyer ? { buyerSigned: true } : { sellerSigned: true };
    const updated = await prisma.contract.update({ where: { id: req.params.id }, data });

    if (updated.buyerSigned && updated.sellerSigned) {
      await prisma.contract.update({ where: { id: req.params.id }, data: { status: 'SIGNED', signedAt: new Date() } });
      await prisma.property.update({ where: { id: contract.propertyId }, data: { status: 'PENDING' } });
    }

    res.json(updated);
  } catch (err) { next(err); }
});

contractsRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        property: { select: { title: true, address: true, city: true } },
        buyer: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    res.json(contract);
  } catch (err) { next(err); }
});
