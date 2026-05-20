import OpenAI from 'openai';
import { prisma } from '../lib/prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePropertyDescription(data: {
  title: string; bedrooms?: number; bathrooms?: number;
  squareFeet: number; city: string; amenities: string[];
}) {
  const prompt = `Write a compelling real estate listing description for: ${data.title}, ${data.bedrooms} bed / ${data.bathrooms} bath, ${data.squareFeet} sqft in ${data.city}. Amenities: ${data.amenities.join(', ')}. Keep it under 200 words, luxury tone.`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
  });
  return res.choices[0].message.content;
}

export async function getAIRecommendations(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { property: true },
    take: 10,
  });

  const avgPrice = favorites.length
    ? favorites.reduce((s, f) => s + f.property.price, 0) / favorites.length
    : 500000;
  const cities = [...new Set(favorites.map(f => f.property.city))];
  const types = [...new Set(favorites.map(f => f.property.propertyType))];

  const properties = await prisma.property.findMany({
    where: {
      status: 'ACTIVE',
      price: { gte: avgPrice * 0.7, lte: avgPrice * 1.3 },
      city: cities.length ? { in: cities } : undefined,
      propertyType: types.length ? { in: types as any } : undefined,
      id: { notIn: favorites.map(f => f.propertyId) },
    },
    take: 9,
    orderBy: { favoriteCount: 'desc' },
  });

  return properties;
}

export async function estimatePropertyValue(data: {
  squareFeet: number; bedrooms: number; bathrooms: number; city: string; yearBuilt?: number;
}) {
  const prompt = `Estimate the current market value (in USD) for a property: ${data.bedrooms} bed / ${data.bathrooms} bath, ${data.squareFeet} sqft, built ${data.yearBuilt ?? 'unknown'} in ${data.city}. Return only a JSON object: {"low": number, "mid": number, "high": number}`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(res.choices[0].message.content!);
}

export async function chatWithAssistant(messages: { role: 'user' | 'assistant'; content: string }[], propertyContext?: string) {
  const systemPrompt = `You are an expert real estate AI assistant for a luxury real estate platform. You help users find, evaluate, and understand properties. ${propertyContext ? `Current property context: ${propertyContext}` : ''} Be concise, professional, and helpful.`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 500,
    stream: false,
  });
  return res.choices[0].message.content;
}

export async function generateVirtualStagingSuggestions(roomType: string, style: string) {
  const prompt = `Suggest furniture and decor for a ${roomType} in ${style} style. Return JSON array of items: [{"name": string, "description": string, "estimatedCost": number, "placement": string}]. Max 6 items.`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(res.choices[0].message.content!);
  return parsed.items || parsed;
}
