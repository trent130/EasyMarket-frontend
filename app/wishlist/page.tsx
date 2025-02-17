'use client';

import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { Delete, ShoppingCart } from '@mui/icons-material';
import Layout from '../layout';
import { productsApi } from '@/services/api/products';
import { marketplaceApi } from '@/services/api/marketplace';
import { toast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';

interface WishlistItem {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
}

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        const fetchWishlist = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const wishlistData = await marketplaceApi.getWishlist()
                setWishlist(wishlistData);
            } catch (e: any) {
                setError(e.message || "Failed to load wishlist");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    const handleAddToCart = async (item: WishlistItem) => {
        try {
            await marketplaceApi.addToCart(item.id); // Add to cart
            setWishlist(prevWishlist => prevWishlist.filter(wishlistItem => wishlistItem.id !== item.id));
            toast({
                title: "Success",
                description: `${item.name} added to cart!`,
            })
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: e.message,
            })
        }
    };

    const handleRemoveFromWishlist = async (itemId: number) => {
        try {
            await marketplaceApi.removeFromWishlist(itemId);
            setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== itemId));
            toast({
                description: 'You have successfully removed the item from the wishlist.',
            })
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: e.message,
            })
        }

    };

    if (isLoading) {
        return <Layout><div>Loading wishlist...</div></Layout>;
    }

    if (error) {
        return <Layout><div>Error: {error}</div></Layout>;
    }

    return (
        <Layout>
            <Typography variant="h4" component="h1" className='mt-20' gutterBottom>
                Wishlist
            </Typography>
            {wishlist.length === 0 ? (
                <div className='mt-4'>
                    <Typography>Your wishlist is empty.</Typography>
                </div>
            ) : (
                <List>
                    {wishlist.map((item) => (
                        <ListItem key={item.id}>
                            <ListItemText
                                primary={item.name}
                                secondary={`$${item.price.toFixed(2)}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="add to cart"
                                    onClick={() => handleAddToCart(item)}
                                    sx={{ mr: 1 }}
                                >
                                    <ShoppingCart />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleRemoveFromWishlist(item.id)}
                                >
                                    <Delete />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}
        </Layout>
    );
}