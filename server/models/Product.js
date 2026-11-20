import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  productKey: { type: String, required: true, unique: true, index: true }, name: { type: String, required: true, trim: true }, description: String,
  price: { type: Number, required: true, min: 0 }, originalPrice: { type: Number, min: 0 }, discount: { type: Number, min: 0, max: 100 },
  department: { type: String, required: true, index: true }, category: { type: String, required: true, index: true }, image: String,
  rating: { type: Number, min: 0, max: 5, default: 0 }, reviews: { type: Number, min: 0, default: 0 }, stock: { type: Number, required: true, min: 0 }, featured: Boolean, tags: [String]
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); productSchema.index({ department: 1, category: 1 }); productSchema.index({ price: 1 }); productSchema.index({ featured: 1 });
export default mongoose.model('Product', productSchema);
