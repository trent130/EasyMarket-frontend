'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Grid, Box, Typography, Pagination, CircularProgress } from '@mui/material';
import { Product, ProductSearchFilters, Category } from '@/types/product';
import { marketplaceApi } from '@/services/api/marketplace';
import { productService } from '@/services/api/products';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';
import debounce from 'lodash/debounce';

interface ProductListProps {
    initialProducts?: Product[];
    initialCategories?: Category[];
}

/**
 * A page that displays a list of products with filters and pagination.
 *
 * This page will load the categories on mount and the products with the current filters on mount and
 * whenever the filters change. The filters are stored in the URL as query parameters.
 *
 * The page also handles pagination by displaying a pagination component at the bottom of the page.
 *
 * @returns A React component that displays a list of products with filters and pagination.
 */
export default function ProductList({ initialProducts = [], initialCategories = [] }: ProductListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ProductSearchFilters>({
        query: searchParams.get('q') || '',
        category: searchParams.get('category') || undefined,
        min_price: Number(searchParams.get('min_price')) || 0,
        max_price: Number(searchParams.get('max_price')) || 1000,
        condition: searchParams.get('condition') as Product['condition'] || undefined,
        in_stock: searchParams.get('in_stock') === 'true',
        sort_by: searchParams.get('sort_by') || 'relevance',
        page: Number(searchParams.get('page')) || 1,
        page_size: 12
    });

    // Load categories if not provided
    useEffect(() => {
        const loadCategories = async () => {
            if (categories.length === 0) {
                try {
                    const categoriesData = await productService.getCategories();
                    setCategories(categoriesData);
                } catch (error) {
                    console.error('Failed to fetch categories:', error);
                }
            }
        };
        loadCategories();
    }, [categories.length]);

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce(async (searchFilters: ProductSearchFilters) => {
            setLoading(true);
            setError(null);
            try {
                const searchResults = await marketplaceApi.search(searchFilters);
                setProducts(searchResults.results);
            } catch (e: any) {
                setError(e.message || 'Failed to fetch products');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    // Update URL with current filters
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.set(key, value.toString());
            }
        });
        router.push(`?${params.toString()}`);
    }, [filters, router]);

    // Load products when filters change
    useEffect(() => {
        debouncedSearch(filters);
    }, [filters, debouncedSearch]);

    const handleFilterChange = (newFilters: Partial<ProductSearchFilters>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: 1 // Reset to first page when filters change
        }));
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setFilters(prev => ({
            ...prev,
            page: value
        }));
    };

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <ProductFilter
                        categories={categories}
                        filters={filters}
                        onChange={handleFilterChange}
                    />
                </Grid>
                <Grid item xs={12} md={9}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : products.length === 0 ? (
                        <Typography>No products found matching your criteria.</Typography>
                    ) : (
                        <>
                            <Grid container spacing={3}>
                                {products.map((product: Product) => (
                                    <Grid item key={product.id} xs={12} sm={6} md={4}>
                                        <ProductCard product={product} />
                                    </Grid>
                                ))}
                            </Grid>
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Pagination
                                    count={Math.ceil(products.length / filters.page_size)}
                                    page={filters.page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        </>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
