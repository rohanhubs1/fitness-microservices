import React, { useEffect, useState, useMemo } from 'react';
import {
    Grid, Typography, Card, CardContent, Box, Chip,
    IconButton, Tooltip, Stack, Alert, Pagination,
    TextField, InputAdornment, Button, Tabs, Tab,
    Paper, Divider
} from '@mui/material';
import { useNavigate } from 'react-router';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PoolIcon from '@mui/icons-material/Pool';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getActivities, deleteActivity } from '../store/api';

const getActivityIcon = (type) => {
    switch (type) {
        case 'RUNNING': return <DirectionsRunIcon sx={{ color: '#1976d2' }} />;
        case 'WALKING': return <DirectionsWalkIcon sx={{ color: '#4caf50' }} />;
        case 'CYCLING': return <DirectionsBikeIcon sx={{ color: '#ff9800' }} />;
        case 'SWIMMING': return <PoolIcon sx={{ color: '#00bcd4' }} />;
        case 'WEIGHT_TRAINING': return <FitnessCenterIcon sx={{ color: '#e91e63' }} />;
        case 'HIIT': return <FlashOnIcon sx={{ color: '#f44336' }} />;
        case 'YOGA': return <SelfImprovementIcon sx={{ color: '#9c27b0' }} />;
        default: return <SportsScoreIcon sx={{ color: '#757575' }} />;
    }
};

const ITEMS_PER_PAGE = 6;

