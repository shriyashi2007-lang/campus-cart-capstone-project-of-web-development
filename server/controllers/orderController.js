import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export async function createOrder(req, res) {
  const shippingAddress = req.body.shippingAddress;
  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.addressLine1 || !shippingAddress?.city || !shippingAddress?.postalCode) return res.status(400).json({ success: false, message: 'Complete shipping details are required.' });
  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: req.user._id }).session(session).lean();
      if (!cart?.items?.length) { const e = new Error('Cart is empty.'); e.status = 400; throw e; }
      const ids = cart.items.map(item => item.product);
      const products = await Product.find({ _id: { $in: ids } }).session(session).lean();
      const byId = new Map(products.map(p => [String(p._id), p]));
      const items = cart.items.map(item => ({ product: item.product, name: byId.get(String(item.product))?.name, price: byId.get(String(item.product))?.price, quantity: item.quantity }));
      if (items.some(item => !item.name)) { const e = new Error('One or more products are unavailable.'); e.status = 409; throw e; }
      for (const item of items) { const result = await Product.updateOne({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }).session(session); if (result.modifiedCount !== 1) { const e = new Error('Insufficient stock for one or more products.'); e.status = 409; throw e; } }
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      [order] = await Order.create([{ user: req.user._id, items, shippingAddress, totalAmount }], { session });
      await Cart.updateOne({ user: req.user._id }, { $set: { items: [], totalAmount: 0 } }).session(session);
    });
    return res.status(201).json({ success: true, data: order });
  } catch (error) { return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Could not create order.' }); } finally { await session.endSession(); }
}
export async function listOrders(req, res) { const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(); res.json({ success: true, data: { orders } }); }
export async function getOrder(req, res) { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid order id.' }); const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean(); if (!order) return res.status(404).json({ success: false, message: 'Order not found.' }); res.json({ success: true, data: order }); }
