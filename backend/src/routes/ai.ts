import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  generatePropertyDescription, getAIRecommendations,
  estimatePropertyValue, chatWithAssistant, generateVirtualStagingSuggestions,
} from '../services/ai.service';

export const aiRouter = Router();

aiRouter.post('/describe', authenticate, async (req, res, next) => {
  try {
    const description = await generatePropertyDescription(req.body);
    res.json({ description });
  } catch (err) { next(err); }
});

aiRouter.get('/recommendations', authenticate, async (req: any, res, next) => {
  try {
    const props = await getAIRecommendations(req.user.id);
    res.json(props);
  } catch (err) { next(err); }
});

aiRouter.post('/estimate', async (req, res, next) => {
  try {
    const estimate = await estimatePropertyValue(req.body);
    res.json(estimate);
  } catch (err) { next(err); }
});

aiRouter.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { messages, propertyContext } = req.body;
    const reply = await chatWithAssistant(messages, propertyContext);
    res.json({ reply });
  } catch (err) { next(err); }
});

aiRouter.post('/staging', authenticate, async (req, res, next) => {
  try {
    const { roomType, style } = req.body;
    const suggestions = await generateVirtualStagingSuggestions(roomType, style);
    res.json(suggestions);
  } catch (err) { next(err); }
});
