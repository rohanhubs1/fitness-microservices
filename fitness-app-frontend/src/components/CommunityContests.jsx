import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button,
    Avatar, Chip, Stack, Paper, CircularProgress, Divider,
    LinearProgress
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

import { getAllActiveAnnouncements, getActivities } from '../store/api';

const calculateTimeLeft = (endDate, createdAt, durationDays = 7) => {
    let end;
    if (endDate) {
        end = new Date(endDate).getTime();
    } else if (createdAt) {
        end = new Date(createdAt).getTime() + (durationDays * 24 * 60 * 60 * 1000);
    } else {
        end = Date.now() + (24 * 60 * 60 * 1000);
    }
    const diff = end - Date.now();
    if (diff <= 0) return { expired: true, text: 'Contest Ended', isUrgent: false };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) {
        return { expired: false, text: `${days}d ${hours}h ${minutes}m left`, isUrgent: days < 1 };
    }
    return { expired: false, text: `${hours}h ${minutes}m ${seconds}s left`, isUrgent: true };
};

export const ContestCountdown = ({ endDate, createdAt, durationDays = 7 }) => {
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endDate, createdAt, durationDays));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(endDate, createdAt, durationDays));
        }, 1000);
        return () => clearInterval(timer);
    }, [endDate, createdAt, durationDays]);

    if (timeLeft.expired) {
        return (
            <Chip
                icon={<AccessTimeIcon sx={{ '&&': { fontSize: 14, color: '#64748B' } }} />}
                label="Contest Ended"
                size="small"
                sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 'bold', fontSize: '0.72rem' }}
            />
        );
    }

    return (
        <Chip
            icon={<AccessTimeIcon sx={{ '&&': { fontSize: 14, color: timeLeft.isUrgent ? '#DC2626' : '#7E22CE' } }} />}
            label={`⏱️ ${timeLeft.text}`}
            size="small"
            sx={{
                bgcolor: timeLeft.isUrgent ? '#FEF2F2' : '#FAF5FF',
                color: timeLeft.isUrgent ? '#DC2626' : '#7E22CE',
                fontWeight: 'bold',
                fontSize: '0.72rem',
                border: `1px solid ${timeLeft.isUrgent ? '#FCA5A5' : '#E9D5FF'}`
            }}
        />
    );
};

