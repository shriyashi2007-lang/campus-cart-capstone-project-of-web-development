import Wishlist from '../models/Wishlist.js';
export async function getWishlist(req,res){const value=await Wishlist.findOne({user:req.user._id}).populate('products','name image price stock').lean();res.json({success:true,data:value||{user:req.user._id,products:[]}})}
export async function addWishlist(req,res){const value=await Wishlist.findOneAndUpdate({user:req.user._id},{$addToSet:{products:req.body.productId}},{upsert:true,new:true}).populate('products','name image price stock');res.json({success:true,data:value})}
export async function removeWishlist(req,res){const value=await Wishlist.findOneAndUpdate({user:req.user._id},{$pull:{products:req.params.productId}},{new:true}).populate('products','name image price stock');res.json({success:true,data:value||{products:[]}})}
