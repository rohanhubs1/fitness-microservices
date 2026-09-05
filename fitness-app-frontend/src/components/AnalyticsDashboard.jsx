import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography, CircularProgress,
    Chip, Avatar, Paper, Button, IconButton, Stack, Tooltip, Divider
} from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import BoltIcon from '@mui/icons-material/Bolt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { getActivityStats, getUserProfile } from '../store/api';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

const StatCard = ({ title, value, unit, icon: Icon, color, subtitle, badgeText = '+0%' }) => (
    <Card sx={{
        height: '100%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        borderRadius: 3.5,
        bgcolor: 'white',
        border: '1px solid #E2E8F0',
        transition: 'all 0.25s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': { 
            transform: 'translateY(-3px)', 
            boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
            borderColor: `${color}60`
        }
    }}>
        <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.72rem', letterSpacing: 0.3 }}>
                    {title}
                </Typography>
                <Avatar sx={{
                    width: 34,
                    height: 34,
                    bgcolor: `${color}15`,
                    color: color
                }}>
                    <Icon sx={{ fontSize: 18 }} />
                </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#0F172A', letterSpacing: -0.5 }}>
                    {value}
                </Typography>
                {unit && (
                    <Typography component="span" variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                        {unit}
                    </Typography>
                )}
                {badgeText && (
                    <Chip 
                        label={badgeText} 
                        size="small" 
                        sx={{ 
                            height: 18, 
                            fontSize: '0.65rem', 
                            bgcolor: '#ECFDF5', 
                            color: '#059669', 
                            fontWeight: 'bold',
                            ml: 'auto'
                        }} 
                    />
                )}
            </Box>
            {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', mt: 0.3 }}>
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const AnalyticsDashboard = ({ refreshKey, onNavigateTab = () => {}, onOpenProfile = () => {}, username = 'Athlete', avatarUrl }) => {
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.allSettled([getActivityStats(), getUserProfile()])
            .then(([sRes, pRes]) => {
                if (sRes.status === 'fulfilled') setStats(sRes.value?.data);
                if (pRes.status === 'fulfilled') setProfile(pRes.value?.data);
            })
            .catch((err) => console.warn('Could not fetch analytics data:', err))
            .finally(() => setLoading(false));
    }, [refreshKey]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress size={44} thickness={4} />
            </Box>
        );
    }

    const totalWorkouts = stats?.totalWorkouts || 0;
    const totalCalories = stats?.totalCaloriesBurned || 0;
    const totalMinutes = stats?.totalActiveMinutes || 0;
    const avgCalories = stats?.averageCaloriesPerWorkout || 0;
    const currentStreak = stats?.currentStreak !== undefined ? stats.currentStreak : 0;
    const activeDays = stats?.activeDays !== undefined ? stats.activeDays : 0;

    // PulseScore calculation (including contest bonus points from backend)
    const pulseScore = stats?.pulseScore !== undefined 
        ? stats.pulseScore 
        : Math.round((totalCalories / 10) + (totalMinutes * 2) + (totalWorkouts * 50));
    const bonusPoints = stats?.bonusPoints || 0;

    // Daily Goal & Today's Stats from Weekly Trend
    const dailyCalorieGoal = profile?.dailyCalorieGoal || profile?.targetDailyCalories || 400;
    const weeklyTrend = stats?.weeklyCalorieTrend || [];
    const todayTrend = weeklyTrend.length > 0 ? weeklyTrend[weeklyTrend.length - 1] : null;
    const todayCalories = todayTrend?.calories || 0;
    const todayWorkouts = todayTrend?.count || 0;
    const goalProgress = Math.min(Math.round((todayCalories / dailyCalorieGoal) * 100), 100);

    const pieData = (stats?.activityTypeBreakdown || []).map((item) => ({
        name: (item.type || '').replace('_', ' '),
        value: item.calories || 0,
        count: item.count || 0
    }));

    // Calculate BMI
    let bmiValue = null;
    let bmiCategory = '';
    let bmiColor = '#10B981';
    if (profile?.weight && profile?.height) {
        const heightM = profile.height / 100;
        bmiValue = (profile.weight / (heightM * heightM)).toFixed(1);
        if (bmiValue < 18.5) { bmiCategory = 'Underweight'; bmiColor = '#3B82F6'; }
        else if (bmiValue < 25) { bmiCategory = 'Normal'; bmiColor = '#10B981'; }
        else if (bmiValue < 30) { bmiCategory = 'Overweight'; bmiColor = '#F59E0B'; }
        else { bmiCategory = 'Obese'; bmiColor = '#EF4444'; }
    }

    // Dynamic greeting & date
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const todayFormattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <Box sx={{ width: '100%', pb: 5 }}>
            {/* Top Greeting Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {greeting}, {username}! 👋
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                        Stay consistent. A healthier you is a stronger you.
                    </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#334155', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <CalendarMonthIcon sx={{ fontSize: 18, color: '#64748B' }} />
                        <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#0F172A' }}>
                            {todayFormattedDate}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        Small steps. Big results. 🌱
                    </Typography>
                </Box>
            </Box>

            {/* Split Screen Grid (Main Analytics Left + Right Action Sidebar) */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 340px', xl: '1fr 360px' },
                gap: 3,
                alignItems: 'start'
            }}>
                {/* LEFT MAIN COLUMN */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    {/* 1. Hero Motivation Banner */}
                    <Card sx={{
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #090e1a 0%, #172554 45%, #1e1b4b 100%)',
                        color: 'white',
                        p: { xs: 2.5, md: 3 },
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(15,23,42,0.15)'
                    }}>
                        {/* Subtle decorative glow */}
                        <Box sx={{
                            position: 'absolute',
                            right: { xs: '-40px', md: '120px' },
                            top: 0,
                            bottom: 0,
                            width: 250,
                            opacity: 0.12,
                            background: 'radial-gradient(circle, #38BDF8 10%, transparent 70%)',
                            pointerEvents: 'none'
                        }} />

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 280px' },
                            gap: 3,
                            alignItems: 'center'
                        }}>
                            <Box>
                                <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: -0.5, lineHeight: 1.3, mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                    “Discipline today<br />Builds the stronger you tomorrow.”
                                </Typography>
                                <Box sx={{ width: 48, height: 3, bgcolor: '#EA580C', borderRadius: 2, mb: 2.5 }} />

                                {/* 3 Real-time Metrics in Hero */}
                                <Stack direction="row" spacing={{ xs: 2, sm: 3 }} alignItems="center" flexWrap="wrap">
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: '#F97316' }}>🔥</Typography>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#FFFFFF' }}>
                                                {todayCalories} / {dailyCalorieGoal} kcal
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                                            Daily Goal
                                        </Typography>
                                    </Box>

                                    <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)', height: 28, my: 'auto' }} />

                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: '#10B981' }}>🎯</Typography>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#FFFFFF' }}>
                                                {goalProgress}%
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                                            Goal Progress
                                        </Typography>
                                    </Box>

                                    <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)', height: 28, my: 'auto' }} />

                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: '#FACC15' }}>⚡</Typography>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#FFFFFF' }}>
                                                {todayWorkouts}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                                            Workouts Today
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Floating Active Streak Card */}
                            <Paper sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: 120
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#EA580C', color: 'white' }}>
                                            <EmojiEventsIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.82rem' }}>
                                            Active Streak
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={currentStreak > 0 ? `${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'} 🔥` : '0 Days'} 
                                        size="small" 
                                        sx={{ bgcolor: currentStreak > 0 ? '#EA580C' : '#334155', color: 'white', fontWeight: 'bold', fontSize: '0.7rem', height: 22 }} 
                                    />
                                </Box>
                                <Typography variant="caption" sx={{ color: '#CBD5E1', mb: 1, lineHeight: 1.3, fontSize: '0.72rem' }}>
                                    {currentStreak > 0 
                                        ? (todayWorkouts > 0 ? "You're on fire today! Keep the momentum." : "Log today's workout to maintain streak!") 
                                        : 'Log your first workout today to ignite your streak!'}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => onNavigateTab(1)}
                                        sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', width: 26, height: 26, '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                                    >
                                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
                            </Paper>
                        </Box>
                    </Card>

                    {/* 2. 4 Metric Stat Cards */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 2
                    }}>
                        <StatCard
                            title="Total Workouts"
                            value={totalWorkouts}
                            icon={FitnessCenterIcon}
                            color="#3b82f6"
                            subtitle="All sport sessions"
                        />
                        <StatCard
                            title="Total Calories"
                            value={totalCalories.toLocaleString()}
                            unit="kcal"
                            icon={LocalFireDepartmentIcon}
                            color="#ea580c"
                            subtitle="Active energy burned"
                        />
                        <StatCard
                            title="Active Time"
                            value={totalMinutes}
                            unit="mins"
                            icon={AccessTimeIcon}
                            color="#10b981"
                            subtitle="Total active duration"
                        />
                        <StatCard
                            title="Avg. / Workout"
                            value={avgCalories}
                            unit="kcal"
                            icon={TrendingUpIcon}
                            color="#9333ea"
                            subtitle="Average per workout"
                        />
                    </Box>

                    {/* 3. Visual Charts Row */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' },
                        gap: 2.5
                    }}>
                        {/* 7-Day Calorie Burn Trend */}
                        <Card sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            minHeight: 330,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        📈 7-Day Calorie Burn Trend
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Daily active energy expenditure over past week
                                    </Typography>
                                </Box>
                                <Chip label="Real-time Live" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 'bold', fontSize: '0.65rem', height: 20 }} />
                            </Box>
                            <Box sx={{ width: '100%', height: 230, mt: 'auto' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="day" tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                                        <YAxis tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                                        <RechartsTooltip
                                            formatter={(val) => [`${val} kcal`, 'Calories']}
                                            labelFormatter={(label, item) => item?.[0]?.payload?.date || label}
                                            contentStyle={{ backgroundColor: '#0F172A', borderRadius: 8, color: '#fff', border: 'none', fontSize: '0.75rem' }}
                                            itemStyle={{ color: '#60A5FA' }}
                                        />
                                        <Area type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Card>

                        {/* Activity Breakdown Donut */}
                        <Card sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            minHeight: 330,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        🥧 Activity Breakdown
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Caloric share across sport categories
                                    </Typography>
                                </Box>
                                <Chip label="Last 7 days" size="small" sx={{ bgcolor: '#F8FAFC', color: '#475569', fontSize: '0.65rem', border: '1px solid #E2E8F0', height: 20 }} />
                            </Box>
                            {pieData.length === 0 ? (
                                <Box sx={{ py: 3, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <Avatar sx={{ width: 44, height: 44, bgcolor: '#F1F5F9', color: '#94A3B8', mb: 1.2 }}>
                                        <FitnessCenterIcon sx={{ fontSize: 22 }} />
                                    </Avatar>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                        No activity breakdown yet
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" sx={{ maxWidth: 200, mt: 0.3, fontSize: '0.72rem', lineHeight: 1.3 }}>
                                        Log your first workout to view sport distribution!
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ width: '100%', height: 230, mt: 'auto' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={48}
                                                outerRadius={70}
                                                paddingAngle={4}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                formatter={(val, name, entry) => [`${val} kcal (${entry?.payload?.count || 0} sessions)`, name]} 
                                                contentStyle={{ backgroundColor: '#0F172A', borderRadius: 8, color: '#fff', border: 'none', fontSize: '0.75rem' }}
                                            />
                                            <Legend verticalAlign="bottom" height={28} iconSize={8} wrapperStyle={{ fontSize: '0.72rem' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            )}
                        </Card>
                    </Box>

                    {/* 4. Bottom Row (3 Equal Balanced Cards: PulseScore, Weekly Consistency, Recent Achievements) */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                        gap: 2.5
                    }}>
                        {/* PulseScore Rating */}
                        <Card sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            minHeight: 180,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: '#E0F2FE', color: '#0284C7', width: 32, height: 32 }}>
                                    <BoltIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A', fontSize: '0.85rem' }}>
                                        PulseScore Rating
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>
                                        Fitness activity ranking
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, my: 1, flexWrap: 'wrap' }}>
                                <Typography variant="h4" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                    {pulseScore}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 'bold' }}>
                                    pts
                                </Typography>
                                {bonusPoints > 0 && (
                                    <Chip
                                        label={`+${bonusPoints} Contest Bonus`}
                                        size="small"
                                        sx={{ bgcolor: '#FAF5FF', color: '#7E22CE', fontWeight: 'bold', fontSize: '0.65rem', border: '1px solid #E9D5FF', height: 20 }}
                                    />
                                )}
                                <Chip 
                                    label={pulseScore >= 500 ? 'Diamond Tier' : pulseScore >= 200 ? 'Gold Tier' : 'Starter'} 
                                    size="small" 
                                    sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 'bold', fontSize: '0.65rem', ml: 'auto', height: 20 }} 
                                />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.68rem', lineHeight: 1.3 }}>
                                {bonusPoints > 0 
                                    ? `Includes +${bonusPoints} pts from completed challenges + workout activity.` 
                                    : 'Calculated dynamically from total calories, active duration, and consistency.'}
                            </Typography>
                        </Card>

                        {/* Weekly Consistency */}
                        <Card sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            minHeight: 180,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: '#F3E8FF', color: '#9333EA', width: 32, height: 32 }}>
                                    <CalendarMonthIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A', fontSize: '0.85rem' }}>
                                        Weekly Consistency
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>
                                        Workout frequency this week
                                    </Typography>
                                </Box>
                            </Box>
                            
                            {/* 7 Days Trend Dots */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
                                {weeklyTrend.map((d) => {
                                    const isActive = (d.count || 0) > 0 || (d.calories || 0) > 0;
                                    return (
                                        <Tooltip key={d.date || d.day} title={`${d.date || d.day}: ${d.calories || 0} kcal (${d.count || 0} workouts)`} arrow>
                                            <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748B', display: 'block', mb: 0.3, fontWeight: 500 }}>
                                                    {d.day}
                                                </Typography>
                                                <Box sx={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: '50%',
                                                    bgcolor: isActive ? '#10B981' : '#F1F5F9',
                                                    border: isActive ? '2px solid #059669' : '1.5px solid #CBD5E1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                    boxShadow: isActive ? '0 2px 6px rgba(16,185,129,0.3)' : 'none',
                                                    '&:hover': { transform: 'scale(1.15)' }
                                                }}>
                                                    {isActive && <CheckCircleIcon sx={{ fontSize: 13, color: 'white' }} />}
                                                </Box>
                                            </Box>
                                        </Tooltip>
                                    );
                                })}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{ color: '#7C3AED', fontSize: '0.68rem', fontWeight: 600 }}>
                                    {activeDays > 0 ? `🔥 ${activeDays} active workout ${activeDays === 1 ? 'day' : 'days'} recorded!` : '🎯 Log a workout to start consistency!'}
                                </Typography>
                            </Box>
                        </Card>

                        {/* Recent Achievements */}
                        <Card sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            minHeight: 180,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ bgcolor: '#FEF9C3', color: '#CA8A04', width: 32, height: 32 }}>
                                        <EmojiEventsIcon sx={{ fontSize: 18 }} />
                                    </Avatar>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A', fontSize: '0.85rem' }}>
                                        Achievements
                                    </Typography>
                                </Box>
                                <Button 
                                    size="small" 
                                    onClick={() => onNavigateTab(6)}
                                    sx={{ textTransform: 'none', fontSize: '0.65rem', fontWeight: 'bold', p: 0, minWidth: 'auto', color: '#2563EB' }}
                                >
                                    View All →
                                </Button>
                            </Box>

                            <Box sx={{ textAlign: 'center', my: 'auto' }}>
                                <Avatar sx={{ width: 34, height: 34, bgcolor: '#FEF08A', color: '#EAB308', mx: 'auto', mb: 0.5 }}>
                                    <StarIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A', fontSize: '0.78rem' }}>
                                    {totalWorkouts > 0 ? 'First Workout Logged 🚀' : 'No achievements yet'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mt: 0.2 }}>
                                    {totalWorkouts > 0 ? 'Great momentum! Log more workouts.' : 'Complete workouts to earn badges!'}
                                </Typography>
                            </Box>
                        </Card>
                    </Box>
                </Box>

                {/* RIGHT SIDEBAR COLUMN */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
                    {/* 1. Your Profile Card */}
                    <Card sx={{ p: 2.5, borderRadius: 3.5, bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                Your Profile
                            </Typography>
                            <Button 
                                size="small" 
                                onClick={onOpenProfile}
                                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 'bold', color: '#2563EB', p: 0 }}
                            >
                                Edit →
                            </Button>
                        </Box>

                        {/* User Avatar & Name */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Avatar 
                                src={avatarUrl || undefined} 
                                sx={{ width: 44, height: 44, bgcolor: '#3B82F6', fontWeight: 'bold', fontSize: '1.1rem' }}
                            >
                                {username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0F172A', lineHeight: 1.2 }} noWrap>
                                    {username}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                                    ● Active Athlete
                                </Typography>
                            </Box>
                        </Box>

                        {/* Body Metrics Section */}
                        <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 2.5, p: 1.8, border: '1px solid #F1F5F9' }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.2 }}>
                                <MonitorWeightIcon sx={{ fontSize: 16 }} /> Body Metrics
                            </Typography>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">⚖️ Weight</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                        {profile?.weight ? `${profile.weight} kg` : 'Not set'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">📏 Height</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                        {profile?.height ? `${profile.height} cm` : 'Not set'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">📊 BMI</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: bmiColor }}>
                                        {bmiValue ? `${bmiValue} (${bmiCategory})` : 'Not set'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">🎯 Goal</Typography>
                                    <Chip 
                                        label={profile?.fitnessGoal ? profile.fitnessGoal.replace('_', ' ') : 'GENERAL FITNESS'} 
                                        size="small" 
                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold', bgcolor: '#E0F2FE', color: '#0284C7' }} 
                                    />
                                </Box>
                            </Stack>
                        </Box>
                    </Card>

                    {/* 2. Motivation Card */}
                    <Card sx={{
                        p: 2.5,
                        borderRadius: 3.5,
                        background: 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)',
                        color: 'white',
                        boxShadow: '0 8px 25px rgba(234, 88, 12, 0.25)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocalFireDepartmentIcon sx={{ fontSize: 24, color: '#FEF08A' }} />
                            <Typography variant="subtitle1" fontWeight="bold">
                                Keep Going!
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.95, fontSize: '0.8rem', lineHeight: 1.4 }}>
                            Every workout brings you one step closer to your fitness goals. Consistency is king.
                        </Typography>
                    </Card>

                    {/* 3. Quick Actions Hub */}
                    <Card sx={{ p: 2.5, borderRadius: 3.5, bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A', mb: 2 }}>
                            Quick Actions
                        </Typography>
                        <Stack spacing={1.5}>
                            {/* Action 1: Log Workout */}
                            <Paper
                                onClick={() => onNavigateTab(1)}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2.5,
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD', transform: 'translateX(4px)' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <AddCircleIcon sx={{ fontSize: 18, color: '#EA580C' }} />
                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#1E293B' }}>
                                        Log a Workout
                                    </Typography>
                                </Box>
                                <ChevronRightIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                            </Paper>

                            {/* Action 2: Ask AI Coach */}
                            <Paper
                                onClick={() => onNavigateTab(3)}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2.5,
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: '#F5F3FF', borderColor: '#C4B5FD', transform: 'translateX(4px)' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <SmartToyOutlinedIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#1E293B' }}>
                                        Ask AI Coach
                                    </Typography>
                                </Box>
                                <ChevronRightIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                            </Paper>

                            {/* Action 3: Find Fitness Centres */}
                            <Paper
                                onClick={() => onNavigateTab(4)}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2.5,
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: '#ECFDF5', borderColor: '#6EE7B7', transform: 'translateX(4px)' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <PlaceOutlinedIcon sx={{ fontSize: 18, color: '#059669' }} />
                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#1E293B' }}>
                                        Find Fitness Centres
                                    </Typography>
                                </Box>
                                <ChevronRightIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                            </Paper>

                            {/* Action 4: Join Challenge */}
                            <Paper
                                onClick={() => onNavigateTab(6)}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2.5,
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: '#FEFCE8', borderColor: '#FDE047', transform: 'translateX(4px)' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <MilitaryTechOutlinedIcon sx={{ fontSize: 18, color: '#CA8A04' }} />
                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#1E293B' }}>
                                        Join a Challenge
                                    </Typography>
                                </Box>
                                <ChevronRightIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                            </Paper>
                        </Stack>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};

export default AnalyticsDashboard;
