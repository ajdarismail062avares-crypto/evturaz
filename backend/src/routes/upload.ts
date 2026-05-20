import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { authenticate } from '../middleware/auth';
import { v4 as uuid } from 'uuid';

export const uploadRouter = Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY!, secretAccessKey: process.env.AWS_SECRET_KEY! },
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

uploadRouter.post('/presigned', authenticate, async (req, res, next) => {
  try {
    const { fileName, fileType, folder = 'properties' } = req.body;
    const key = `${folder}/${uuid()}-${fileName}`;
    const command = new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, ContentType: fileType });
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({ uploadUrl: url, publicUrl: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` });
  } catch (err) { next(err); }
});

uploadRouter.post('/image', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const key = `uploads/${uuid()}-${req.file.originalname}`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));
    res.json({ url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` });
  } catch (err) { next(err); }
});
