"use client";

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Button,
    IconButton,
    Drawer,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { FilterList, X } from 'lucide-react/dist/esm/icons';
import { ProductSearchFilters, Category, ProductCondition } from '@/types/product';

interface ProductFilterProps {
    categories: Category[];
    filters: ProductSearchFilters;
    onChange: (filters: Partial<ProductSearchFilters>) => void;
}

const conditions: { value: ProductCondition; label: string }[] = [
        { value: 'new', label: 'New' },
        { value: 'like_new', label: 'Like New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
];

export default function ProductFilter({ categories, filters, onChange }: ProductFilterProps) {
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handlePriceChange = (_: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            onChange({
                min_price: newValue[0],
                max_price: newValue[1]
            });
        }
    };

    const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        onChange({ category: event.target.value as string });
    };

    const handleConditionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        onChange({ condition: event.target.value as ProductCondition });
    };

    const handleInStockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ in_stock: event.target.checked });
    };

    const clearFilters = () => {
        onChange({
            category: undefined,
            min_price: 0,
            max_price: 1000,
            condition: undefined,
            in_stock: false
        });
    };

    const FilterContent = () => (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Filters
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Price Range</Typography>
                <Slider
                    value={[filters.min_price || 0, filters.max_price || 1000]}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    step={10}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>${filters.min_price || 0}</Typography>
                    <Typography>${filters.max_price || 1000}</Typography>
                </Box>
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                    value={filters.category || ''}
                    label="Category"
                    onChange={handleCategoryChange}
                >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category: Category) => (
                        <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Condition</InputLabel>
                <Select
                            value={filters.condition || ''}
                    label="Condition"
                    onChange={handleConditionChange}
                        >
                    <MenuItem value="">All Conditions</MenuItem>
                            {conditions.map((condition) => (
                        <MenuItem key={condition.value} value={condition.value}>
                            {condition.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControlLabel
                control={
                    <Switch
                        checked={filters.in_stock || false}
                        onChange={handleInStockChange}
                    />
                }
                label="In Stock Only"
                sx={{ mb: 2 }}
            />

                    <Button
                variant="outlined"
                color="secondary"
                onClick={clearFilters}
                fullWidth
                    >
                        Clear Filters
                    </Button>
        </Box>
    );

    if (isMobile) {
        return (
            <>
                <IconButton
                    onClick={() => setShowFilterMenu(true)}
                    sx={{ mb: 2 }}
                >
                    <FilterList />
                </IconButton>
                <Drawer
                    anchor="right"
                    open={showFilterMenu}
                    onClose={() => setShowFilterMenu(false)}
                >
                    <Box sx={{ width: 300 }}>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">Filters</Typography>
                            <IconButton onClick={() => setShowFilterMenu(false)}>
                                <X />
                            </IconButton>
                        </Box>
                        <FilterContent />
                    </Box>
                </Drawer>
            </>
        );
    }

    return <FilterContent />;
}
