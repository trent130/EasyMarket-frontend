"use client";

import React, { useState } from "react";
import Image from 'next/image';
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
// import type { ProductBase } from "@/types/common";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn, formatPrice, getConditionInfo } from "../../../lib/utils";
import { useAppContext } from "../../AppContext";
import ChatUI from "../chat/ChatUI";
import type { Product } from "@/types/api";
import {
    CardMedia,
    Typography,
    IconButton,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { Favorite, Chat } from '@mui/icons-material';
import { useToast } from "@/hooks/use-toast";
import { marketplaceApi } from '@/services/api/marketplace';

type ConditionInfo = {
  [K in Product['condition']]: {
    label: string;
    color: string;
  };
};

const conditionInfo: ConditionInfo = {
  new: { label: 'New', color: 'green' },
  like_new: { label: 'Like New', color: 'blue' },
  good: { label: 'Good', color: 'yellow' },
  fair: { label: 'Fair', color: 'orange' },
  poor: { label: 'Poor', color: 'red' },
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { wishlist, addToWishlist, removeFromWishlist } = useAppContext();
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
      const isInWishlist = wishlist.some((item) => item.id === productId);

      if (isInWishlist) {
        await removeFromWishlist(productId);
        toast({
          description: 'Product removed from wishlist.'
        });
      } else {
        await addToWishlist(product);
        toast({
          description: 'Product added to wishlist.'
        });
      }
      setIsWishlisted(!isInWishlist);
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
      await marketplaceApi.addToCart(productId);
      toast({
        description: 'Product added to cart.'
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: e.message,
      });
    }
  };

  const handleSendMessage = async () => {
    try {
      const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
      await marketplaceApi.sendMessage(productId, message);
      toast({
        description: 'Message sent successfully.'
      });
      setShowChat(false);
      setMessage('');
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: e.message,
      });
    }
  };

  const info = conditionInfo[product.condition];
  const stock = product.available_stock ?? product.stock ?? 0;

  return (
    <Link href={`/product/${product.slug}`} className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <Image
          src={product.image_url || product.imageUrl || "/placeholder.jpg"}
          alt={product.title || product.name || 'Product image'}
          width={400}
          height={400}
          className="object-cover object-center group-hover:opacity-75 transition-opacity"
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full bg-${info.color}-100 text-${info.color}-800`}>
            {info.label}
          </span>
          {(product.average_rating || product.rating) && (
            <div className="flex items-center text-sm text-yellow-500">
              ★ {((product.average_rating || product.rating) || 0).toFixed(1)}
            </div>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {product.title || product.name || 'Untitled Product'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          by {product.student_name} in {product.category_name}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-semibold text-primary">
            ${typeof product.price === 'string' ? product.price : product.price.toFixed(2)}
          </p>
          {!stock ? (
            <span className="text-sm text-red-600 dark:text-red-400">Out of Stock</span>
          ) : (
            <span className="text-sm text-green-600 dark:text-green-400">
              {stock} left
            </span>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <IconButton
          color={isWishlisted ? 'error' : 'default'}
          onClick={handleWishlistToggle}
        >
          <Favorite />
        </IconButton>
        <IconButton
          color="primary"
          onClick={(e) => {
            e.preventDefault();
            setShowChat(true);
          }}
        >
          <Chat />
        </IconButton>
      </div>

      <CardFooter className="p-4 pt-0 flex space-x-2">
        <Button
          className="flex-1"
          variant={stock > 0 ? "default" : "outline"}
          disabled={!stock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/product/${product.slug}`;
          }}
        >
          View Details
        </Button>
      </CardFooter>

      <Dialog open={showChat} onClose={() => setShowChat(false)}>
        <DialogTitle>Send Message to Seller</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChat(false)}>Cancel</Button>
          <Button onClick={handleSendMessage}>Send</Button>
        </DialogActions>
      </Dialog>
    </Link>
  );
}
