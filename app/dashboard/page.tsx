"use client";

import React, { useState, useEffect } from 'react';
import { 
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { useToast } from "@/hooks/use-toast";
import { analyticsApi } from '@/services/api/analyticsApi';
import { marketplaceApi } from '@/services/api/marketplace';
import { Order, Product } from '@/types/product';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
        recentOrders: [] as Order[],
        topProducts: [] as Product[]
  });
    const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
            try {
      setLoading(true);
                const [metrics, orders, products] = await Promise.all([
                    analyticsApi.getDashboardMetrics(),
                    marketplaceApi.getOrders(),
                    marketplaceApi.getProducts()
                ]);

          setStats({
                    totalSales: metrics.total_sales,
                    totalOrders: metrics.total_orders,
                    totalProducts: metrics.total_products,
                    recentOrders: orders.slice(0, 5),
                    topProducts: products.slice(0, 5)
                });
            } catch (e: any) {
                setError(e.message || 'Failed to fetch dashboard data');
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: e.message || 'Failed to fetch dashboard data',
                });
            } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    }, [toast]);

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
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Statistics Cards */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Sales
                            </Typography>
                            <Typography variant="h4">
                                ${stats.totalSales.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Orders
                            </Typography>
                            <Typography variant="h4">
                                {stats.totalOrders}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Products
                            </Typography>
                            <Typography variant="h4">
                                {stats.totalProducts}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

          {/* Recent Orders */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Orders
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Order ID</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.recentOrders.map((order: Order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>{order.status}</TableCell>
                                                <TableCell>${order.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

          {/* Top Products */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Top Products
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Sales</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.topProducts.map((product: Product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>{product.title}</TableCell>
                                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                                <TableCell>{product.sales_count || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
  );
}
