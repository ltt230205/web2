import React from 'react'
import { formatPrice, imageUrl } from '../services/catalog'

export default function ProductCard({ product, showTag = false }) {
  return (
    <a href={`/products/${product.id}`} className="group block bg-white">
      <div className="relative aspect-[3/4] overflow-hidden rounded bg-gray-100">
        <img
          src={imageUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-sm bg-red-600 px-2 py-1 text-xs font-bold text-white">
            -{product.discount}%
          </span>
        )}
        {showTag && (
          <span className="absolute bottom-3 left-3 rounded-sm bg-white/95 px-3 py-1 text-xs font-bold text-[#14315f]">
            {product.tag}
          </span>
        )}
      </div>
      <div className="pt-3">
        <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold text-gray-800">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="font-bold text-red-600">{formatPrice(product.price)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          {product.colors?.slice(0, 4).map((color) => (
            <span
              key={color}
              className="h-4 w-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </a>
  )
}
