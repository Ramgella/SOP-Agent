import express from 'express';
import { uploadDocument, listDocuments, deleteDocument } from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { uploadPdf } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', listDocuments);
router.post('/upload', uploadPdf.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
