"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Grid,
    CircularProgress,
    Switch,
    FormControlLabel,
    Divider
} from '@mui/material';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api/auth';
import { marketplaceApi } from '@/services/api/marketplace';

interface UserProfile {
    id: string;
    username: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    two_factor_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export default function UserProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const userProfile = await authApi.getProfile();
                setProfile(userProfile);
                setFormData({
                    name: userProfile.name || '',
                    email: userProfile.email || '',
                    phone: userProfile.phone || '',
                    address: userProfile.address || ''
                });
            } catch (e: any) {
                setError(e.message || 'Failed to fetch profile');
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: e.message || 'Failed to fetch profile',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authApi.updateProfile(formData);
            setProfile(prev => prev ? { ...prev, ...formData } : null);
            setIsEditing(false);
            toast({
                description: 'Profile updated successfully.'
            });
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message || 'Failed to update profile',
            });
        }
    };

    const handleTwoFactorToggle = async () => {
        try {
            if (profile?.two_factor_enabled) {
                await authApi.disableTwoFactor();
                toast({
                    description: 'Two-factor authentication disabled.'
                });
            } else {
                await authApi.enableTwoFactor();
                toast({
                    description: 'Two-factor authentication enabled.'
                });
            }
            setProfile(prev => prev ? {
                ...prev,
                two_factor_enabled: !prev.two_factor_enabled
            } : null);
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message || 'Failed to update two-factor authentication',
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

    if (!profile) {
    return (
            <Box p={3}>
                <Typography>Profile not found.</Typography>
            </Box>
    );
  }

  return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Profile Settings
            </Typography>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={profile.username}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    multiline
                                    rows={3}
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={profile.two_factor_enabled}
                                            onChange={handleTwoFactorToggle}
                                        />
                                    }
                                    label="Two-Factor Authentication"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                {isEditing ? (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setIsEditing(true)}
          >
            Edit Profile
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}