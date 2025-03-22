'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    Button,
    Card,
    CardContent,
    CardMedia,
    IconButton
} from '@mui/material';
import { Delete, ShoppingCart } from '@mui/icons-material';
import { useToast } from "@/hooks/use-toast";
import { marketplaceApi } from '@/services/api/marketplace';
import { Product } from '@/types/product';

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true);
                const items = await marketplaceApi.getWishlist();
                setWishlistItems(items);
            } catch (e: any) {
                setError(e.message || 'Failed to fetch wishlist');
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: e.message || 'Failed to fetch wishlist',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [toast]);

    const handleRemoveFromWishlist = async (productId: string) => {
        try {
            await marketplaceApi.removeFromWishlist(productId);
            setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
            toast({
                description: 'Product removed from wishlist.'
            });
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message || 'Failed to remove product from wishlist',
            });
        }
    };

    const handleAddToCart = async (productId: string) => {
        try {
            await marketplaceApi.addToCart(productId);
            toast({
                description: 'Product added to cart.'
            });
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message || 'Failed to add product to cart',
            });
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box p={3} sx={{ mt: 10 }}>
            <Typography variant="h4" gutterBottom>
                My Wishlist
            </Typography>

            {wishlistItems.length === 0 ? (
                <Typography>Your wishlist is empty.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {wishlistItems.map((product: Product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.image_url}
                                    alt={product.title}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {product.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {product.description}
                                    </Typography>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        ${product.price.toFixed(2)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<ShoppingCart />}
                                            onClick={() => handleAddToCart(product.id)}
                                            fullWidth
                                        >
                                            Add to Cart
                                        </Button>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveFromWishlist(product.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}