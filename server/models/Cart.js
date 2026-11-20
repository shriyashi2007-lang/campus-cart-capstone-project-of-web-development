import mongoose from 'mongoose';
const cartSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true }, items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: { type: Number, min: 1 }, price: Number }], totalAmount: { type: Number, default: 0 } }, { timestamps: true });
export default mongoose.model('Cart', cartSchema);
