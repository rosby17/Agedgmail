import { sanitizeDescriptionHtml, displayCategoryLabel, cleanProductName } from '../utils/helpers';
import { Package, Minus, Plus, ShieldAlert } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Share2, Copy, CheckCircle, Info, Hash, Star } from 'lucide-react';
import { hashStr, getProductDetails } from '../utils/helpers';
import ProductVisual from '../components/ui/ProductVisual';

const ProductView = ({ product, addToCart, navigate, onCartClick, onBuyNow, lang }) => {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">

        <div className="bg-gray-50/50 rounded-[2rem] aspect-[4/3] max-h-[360px] flex items-center justify-center border border-gray-100 overflow-hidden relative">
          <div className="w-full h-full flex items-center justify-center p-10">
            <ProductVisual product={product} iconSize={64} />
          </div>
          {product.name.includes('US') && product.category === 'email' && <div className="absolute bottom-5 right-5 bg-primary text-white dark:text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm">US ACCOUNT</div>}
        </div>

        <div className="flex flex-col justify-center">
          <nav className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">
            <button onClick={() => navigate('')} className="hover:text-primary">HOME</button>
            <span>/</span>
            <span className="text-primary">{displayCategoryLabel(product)}</span>
          </nav>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">{cleanProductName(product.name, lang)}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
              <Package size={14} /> In stock ({product.stock})
            </div>
            <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
              {displayCategoryLabel(product)}
            </div>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-8 tracking-tight flex items-baseline gap-1">
            <span className="text-lg text-gray-400 font-bold">$</span>{product.price.toFixed(2)}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
              <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 border border-gray-200/50">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-200/50"><Minus size={16} /></button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1) setQuantity(Math.min(val, product.stock));
                  }}
                  className="w-20 bg-transparent text-center font-black text-xl outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => quantity < product.stock && setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-200/50"><Plus size={16} /></button>
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={() => onBuyNow(product)}
                disabled={product.stock <= 0}
                className={`flex-grow h-20 rounded-[2rem] font-black text-2xl transition-all shadow-2xl uppercase tracking-widest flex items-center justify-center gap-4 ${product.stock > 0 ? 'bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-primary/30 hover:scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {product.stock > 0 ? 'Buy now' : 'Out of stock'}
              </button>
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  onCartClick();
                }}
                disabled={product.stock <= 0}
                title="Add to cart"
                className={`w-20 h-20 shrink-0 rounded-[2rem] flex items-center justify-center transition-all border-2 ${product.stock <= 0 ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'}`}
              >
                <ShoppingCart size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Details */}
      <div className="border-t border-gray-100 pt-20">
        <div className="flex gap-10 border-b border-gray-100 mb-12 overflow-x-auto pb-4">
          {['Information', 'Warranty policy'].map((tab, i) => (
            <button key={tab} className={`text-sm font-black uppercase tracking-[0.2em] pb-4 relative whitespace-nowrap transition-colors ${i === 0 ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab}
              {i === 0 && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Information</h3>
              <div className="divide-y divide-gray-200/70">
                {product.details?.info?.split(' | ').map((line, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-gray-500 font-medium">{line.split(' : ')[0]}</span>
                    <span className="text-gray-900 font-bold">{line.split(' : ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4"><Info size={14} className="text-primary" /> Additional Description</h4>
              {product.description ? (
                <div
                  className="text-gray-600 leading-relaxed text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-gray-900 [&_u]:underline"
                  dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(product.description) }}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed italic text-sm">{product.details?.note}</p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4"><ShieldAlert size={14} className="text-primary" /> Terms of Service</h4>
              <div className="text-xs text-gray-500 leading-relaxed space-y-3">
                {product.details?.terms?.split('. ').map((t, i) => <p key={i}>• {t}.</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;