const CommunityContests = ({ onNavigateToLog, onNavigateToLeaderboard }) => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userWorkouts, setUserWorkouts] = useState([]);
    
    // Joined contests stored in local persistence
    const [joinedContests, setJoinedContests] = useState(() => {
        try {
            const saved = localStorage.getItem('pulseforge_joined_contests');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [annRes, actRes] = await Promise.allSettled([
                getAllActiveAnnouncements(),
                getActivities()
            ]);

            if (annRes.status === 'fulfilled' && annRes.value?.data && Array.isArray(annRes.value.data)) {
                setContests(annRes.value.data);
            } else {
                setContests([]);
            }

            if (actRes.status === 'fulfilled' && actRes.value?.data && Array.isArray(actRes.value.data)) {
                setUserWorkouts(actRes.value.data);
            }
        } catch (err) {
            console.error('Failed to load active contests or activities:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleJoinToggle = (contestId) => {
        setJoinedContests((prev) => {
            const updated = { ...prev, [contestId]: !prev[contestId] };
            localStorage.setItem('pulseforge_joined_contests', JSON.stringify(updated));
            return updated;
        });
    };

    // Calculate athlete's cumulative stats
    const totalCalories = userWorkouts.reduce((sum, a) => sum + (Number(a.caloriesBurned) || 0), 0);
    const totalMinutes = userWorkouts.reduce((sum, a) => sum + (Number(a.durationMinutes) || 0), 0);
    const totalWorkouts = userWorkouts.length;

    return (
        <Box sx={{ pb: 6 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#7e22ce', width: 44, height: 44 }}>
                        <CampaignIcon sx={{ fontSize: 26, color: 'white' }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#0F172A', letterSpacing: -0.5 }}>
                            Contests & Community Challenges
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                            Official platform challenges, live workout competitions, and community rewards.
                        </Typography>
                    </Box>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        onClick={onNavigateToLeaderboard}
                        startIcon={<LeaderboardIcon />}
                        sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Leaderboard
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onNavigateToLog}
                        startIcon={<FitnessCenterIcon />}
                        sx={{ borderRadius: 2.5, textTransform: 'none', bgcolor: '#ff9800', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#f57c00' } }}
                    >
                        Log Workout
                    </Button>
                </Stack>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : contests.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                    <EmojiEventsIcon sx={{ fontSize: 52, color: '#CBD5E1', mb: 1.5 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">
                        No Active Contests at the Moment
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, maxWidth: 450, mx: 'auto' }}>
                        Platform administrators post weekend challenges, calorie burn sprints, and community competitions here.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={onNavigateToLog}
                        startIcon={<FitnessCenterIcon />}
                        sx={{ mt: 3, borderRadius: 2.5, textTransform: 'none', bgcolor: '#ff9800', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#f57c00' } }}
                    >
                        Log a Regular Workout
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {contests.map((item) => {
                        const isJoined = Boolean(joinedContests[item.id]);

                        // Dynamic Target & Progress calculation based on contest's configured rules
                        const targetSport = item.targetActivityType || 'ALL';
                        const metric = item.targetMetric || 'CALORIES';
                        const goal = Number(item.targetGoal) || 1000;
                        const ptsAwarded = Number(item.pointsAwarded) || 500;

                        // Filter user workouts matching the contest criteria
                        const matchingWorkouts = userWorkouts.filter((w) => {
                            if (targetSport !== 'ALL' && w.type !== targetSport) {
                                return false;
                            }
                            if (item.startDate) {
                                const wDate = new Date(w.startTime || w.createdAt || Date.now());
                                const sDate = new Date(item.startDate);
                                if (wDate < sDate) return false;
                            }
                            return true;
                        });

                        let currentProgress = 0;
                        let unitLabel = 'kcal';
                        if (metric === 'DURATION_MINUTES') {
                            currentProgress = matchingWorkouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
                            unitLabel = 'mins';
                        } else if (metric === 'WORKOUT_COUNT') {
                            currentProgress = matchingWorkouts.length;
                            unitLabel = 'sessions';
                        } else {
                            currentProgress = matchingWorkouts.reduce((sum, w) => sum + (Number(w.caloriesBurned) || 0), 0);
                            unitLabel = 'kcal';
                        }

                        const progressPercent = Math.min(Math.round((currentProgress / goal) * 100), 100);
                        const isCompleted = currentProgress >= goal;

                        return (
                            <Grid item xs={12} md={6} key={item.id}>
                                <Card sx={{
                                    borderRadius: 3.5,
                                    bgcolor: 'white',
                                    border: isJoined ? '2px solid #7E22CE' : '1px solid #E2E8F0',
                                    boxShadow: isJoined ? '0 8px 24px rgba(126, 34, 206, 0.12)' : '0 4px 20px rgba(0,0,0,0.04)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-2px)' }
                                }}>
                                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        {/* Status Bar */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip
                                                    icon={<WhatshotIcon sx={{ '&&': { color: item.type === 'CHALLENGE' ? '#ea580c' : '#7e22ce', fontSize: 16 } }} />}
                                                    label={item.type || 'CHALLENGE'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: item.type === 'CHALLENGE' ? 'rgba(234, 88, 12, 0.1)' : 'rgba(126, 34, 206, 0.1)',
                                                        color: item.type === 'CHALLENGE' ? '#ea580c' : '#7e22ce',
                                                        fontWeight: 'bold',
                                                        border: `1px solid ${item.type === 'CHALLENGE' ? 'rgba(234, 88, 12, 0.3)' : 'rgba(126, 34, 206, 0.3)'}`
                                                    }}
                                                />
                                                <Chip
                                                    label={`+${ptsAwarded} PulsePoints`}
                                                    size="small"
                                                    sx={{ bgcolor: '#FAF5FF', color: '#7E22CE', fontWeight: 'bold', border: '1px solid #E9D5FF' }}
                                                />
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <ContestCountdown endDate={item.endDate} createdAt={item.createdAt} durationDays={item.durationDays || 7} />
                                                {isJoined ? (
                                                    <Chip
                                                        icon={<CheckCircleIcon sx={{ '&&': { color: '#15803D', fontSize: 16 } }} />}
                                                        label={isCompleted ? `🏆 +${ptsAwarded} Points Earned!` : "🔥 Participating"}
                                                        size="small"
                                                        sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 'bold', border: '1px solid #BBF7D0' }}
                                                    />
                                                ) : (
                                                    <Chip label="⚡ Open to All" size="small" sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 'bold' }} />
                                                )}
                                            </Stack>
                                        </Box>

                                        {/* Contest Title & Target Badge */}
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F172A', mb: 0.5 }}>
                                            {item.title || 'Community Fitness Challenge'}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap' }}>
                                            <Chip size="small" label={`Sport: ${targetSport.replace('_', ' ')}`} sx={{ fontWeight: 'bold' }} />
                                            <Chip size="small" label={`Target: ${goal} ${unitLabel}`} sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 'bold' }} />
                                            {item.durationDays && <Chip size="small" label={`${item.durationDays} Days`} />}
                                        </Box>

                                        <Typography variant="body1" sx={{ color: '#334155', mb: 2, lineHeight: 1.6, flexGrow: 1 }}>
                                            {item.message}
                                        </Typography>

                                        {/* Prize Banner */}
                                        {item.prize && (
                                            <Box sx={{ p: 1.5, mb: 2.5, bgcolor: '#FEF9C3', borderRadius: 2, border: '1px solid #FEF08A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <MilitaryTechIcon sx={{ color: '#854D0E', fontSize: 24 }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#854D0E', display: 'block', fontSize: '0.68rem' }}>
                                                        Challenge Reward / Prize
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#713F12' }}>
                                                        {item.prize}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Interactive Challenge Progress (Visible when Joined) */}
                                        {isJoined && (
                                            <Box sx={{ p: 2, mb: 2.5, bgcolor: '#FAF5FF', borderRadius: 2.5, border: '1px solid #E9D5FF' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#7E22CE', textTransform: 'uppercase' }}>
                                                        Your Challenge Progress
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#7E22CE' }}>
                                                        {currentProgress.toLocaleString()} / {goal.toLocaleString()} {unitLabel} ({progressPercent}%)
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progressPercent}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: '#E9D5FF',
                                                        '& .MuiLinearProgress-bar': { bgcolor: isCompleted ? '#10B981' : '#9333EA', borderRadius: 4 }
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.72rem' }}>
                                                    {isCompleted 
                                                        ? `🎉 Target Achieved! You earned +${ptsAwarded} bonus PulsePoints added to your leaderboard rank!` 
                                                        : `Log ${(goal - currentProgress > 0 ? goal - currentProgress : 0).toLocaleString()} more ${unitLabel} (${targetSport.replace('_', ' ')}) to claim +${ptsAwarded} PulsePoints.`}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Divider sx={{ my: 1.5 }} />

                                        {/* Actions Footer */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#64748B' }}>
                                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption">
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Live'}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    variant={isJoined ? "outlined" : "contained"}
                                                    color={isJoined ? "secondary" : "primary"}
                                                    onClick={() => handleJoinToggle(item.id)}
                                                    startIcon={isJoined ? <ExitToAppIcon /> : <GroupAddIcon />}
                                                    sx={{
                                                        textTransform: 'none',
                                                        borderRadius: 2,
                                                        fontWeight: 'bold',
                                                        bgcolor: !isJoined ? '#7e22ce' : 'transparent',
                                                        borderColor: '#7e22ce',
                                                        color: !isJoined ? '#fff' : '#7e22ce',
                                                        '&:hover': { bgcolor: !isJoined ? '#6b21a8' : 'rgba(126, 34, 206, 0.05)' }
                                                    }}
                                                >
                                                    {isJoined ? "Leave Challenge" : "Join Challenge"}
                                                </Button>

                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={onNavigateToLog}
                                                    sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#ff9800', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#f57c00' } }}
                                                >
                                                    Log Workout
                                                </Button>
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

export default CommunityContests;
