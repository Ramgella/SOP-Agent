import fs from 'fs';
import path from 'path';
import multer from 'multer';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Each user gets their own folder so files never collide across accounts
    const userFolder = path.join(UPLOAD_ROOT, String(req.user.id));
    fs.mkdirSync(userFolder, { recursive: true });
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    const err = new Error('Only PDF files are allowed');
    err.statusCode = 400;
    return cb(err);
  }
  cb(null, true);
}

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});
