import { Router } from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { createOrder, listOrders, getOrder } from '../controllers/orderController.js';
const router = Router();
router.use(auth);
router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);
export default router;
