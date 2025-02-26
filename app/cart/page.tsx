"use client";

import React, { useState, useEffect } from 'react';
import {
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Box,
    Divider,
    Grid,
    Card,
    CardContent,
    CardActions,
    Snackbar,
} from '@mui/material';
import { toast } from "@/hooks/use-toast"
import { marketplaceApi } from '@/services/api/marketplace';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        setLoading(true);
        setError(null);
        try {
            const cartData = await marketplaceApi.getCart();
            setCart(cartData.items);
        } catch (e: any) {
            setError(e.message || "Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromCart = async (productId: number) => {
        try {
            await marketplaceApi.removeFromCart(productId);
            setCart(prevCart => prevCart.filter(item => item.id !== productId));
            setSnackbarMessage('Item removed from cart');
            setOpenSnackbar(true);
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: e.message,
            })
        }

    };

    const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="cart-page lg:mt-20">
            <Typography variant="h4" gutterBottom>
                Your Shopping Cart
            </Typography>
            {loading && <Typography>Loading cart...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            {cart.length === 0 && !loading && !error ? (
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Your cart is empty
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ mt: 2 }}>
                            <CardContent>
                                <List>
                                    {cart.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`Quantity: ${item.quantity} - ${(item.price * item.quantity).toFixed(2)}`}
                                                />
                                                <Button onClick={() => handleRemoveFromCart(item.id)} color="secondary">
                                                    Remove
                                                </Button>
                                            </ListItem>
                                            <Divider />
                                        </React.Fragment>
                                    ))}
                                </List>
                            </CardContent>
                            <CardActions>
                                <Box sx={{ mt: 2, textAlign: 'right' }}>
                                    <Typography variant="h6">
                                        Total: ${totalPrice.toFixed(2)}
                                    </Typography>
                                    <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                                        Proceed to Checkout
                                    </Button>
                                </Box>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Order Summary
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemText primary="Subtotal" secondary={`${totalPrice.toFixed(2)}`} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Tax (8%)" secondary={`${(totalPrice * 0.08).toFixed(2)}`} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Total" secondary={`${(totalPrice * 1.08).toFixed(2)}`} />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                action={
                    <Button
                        color="secondary"
                        size="small"
                        onClick={(event) => handleCloseSnackbar(event, 'someReason')}
                    >
                        Close
                    </Button>
                }
            />
        </div>
    );
}