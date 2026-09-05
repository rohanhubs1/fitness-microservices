import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getActivity, getActivityRecommendation } from '../store/api';
import {
    Box, Card, CardContent, CircularProgress, Divider,
    Typography, Button, Stack, Chip, Paper, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TimerIcon from '@mui/icons-material/Timer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ShieldIcon from '@mui/icons-material/Shield';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ActivityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const actRes = await getActivity(id);
                setActivity(actRes.data);
            } catch (error) {
                console.warn("Could not fetch activity details:", error);
            }

            try {
                const recRes = await getActivityRecommendation(id);
                setRecommendation(recRes.data);
            } catch (error) {
                console.warn("Recommendation not yet available or failed:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
                <CircularProgress sx={{ color: '#7E22CE' }} />
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    Loading workout analysis & Grok AI recommendations...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, sm: 3 }, pb: 8 }}>
            {/* Top Navigation Bar */}
            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: 'white',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}
            >
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        color: '#0F172A',
                        borderColor: '#CBD5E1',
                        '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' }
                    }}
                >
                    Back to Workout History
                </Button>

                <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/')}
                    sx={{
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        bgcolor: '#ff9800',
                        color: '#000',
                        '&:hover': { bgcolor: '#f57c00' }
                    }}
                >
                    Dashboard
                </Button>
            </Paper>

            {/* Activity Summary Card */}
            {activity && (
                <Card sx={{ mb: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ p: 1.2, bgcolor: '#FAF5FF', borderRadius: 2.5, color: '#7E22CE', display: 'flex' }}>
                                    <DirectionsRunIcon sx={{ fontSize: 28 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                        {activity.type?.replace('_', ' ')} Workout
                                    </Typography>
                                    {activity.createdAt && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CalendarMonthIcon sx={{ fontSize: 14 }} />
                                            {new Date(activity.createdAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            <Chip
                                label="Session Logged"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 'bold', borderRadius: 2 }}
                            />
                        </Box>

                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <TimerIcon sx={{ fontSize: 28, color: '#64748B' }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold">DURATION</Typography>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                            {activity.duration} minutes
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, bgcolor: '#FFF7ED', borderRadius: 2.5, border: '1px solid #FFEDD5', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <WhatshotIcon sx={{ fontSize: 28, color: '#EA580C' }} />
                                    <Box>
                                        <Typography variant="caption" color="#9A3412" fontWeight="bold">ENERGY BURNED</Typography>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#EA580C' }}>
                                            {activity.caloriesBurned} kcal
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Additional Metrics */}
                        {activity.additonalMetrics && Object.keys(activity.additonalMetrics).length > 0 && (
                            <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                    Specific Performance Metrics
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {activity.additonalMetrics.distanceKm && (
                                        <Chip label={`Distance: ${activity.additonalMetrics.distanceKm} km`} sx={{ fontWeight: 'bold' }} />
                                    )}
                                    {activity.additonalMetrics.laps && (
                                        <Chip label={`Laps: ${activity.additonalMetrics.laps}`} sx={{ fontWeight: 'bold' }} />
                                    )}
                                    {activity.additonalMetrics.muscleGroup && (
                                        <Chip label={`Target: ${activity.additonalMetrics.muscleGroup}`} sx={{ fontWeight: 'bold' }} />
                                    )}
                                    {activity.additonalMetrics.weightKg && (
                                        <Chip label={`Load: ${activity.additonalMetrics.weightKg} kg`} sx={{ fontWeight: 'bold' }} />
                                    )}
                                    {activity.additonalMetrics.rounds && (
                                        <Chip label={`Rounds: ${activity.additonalMetrics.rounds}`} sx={{ fontWeight: 'bold' }} />
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* AI Recommendation Card */}
            {recommendation ? (
                <Card sx={{ borderRadius: 3.5, border: '1px solid #E9D5FF', bgcolor: 'white', boxShadow: '0 8px 24px rgba(126, 34, 206, 0.08)' }}>
                    <CardContent sx={{ p: 3.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Box sx={{ p: 1.2, bgcolor: '#7E22CE', borderRadius: 2.5, color: '#ffffff', display: 'flex' }}>
                                <SmartToyIcon sx={{ fontSize: 26 }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: '#7E22CE' }}>
                                    AI Coach Recommendation (Grok)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Tailored insights powered by real-time athletic intelligence
                                </Typography>
                            </Box>
                        </Box>

                        <Paper sx={{ p: 2.5, bgcolor: '#FAF5FF', borderRadius: 3, border: '1px solid #F3E8FF', mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#6B21A8', mb: 1 }}>
                                📊 Session Analysis
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', color: '#1E293B', lineHeight: 1.65 }}>
                                {recommendation.recommendation}
                            </Typography>
                        </Paper>

                        {recommendation.improvements && recommendation.improvements.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <TrendingUpIcon sx={{ color: '#15803D' }} />
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                        Key Improvements & Optimization
                                    </Typography>
                                </Box>
                                <Stack spacing={1}>
                                    {recommendation.improvements.map((improvement, index) => (
                                        <Paper key={index} sx={{ p: 1.5, px: 2, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #DCFCE7' }}>
                                            <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500 }}>
                                                • {improvement}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {recommendation.suggestions && recommendation.suggestions.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <TipsAndUpdatesIcon sx={{ color: '#D97706' }} />
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                        Next Training Suggestions
                                    </Typography>
                                </Box>
                                <Stack spacing={1}>
                                    {recommendation.suggestions.map((suggestion, index) => (
                                        <Paper key={index} sx={{ p: 1.5, px: 2, bgcolor: '#FEF3C7', borderRadius: 2, border: '1px solid #FDE68A' }}>
                                            <Typography variant="body2" sx={{ color: '#92400E', fontWeight: 500 }}>
                                                • {suggestion}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {recommendation.safety && recommendation.safety.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <ShieldIcon sx={{ color: '#DC2626' }} />
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                        Safety & Recovery Guidelines
                                    </Typography>
                                </Box>
                                <Stack spacing={1}>
                                    {recommendation.safety.map((safety, index) => (
                                        <Paper key={index} sx={{ p: 1.5, px: 2, bgcolor: '#FEF2F2', borderRadius: 2, border: '1px solid #FEE2E2' }}>
                                            <Typography variant="body2" sx={{ color: '#991B1B', fontWeight: 500 }}>
                                                • {safety}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', p: 4, textAlign: 'center' }}>
                    <SmartToyIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">
                        AI Recommendation in Progress
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                        The Grok AI engine is evaluating your performance metrics. If you just logged this workout, please refresh in a moment.
                    </Typography>
                </Card>
            )}

            {/* Bottom Navigation Buttons */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold' }}
                >
                    Back to Workout History
                </Button>
                <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/')}
                    sx={{ borderRadius: 2.5, textTransform: 'none', bgcolor: '#ff9800', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#f57c00' } }}
                >
                    Back to Dashboard
                </Button>
            </Box>
        </Box>
    );
};

export default ActivityDetail;

