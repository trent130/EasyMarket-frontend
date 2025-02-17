"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Typography, Grid, Card, CardContent, CardMedia, Button, Box } from '@mui/material';
import { ShoppingCart, Favorite } from '@mui/icons-material';
import Layout from '../components/Layout';
import Link from 'next/link';
import { searchApi } from "@/services/api/searchApi";
import { productsApi } from "@/services/api/profileApi";
import { toast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { Product } from "@/types/common"


export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast()
    const router = useRouter()


    useEffect(() => {
        const performSearch = async () => {
            if (!query) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Use the searchApi to get the results
                const searchResults = await productsApi.getProducts(); //getProducts();
                if ("error" in searchResults) {
                  setError(searchResults.error)
                  setProducts([])
                }
                // Check for successful data retrieval
                setProducts(searchResults);
            } catch (e: any) {
                setError(e.message || "Failed to fetch search results");
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [query, router]);


    const handleAddToCart = async (product: Product) => {
        try {
            // use you functions for carts from the market place
            setProducts(prevProducts => prevProducts.filter(i => i.id !== product.id));
            toast({
                description: 'Success.'
            })
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: e.message,
            })
        }

    };

    const handleAddToWishlist = async (product: Product) => {
        try {
            //use here from the wishlist
            setProducts(prevProducts => prevProducts.filter(i => i.id !== product.id));
            toast({
                description: 'Sucess.'
            })
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: e.message,
            })
        }
    };

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>
                Search Results for "{query}"
            </Typography>
            {loading && <Typography>Loading products...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            {products.length === 0 && !loading && !error ? (
                <Typography>No products found matching your search.</Typography>
            ) : (
                <Grid container spacing={4}>
                    {products.map((product) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.image}
                                    alt={product.name}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {product.description}
                                    </Typography>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        ${product.price.toFixed(2)}
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<ShoppingCart />}
                                            onClick={() => handleAddToCart(product)}
                                            sx={{ mr: 1 }}
                                        >
                                            Add to Cart
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={<Favorite />}
                                            onClick={() => handleAddToWishlist(product)}
                                        >
                                            Wishlist
                                        </Button>
                                    </Box>
                                    <Button component={Link} href={`/product/${product.slug}`} sx={{ mt: 1 }}>
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Layout>
    );
}