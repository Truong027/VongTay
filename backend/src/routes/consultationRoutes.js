import express from 'express';
import { getConsultations, createConsultation } from '../controllers/consultationController.js';

const router = express.Router();

router.get('/', getConsultations);
router.post('/', createConsultation);

export default router;
