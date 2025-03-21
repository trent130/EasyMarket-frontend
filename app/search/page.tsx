"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Typography, Grid, Card, CardContent, CardMedia, Button, Box, TextField, Select, MenuItem, FormControl, InputLabel, Slider } from '@mui/material';
import { ShoppingCart, Favorite, Search, FilterList } from '@mui/icons-material';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { Product, ProductSearchFilters, Category } from "@/types/product"
import { marketplaceApi } from '@/services/api/marketplace';
import { productService } from '@/services/api/products';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<ProductSearchFilters>({
        query: query || '',
        category: undefined,
        min_price: 0,
        max_price: 1000,
        sort_by: 'relevance',
        page: 1,
        page_size: 12
    });
    const [showFilters, setShowFilters] = useState(false);
    const { toast } = useToast()
    const router = useRouter()

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await productService.getCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (!filters.query && !filters.category) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const searchResults = await marketplaceApi.search({
                    query: filters.query,
                    category: filters.category,
                    min_price: filters.min_price,
                    max_price: filters.max_price,
                    sort_by: filters.sort_by,
                    page: filters.page
                });
                setProducts(searchResults.results);
            } catch (e: any) {
                setError(e.message || "Failed to fetch search results");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [filters]);

    const handleFilterChange = (field: keyof ProductSearchFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            query: e.currentTarget.value
        }));
    };

    const handleAddToCart = async (product: Product) => {
        try {
            await marketplaceApi.addToCart(product.id);
            toast({
                description: 'Product added to cart successfully.'
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
            await marketplaceApi.addToWishlist(product.id);
            toast({
                description: 'Product added to wishlist successfully.'
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
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Search Results {query && `for "${query}"`}
                </Typography>
                
                <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search products..."
                        value={filters.query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('query', e.target.value)}
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                    />
                </Box>

                <Button
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ mb: 2 }}
                >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>

                {showFilters && (
                    <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={filters.category || ''}
                                        label="Category"
                                        onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleFilterChange('category', e.target.value)}
                                    >
                                        <MenuItem value="">All Categories</MenuItem>
                                        {categories.map((category: Category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Sort By</InputLabel>
                                    <Select
                                        value={filters.sort_by || 'relevance'}
                                        label="Sort By"
                                        onChange={(e: React.ChangeEvent<{ value: unknown }>) => handleFilterChange('sort_by', e.target.value)}
                                    >
                                        <MenuItem value="relevance">Relevance</MenuItem>
                                        <MenuItem value="price_asc">Price: Low to High</MenuItem>
                                        <MenuItem value="price_desc">Price: High to Low</MenuItem>
                                        <MenuItem value="newest">Newest First</MenuItem>
                                        <MenuItem value="rating">Highest Rated</MenuItem>
                                        <MenuItem value="popularity">Most Popular</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography gutterBottom>Price Range</Typography>
                                <Slider
                                    value={[filters.min_price || 0, filters.max_price || 1000]}
                                    onChange={(_: Event, newValue: number | number[]) => {
                                        if (Array.isArray(newValue)) {
                                            handleFilterChange('min_price', newValue[0]);
                                            handleFilterChange('max_price', newValue[1]);
                                        }
                                    }}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={1000}
                                    step={10}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {loading && <Typography>Loading products...</Typography>}
                {error && <Typography color="error">{error}</Typography>}
                {products.length === 0 && !loading && !error ? (
                    <Typography>No products found matching your search.</Typography>
                ) : (
                    <Grid container spacing={4}>
                        {products.map((product: Product) => (
                            <Grid item key={product.id} xs={12} sm={6} md={4}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={product.image_url}
                                        alt={product.title}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {product.title}
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
            </Box>
        </Layout>
    );
}