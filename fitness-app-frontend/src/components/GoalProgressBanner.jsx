import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, Grid,
    CircularProgress, Chip, Stack, Avatar, Button, Tooltip
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getUserProfile, getActivityStats } from '../store/api';

const GoalProgressBanner = ({ refreshKey, onOpenProfile }) => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([getUserProfile(), getActivityStats()])
            .then(([profRes, statsRes]) => {
                if (profRes.status === 'fulfilled' && profRes.value?.data) {
                    setProfile(profRes.value.data);
                }
                if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
                    setStats(statsRes.value.data);
                }
            })
            .catch((err) => console.warn('Goal banner error:', err))
            .finally(() => setLoading(false));
    }, [refreshKey]);

    const targetCalories = profile?.dailyCalorieGoal || profile?.targetDailyCalories || 400;
    const weight = profile?.weight || 70;
    const height = profile?.height || 175;
    const age = profile?.age || 25;

    // Calculate today's calories from weekly trend (last element is today)
    const weeklyTrend = stats?.weeklyCalorieTrend || [];
    const todayStat = weeklyTrend.length > 0 ? weeklyTrend[weeklyTrend.length - 1] : { calories: 0, count: 0 };
    const todayCalories = todayStat?.calories || 0;
    const todayCount = todayStat?.count || 0;

    const progressPercent = Math.min(100, Math.round((todayCalories / targetCalories) * 100));

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    let bmiCategory = 'Normal / Optimal';
    let bmiColor = '#10B981';
    if (bmi < 18.5) {
        bmiCategory = 'Underweight';
        bmiColor = '#3B82F6';
    } else if (bmi >= 25 && bmi < 30) {
        bmiCategory = 'Athletic / Overweight';
        bmiColor = '#F59E0B';
    } else if (bmi >= 30) {
        bmiCategory = 'High BMI';
        bmiColor = '#EF4444';
    }

    // Estimated BMR (Mifflin-St Jeor)
    const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + (profile?.gender === 'Female' ? -161 : 5));

    // Calculate streak dynamically from stats backend
    const currentStreak = stats?.currentStreak !== undefined ? stats.currentStreak : 0;

    return (
        <Card
            sx={{
                mb: 3,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #090e1a 0%, #172554 45%, #1e1b4b 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Subtle ambient glow */}
            <Box sx={{
                position: 'absolute',
                right: { xs: '-40px', md: '150px' },
                top: 0,
                bottom: 0,
                width: 250,
                opacity: 0.12,
                background: 'radial-gradient(circle, #38BDF8 10%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Grid container spacing={3} alignItems="center">
                    {/* 1. Daily Burn Progress */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={100}
                                    size={80}
                                    thickness={5}
                                    sx={{ color: 'rgba(255, 255, 255, 0.12)' }}
                                />
                                <CircularProgress
                                    variant="determinate"
                                    value={progressPercent}
                                    size={80}
                                    thickness={5}
                                    sx={{
                                        color: progressPercent >= 100 ? '#10B981' : '#F97316',
                                        position: 'absolute',
                                        left: 0,
                                        strokeLinecap: 'round'
                                    }}
                                />
                                <Box
                                    sx={{
                                        top: 0, left: 0, bottom: 0, right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Typography variant="h6" component="div" fontWeight="800" sx={{ lineHeight: 1 }}>
                                        {progressPercent}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.62rem', opacity: 0.75, fontWeight: 'bold' }}>
                                        OF GOAL
                                    </Typography>
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, color: '#F97316', fontWeight: 'bold' }}>
                                    🔥 Today's Energy Expenditure
                                </Typography>
                                <Typography variant="h4" fontWeight="800" sx={{ my: 0.2 }}>
                                    {todayCalories} <Typography component="span" variant="body2" sx={{ color: '#94A3B8' }}>/ {targetCalories} kcal</Typography>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.82rem' }}>
                                    {progressPercent >= 100
                                        ? '🎉 Daily calorie goal crushed!'
                                        : `${Math.max(0, targetCalories - todayCalories)} kcal remaining to hit your target`}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* 2. Streak & Consistency Badge */}
                    <Grid item xs={12} sm={6} md={3.5}>
                        <Box sx={{
                            p: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ bgcolor: '#EA580C', width: 32, height: 32 }}>
                                        <EmojiEventsIcon sx={{ fontSize: 18, color: 'white' }} />
                                    </Avatar>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Active Streak
                                    </Typography>
                                </Box>
                                <Chip
                                    size="small"
                                    label={currentStreak > 0 ? `${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'} 🔥` : '0 Days'}
                                    sx={{
                                        bgcolor: currentStreak > 0 ? '#EA580C' : '#334155',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8', lineHeight: 1.3 }}>
                                {currentStreak > 0
                                    ? (todayCount > 0 ? `🔥 ${todayCount} workout${todayCount > 1 ? 's' : ''} completed today!` : "Log today's workout to maintain streak!")
                                    : "Log your first workout today to ignite your streak!"}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* 3. Health & Biometric Summary */}
                    <Grid item xs={12} sm={6} md={3.5}>
                        <Box sx={{
                            p: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: '#94A3B8', fontWeight: 'bold' }}>
                                    ⚖️ Body Metrics
                                </Typography>
                                {onOpenProfile && (
                                    <Button
                                        size="small"
                                        onClick={onOpenProfile}
                                        sx={{ color: '#38BDF8', fontSize: '0.7rem', p: 0, textTransform: 'none', minWidth: 'auto' }}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 0.5 }}>
                                <Typography variant="h5" fontWeight="bold">
                                    {weight} <Typography component="span" variant="caption" sx={{ color: '#94A3B8' }}>kg</Typography>
                                </Typography>
                                <Chip
                                    size="small"
                                    label={`${bmi} BMI (${bmiCategory})`}
                                    sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                                Goal: <strong style={{ color: '#F1F5F9' }}>{(profile?.fitnessGoal || 'MAINTENANCE').replace('_', ' ')}</strong> • BMR: ~{bmr} kcal
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default GoalProgressBanner;