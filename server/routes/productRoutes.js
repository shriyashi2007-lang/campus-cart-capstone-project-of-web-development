import { Router } from 'express'; import { listProducts, getProduct, searchProducts } from '../controllers/productController.js';
const router = Router(); router.get('/', listProducts); router.get('/search', searchProducts); router.get('/:id', getProduct); export default router;
