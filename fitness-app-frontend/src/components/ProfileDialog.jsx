import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, MenuItem, Grid, Typography, Alert, CircularProgress,
    Box, Avatar, IconButton, Stack, Tooltip
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { getUserProfile, updateUserProfile } from '../store/api';

const ProfileDialog = ({ open, onClose, onProfileUpdated }) => {
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        weight: '',
        height: '',
        age: '',
        gender: 'Male',
        fitnessGoal: 'MAINTENANCE',
        targetDailyCalories: 500,
        profilePictureUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setLoading(true);
            setError(null);
            setSuccess(false);
            getUserProfile()
                .then((res) => {
                    if (res?.data) {
                        const d = res.data;
                        const avatar = d.profilePictureUrl || localStorage.getItem('userAvatar') || '';
                        setProfile({
                            firstName: d.firstName || '',
                            lastName: d.lastName || '',
                            weight: d.weight !== null && d.weight !== undefined ? d.weight : '',
                            height: d.height !== null && d.height !== undefined ? d.height : '',
                            age: d.age !== null && d.age !== undefined ? d.age : '',
                            gender: d.gender || 'Male',
                            fitnessGoal: d.fitnessGoal || 'MAINTENANCE',
                            targetDailyCalories: d.targetDailyCalories || 500,
                            profilePictureUrl: avatar
                        });
                        if (d.weight) localStorage.setItem('userWeight', d.weight);
                        if (avatar) localStorage.setItem('userAvatar', avatar);
                    }
                })
                .catch((err) => console.warn('Could not load profile:', err))
                .finally(() => setLoading(false));
        }
    }, [open]);

    // Handle Image file selection & compression
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (PNG, JPG, WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 256;
                const MAX_HEIGHT = 256;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setProfile((prev) => ({ ...prev, profilePictureUrl: dataUrl }));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setProfile((prev) => ({ ...prev, profilePictureUrl: '' }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const payload = {
                firstName: profile.firstName?.trim() || '',
                lastName: profile.lastName?.trim() || '',
                weight: profile.weight ? parseFloat(profile.weight) : null,
                height: profile.height ? parseFloat(profile.height) : null,
                age: profile.age ? parseInt(profile.age, 10) : null,
                gender: profile.gender,
                fitnessGoal: profile.fitnessGoal,
                targetDailyCalories: profile.targetDailyCalories ? parseInt(profile.targetDailyCalories, 10) : 500,
                profilePictureUrl: profile.profilePictureUrl || ''
            };
            const res = await updateUserProfile(payload);
            if (payload.weight) localStorage.setItem('userWeight', payload.weight);
            if (payload.profilePictureUrl) {
                localStorage.setItem('userAvatar', payload.profilePictureUrl);
            } else {
                localStorage.removeItem('userAvatar');
            }
            setSuccess(true);
            if (onProfileUpdated) onProfileUpdated(res.data);
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const isInitialSetup = !profile.weight || !profile.height || !profile.age;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3.5 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountCircleIcon sx={{ color: '#7e22ce' }} />
                <span>Athlete Profile & Biometrics</span>
            </DialogTitle>
            <Box component="form" onSubmit={handleSave}>
                <DialogContent dividers sx={{ p: 3 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}
                    
                    {isInitialSetup && (
                        <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 2.5, borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight="bold">
                                Complete your biometrics setup!
                            </Typography>
                            <Typography variant="caption">
                                Entering your actual weight, height, and goal enables accurate MET calorie calculations and customized AI coaching.
                            </Typography>
                        </Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={2.5}>
                            {/* Profile Photo Upload Section */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                                    <Avatar
                                        src={profile.profilePictureUrl || undefined}
                                        sx={{ width: 72, height: 72, bgcolor: '#7e22ce', fontSize: '1.8rem', fontWeight: 'bold', border: '2px solid white', boxShadow: 2 }}
                                    >
                                        {(profile.firstName ? profile.firstName.charAt(0) : 'A').toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                            Profile Photo
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                            Upload a personal avatar to show on the leaderboard and dashboard.
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                size="small"
                                                startIcon={<PhotoCameraIcon />}
                                                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
                                            >
                                                Upload Photo
                                                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                            </Button>
                                            {profile.profilePictureUrl && (
                                                <Button
                                                    variant="text"
                                                    color="error"
                                                    size="small"
                                                    onClick={handleRemoveImage}
                                                    startIcon={<DeleteIcon />}
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* First & Last Name */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="First Name"
                                    placeholder="e.g. Rohan"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Last Name"
                                    placeholder="e.g. Sharma"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                />
                            </Grid>

                            {/* Weight & Height */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Weight (kg)"
                                    type="number"
                                    placeholder="e.g. 72.5"
                                    inputProps={{ min: 30, max: 250, step: 0.5 }}
                                    value={profile.weight}
                                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                    helperText="Required for MET calorie burn formulas"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Height (cm)"
                                    type="number"
                                    placeholder="e.g. 178"
                                    inputProps={{ min: 100, max: 250 }}
                                    value={profile.height}
                                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                    helperText="Used for BMI calculations"
                                />
                            </Grid>

                            {/* Age & Gender */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Age (years)"
                                    type="number"
                                    placeholder="e.g. 24"
                                    inputProps={{ min: 12, max: 120 }}
                                    value={profile.age}
                                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    select
                                    label="Gender"
                                    value={profile.gender}
                                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </TextField>
                            </Grid>

                            {/* Fitness Goal & Target Daily Calories */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    select
                                    label="Primary Fitness Goal"
                                    value={profile.fitnessGoal}
                                    onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value })}
                                >
                                    <MenuItem value="WEIGHT_LOSS">🔥 Weight Loss / Calorie Deficit</MenuItem>
                                    <MenuItem value="MUSCLE_BUILDING">💪 Muscle Hypertrophy / Bulk</MenuItem>
                                    <MenuItem value="ENDURANCE">🏃 Cardiovascular & Stamina</MenuItem>
                                    <MenuItem value="MAINTENANCE">⚖️ General Health & Maintenance</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Target Daily Burn (kcal)"
                                    type="number"
                                    inputProps={{ min: 100, max: 3000, step: 50 }}
                                    value={profile.targetDailyCalories}
                                    onChange={(e) => setProfile({ ...profile, targetDailyCalories: e.target.value })}
                                    helperText="Your daily exercise calorie burn goal"
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, px: 3 }}>
                    <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 'bold' }}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={saving || loading}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', bgcolor: '#7e22ce', '&:hover': { bgcolor: '#6b21a8' } }}
                    >
                        {saving ? <CircularProgress size={22} color="inherit" /> : 'Save Profile & Biometrics'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default ProfileDialog;
