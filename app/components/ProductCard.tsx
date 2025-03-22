'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            className="object-cover object-center group-hover:opacity-75 transition-opacity"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{product.name}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 dark:text-green-400">In Stock</span>
            ) : (
              <span className="text-sm text-red-600 dark:text-red-400">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}; 