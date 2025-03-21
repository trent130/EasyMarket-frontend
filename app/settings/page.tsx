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
    Divider,
    Tabs,
    Tab,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api/auth';
import { marketplaceApi } from '@/services/api/marketplace';

interface UserSettings {
    email_notifications: boolean;
    push_notifications: boolean;
    dark_mode: boolean;
    language: string;
    currency: string;
    timezone: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<UserSettings>({
        email_notifications: true,
        push_notifications: true,
        dark_mode: false,
        language: 'en',
        currency: 'USD',
        timezone: 'UTC'
    });
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const userSettings = await authApi.getSettings();
                setSettings(userSettings);
            } catch (e: any) {
                setError(e.message || 'Failed to fetch settings');
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: e.message || 'Failed to fetch settings',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [toast]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSettingChange = (setting: keyof UserSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const handleSave = async () => {
        try {
            await authApi.updateSettings(settings);
            toast({
                description: 'Settings saved successfully.'
            });
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message || 'Failed to save settings',
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
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>

            <Card>
                <CardContent>
                    <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                        <Tab label="Account" />
                        <Tab label="Notifications" />
                        <Tab label="Security" />
                        <Tab label="Payment" />
                        <Tab label="Appearance" />
                        <Tab label="Language" />
                    </Tabs>

                    <Grid container spacing={3}>
                        {activeTab === 0 && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        value={settings.username}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={settings.email}
                                        disabled
                                    />
                                </Grid>
                            </>
                        )}

                        {activeTab === 1 && (
                            <>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.email_notifications}
                                                onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                                            />
                                        }
                                        label="Email Notifications"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.push_notifications}
                                                onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                                            />
                                        }
                                        label="Push Notifications"
                                    />
                                </Grid>
                            </>
                        )}

                        {activeTab === 2 && (
                            <>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.two_factor_enabled}
                                                onChange={(e) => handleSettingChange('two_factor_enabled', e.target.checked)}
                                            />
                                        }
                                        label="Two-Factor Authentication"
                                    />
                                </Grid>
                            </>
                        )}

                        {activeTab === 3 && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Payment Methods
                                    </Typography>
                                    <Button variant="outlined" color="primary">
                                        Add Payment Method
                                    </Button>
                                </Grid>
                            </>
                        )}

                        {activeTab === 4 && (
                            <>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.dark_mode}
                                                onChange={(e) => handleSettingChange('dark_mode', e.target.checked)}
                                            />
                                        }
                                        label="Dark Mode"
                                    />
                                </Grid>
                            </>
                        )}

                        {activeTab === 5 && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Language</InputLabel>
                                        <Select
                                            value={settings.language}
                                            label="Language"
                                            onChange={(e) => handleSettingChange('language', e.target.value)}
                                        >
                                            <MenuItem value="en">English</MenuItem>
                                            <MenuItem value="es">Spanish</MenuItem>
                                            <MenuItem value="fr">French</MenuItem>
                                            <MenuItem value="de">German</MenuItem>
                                            <MenuItem value="it">Italian</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Currency</InputLabel>
                                        <Select
                                            value={settings.currency}
                                            label="Currency"
                                            onChange={(e) => handleSettingChange('currency', e.target.value)}
                                        >
                                            <MenuItem value="USD">USD</MenuItem>
                                            <MenuItem value="EUR">EUR</MenuItem>
                                            <MenuItem value="GBP">GBP</MenuItem>
                                            <MenuItem value="JPY">JPY</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                    onClick={handleSave}
                  >
                    Save Changes
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
  );
}
