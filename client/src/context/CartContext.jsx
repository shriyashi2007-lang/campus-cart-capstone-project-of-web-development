import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/http';
import { products as catalog } from '../data/products';
const CartContext = createContext(null);
const guestKey = 'campusCart.cart.v1';
export function CartProvider({ children }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(false); const token = localStorage.getItem('campusCart.token.v1');
  const load = async () => { if (!localStorage.getItem('campusCart.token.v1')) { try { const saved=JSON.parse(localStorage.getItem(guestKey)||'[]'); setItems(saved.map(i=>({...i,product:catalog.find(p=>p.id===i.productId)})).filter(i=>i.product)); } catch { setItems([]); } return; } setLoading(true); try { const r=await api.get('/cart'); setItems((r.data.items||[]).map(i=>({productId:i.product?._id||i.product,quantity:i.quantity,product:i.product}))); } catch { setItems([]); } finally { setLoading(false); } };
  useEffect(()=>{load(); const f=()=>load(); window.addEventListener('campusCart:auth',f); return()=>window.removeEventListener('campusCart:auth',f)},[]);
  const addItem=async(id,q=1)=>{ if(localStorage.getItem('campusCart.token.v1')) { const p=items.find(i=>i.productId===id)?.product||catalog.find(x=>x.id===id); const r=await api.post('/cart/add',{productId:p?._id||id,quantity:q}); setItems((r.data.items||[]).map(i=>({productId:i.product?._id||i.product,quantity:i.quantity,product:i.product}))); } else { const p=catalog.find(x=>x.id===id); if(!p)return; setItems(v=>{const next=v.some(x=>x.productId===id)?v.map(x=>x.productId===id?{...x,quantity:x.quantity+q}:x):[...v,{productId:id,quantity:q,product:p}];localStorage.setItem(guestKey,JSON.stringify(next.map(({product,...rest})=>rest)));return next})} };
  const setQuantity=async(id,q)=>{if(localStorage.getItem('campusCart.token.v1')){const r=await api.patch(`/cart/${id}`,{quantity:q});setItems((r.data.items||[]).map(i=>({productId:i.product?._id||i.product,quantity:i.quantity,product:i.product})));}else setItems(v=>v.map(i=>i.productId===id?{...i,quantity:q}:i))};
  const removeItem=async id=>{if(localStorage.getItem('campusCart.token.v1')){const r=await api.delete(`/cart/${id}`);setItems((r.data.items||[]).map(i=>({productId:i.product?._id||i.product,quantity:i.quantity,product:i.product})));}else setItems(v=>v.filter(i=>i.productId!==id))};
  const clearCart=async()=>{if(localStorage.getItem('campusCart.token.v1'))await api.delete('/cart/clear');setItems([]);localStorage.removeItem(guestKey)};
  const value=useMemo(()=>{const detailed=items.filter(i=>i.product);const subtotal=detailed.reduce((s,i)=>s+(i.product.price||0)*i.quantity,0);return {items:detailed,loading,cartCount:detailed.reduce((s,i)=>s+i.quantity,0),subtotal,deliveryFee:subtotal>=499||!subtotal?0:40,total:subtotal+(subtotal>=499||!subtotal?0:40),addItem,setQuantity,removeItem,clearCart}},[items,loading]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart=()=>useContext(CartContext);
