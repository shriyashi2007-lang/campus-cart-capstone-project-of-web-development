export const formatINR=(value)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
export const discountPercent=(price,original)=>original?Math.round((1-price/original)*100):0;