const ActivityList = ({ onActivityDeleted }) => {
    const [activities, setActivities] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [timeframe, setTimeframe] = useState('ALL_TIME'); // 'ALL_TIME' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'LAST_30_DAYS'
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deleteMsg, setDeleteMsg] = useState(null);
    const navigate = useNavigate();

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await getActivities();
            setActivities(response.data || []);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteActivity(id);
            setActivities((prev) => prev.filter((a) => a.id !== id));
            setDeleteMsg('Workout permanently deleted from records.');
            setTimeout(() => setDeleteMsg(null), 3500);
            if (onActivityDeleted) onActivityDeleted();
        } catch (err) {
            console.error('Failed to delete activity:', err);
        }
    };

    // Filter by Category, Timeframe, and Search Query
    const filteredActivities = useMemo(() => {
        const now = new Date();

        return activities.filter((activity) => {
            // Category filter
            if (filter !== 'ALL' && activity.type !== filter) {
                return false;
            }

            // Timeframe filter
            if (timeframe !== 'ALL_TIME') {
                const actDate = new Date(activity.startTime || activity.createdAt || Date.now());
                const diffMs = now - actDate;
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                if (timeframe === 'LAST_7_DAYS' && diffDays > 7) {
                    return false;
                }
                if (timeframe === 'LAST_30_DAYS' && diffDays > 30) {
                    return false;
                }
                if (timeframe === 'THIS_MONTH') {
                    if (actDate.getMonth() !== now.getMonth() || actDate.getFullYear() !== now.getFullYear()) {
                        return false;
                    }
                }
            }

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const typeMatch = activity.type?.toLowerCase().includes(query);
                const durationMatch = activity.duration?.toString().includes(query);
                const caloriesMatch = activity.caloriesBurned?.toString().includes(query);
                return typeMatch || durationMatch || caloriesMatch;
            }

            return true;
        });
    }, [activities, filter, timeframe, searchQuery]);

    // Reset pagination to page 1 on filter or search changes
    useEffect(() => {
        setPage(1);
    }, [filter, timeframe, searchQuery]);

    const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE) || 1;
    const paginatedActivities = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filteredActivities.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredActivities, page]);

    const categories = ['ALL', 'RUNNING', 'WEIGHT_TRAINING', 'CYCLING', 'SWIMMING', 'HIIT', 'YOGA'];

    return (
        <Box>
            {deleteMsg && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    {deleteMsg}
                </Alert>
            )}

            {/* Top Control Bar: Search & Timeframe Filter Tabs */}
            <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: 3, bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                    <Grid item xs={12} md={5}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search workouts (e.g. Running, HIIT, 450 kcal)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#64748B' }} />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                        />
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Tabs
                            value={timeframe}
                            onChange={(e, val) => setTimeframe(val)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: 40,
                                '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 'bold', fontSize: '0.85rem' }
                            }}
                        >
                            <Tab value="ALL_TIME" label="All Time" />
                            <Tab value="LAST_7_DAYS" label="Last 7 Days" />
                            <Tab value="THIS_MONTH" label="This Month" />
                            <Tab value="LAST_30_DAYS" label="Last 30 Days" />
                        </Tabs>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Sport Type Filter Chips */}
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
                    {categories.map((cat) => (
                        <Chip
                            key={cat}
                            label={cat.replace('_', ' ')}
                            color={filter === cat ? 'primary' : 'default'}
                            variant={filter === cat ? 'filled' : 'outlined'}
                            onClick={() => setFilter(cat)}
                            sx={{
                                fontWeight: filter === cat ? 'bold' : 'normal',
                                cursor: 'pointer',
                                borderRadius: 2,
                                px: 0.5
                            }}
                        />
                    ))}
                </Stack>
            </Paper>

            {/* Results Counter */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    Showing {filteredActivities.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(page * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length} workouts
                </Typography>
                {totalPages > 1 && (
                    <Typography variant="caption" color="text.secondary">
                        Page {page} of {totalPages}
                    </Typography>
                )}
            </Box>

            {/* Workout Cards Grid */}
            <Grid container spacing={2.5}>
                {filteredActivities.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                            <SportsScoreIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
                            <Typography variant="h6" fontWeight="bold" color="text.secondary">
                                No workouts found matching your filters
                            </Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                                Try adjusting your sport category, search query, or timeframe filter.
                            </Typography>
                        </Paper>
                    </Grid>
                ) : (
                    paginatedActivities.map((activity) => (
                        <Grid item xs={12} sm={6} md={4} key={activity.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3.5,
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                        borderColor: '#CBD5E1'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Header: Sport & Delete */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ p: 1, bgcolor: '#F1F5F9', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                                                {getActivityIcon(activity.type)}
                                            </Box>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                                {activity.type.replace('_', ' ')}
                                            </Typography>
                                        </Box>
                                        <Tooltip title="Delete Workout">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => handleDelete(e, activity.id)}
                                                sx={{ '&:hover': { bgcolor: '#FEE2E2' } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    {/* Key Metrics */}
                                    <Stack direction="row" spacing={2} sx={{ mb: 1.5, bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <TimerIcon sx={{ fontSize: 18, color: '#64748B' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>{activity.duration}</strong> min
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                            <WhatshotIcon sx={{ fontSize: 18, color: '#EA580C' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>{activity.caloriesBurned}</strong> kcal
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Additional metrics preview */}
                                    {activity.additonalMetrics && Object.keys(activity.additonalMetrics).length > 0 && (
                                        <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                            {activity.additonalMetrics.distanceKm && (
                                                <Chip size="small" label={`${activity.additonalMetrics.distanceKm} km`} sx={{ height: 22, fontSize: '0.72rem' }} />
                                            )}
                                            {activity.additonalMetrics.laps && (
                                                <Chip size="small" label={`${activity.additonalMetrics.laps} laps`} sx={{ height: 22, fontSize: '0.72rem' }} />
                                            )}
                                            {activity.additonalMetrics.muscleGroup && (
                                                <Chip size="small" label={activity.additonalMetrics.muscleGroup} sx={{ height: 22, fontSize: '0.72rem' }} />
                                            )}
                                            {activity.additonalMetrics.weightKg && (
                                                <Chip size="small" label={`${activity.additonalMetrics.weightKg} kg`} sx={{ height: 22, fontSize: '0.72rem' }} />
                                            )}
                                            {activity.additonalMetrics.rounds && (
                                                <Chip size="small" label={`${activity.additonalMetrics.rounds} rounds`} sx={{ height: 22, fontSize: '0.72rem' }} />
                                            )}
                                        </Box>
                                    )}

                                    {activity.createdAt && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                            <CalendarMonthIcon sx={{ fontSize: 14 }} />
                                            {new Date(activity.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </Typography>
                                    )}

                                    <Box sx={{ mt: 'auto', pt: 1 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => navigate(`/activities/${activity.id}`)}
                                            startIcon={<SmartToyIcon />}
                                            endIcon={<ArrowForwardIcon />}
                                            sx={{
                                                bgcolor: '#7E22CE',
                                                color: '#ffffff',
                                                textTransform: 'none',
                                                borderRadius: 2.5,
                                                fontWeight: 'bold',
                                                py: 0.9,
                                                fontSize: '0.85rem',
                                                boxShadow: '0 2px 8px rgba(126,34,206,0.25)',
                                                '&:hover': {
                                                    bgcolor: '#6B21A8'
                                                }
                                            }}
                                        >
                                            Get AI Recommendation
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, val) => {
                            setPage(val);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        color="primary"
                        size="medium"
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                                fontWeight: 'bold'
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default ActivityList;

