"use client";

import React, { useState } from "react";
// import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, ShoppingCart } from "lucide-react";
// import type { ProductBase } from "@/types/common";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn, formatPrice, getConditionInfo } from "../../../lib/utils";
import { useAppContext } from "../../AppContext";
import ChatUI from "../chat/ChatUI";
import type { ProductBase } from "@/types/product";
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
import { Favorite, FavoriteBorder, Chat } from '@mui/icons-material';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { marketplaceApi } from '@/services/api/marketplace';

interface ProductCardProps {
  product: ProductBase;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { wishlist, addToWishlist, removeFromWishlist, addToCart } =
    useAppContext();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const isInWishlist = wishlist.some((item) => item.id === product.id);

      if (isInWishlist) {
        await removeFromWishlist(product.id);
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

  const handleAddToCart = async () => {
    try {
      await marketplaceApi.addToCart(product.id);
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

  const handleChatToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = async () => {
    try {
      await marketplaceApi.sendMessage(product.id, message);
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

  const conditionInfo = getConditionInfo(product.condition);

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden">
            <div className="image-container w-[100%] h-[100%]">
                <img
                className="image "
                src={product.image_url || "/placeholder.jpg"}
                alt={product.title}
                />
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
              onClick={() => setShowChat(true)}
            >
              <Chat />
            </IconButton>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn("text-xs", `bg-${conditionInfo.color}-100 text-${conditionInfo.color}-800`)}
            >
              {conditionInfo.label}
            </Badge>
            {product.average_rating > 0 && (
              <div className="flex items-center text-sm text-yellow-500">
                ★ {product.average_rating.toFixed(1)}
              </div>
            )}
          </div>
          <h3 className="mb-1 text-lg font-semibold line-clamp-2">
            {product.title}
          </h3>
          <p className="mb-2 text-sm text-gray-500">
            by {product.student_name} in {product.category_name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              {formatPrice(product.price)}
            </span>
            {!product.available_stock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : (
              <Badge variant="secondary">{product.available_stock} left</Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex space-x-2">
          <Button
            className="flex-1"
            variant={product.available_stock ? "default" : "outline"}
            disabled={!product.available_stock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.available_stock ? "Add to Cart" : "Out of Stock"}
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
      </Link>

      {isChatOpen && (
        <div className="fixed bottom-20 right-4 z-50">
          <ChatUI
            productId={product.id}
            sellerId={product.student}
            productName={product.title}
          />
        </div>
      )}

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChat(false)}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
