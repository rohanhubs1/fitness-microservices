import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button,
    Avatar, Chip, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Tooltip,
    IconButton, CircularProgress, ButtonGroup
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TimerIcon from '@mui/icons-material/Timer';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/Star';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { getLeaderboard } from '../store/api';

const TIER_CONFIG = {
    GOLD: { color: '#EAB308', bg: 'rgba(234, 179, 8, 0.12)', border: '#EAB308', label: 'Gold Champion', icon: '🥇' },
    SILVER: { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)', border: '#94A3B8', label: 'Silver Elite', icon: '🥈' },
    BRONZE: { color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', border: '#D97706', label: 'Bronze Master', icon: '🥉' },
    ELITE: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)', border: '#8B5CF6', label: 'Elite Top 10', icon: '⭐' },
    CHALLENGER: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', border: '#3B82F6', label: 'Challenger', icon: '⚡' }
};

const Leaderboard = () => {
    const [period, setPeriod] = useState('all'); // 'all' | 'weekly' | 'monthly'
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUserId = localStorage.getItem('userId');

    const fetchLeaderboardData = async (selectedPeriod) => {
        setLoading(true);
        try {
            const res = await getLeaderboard(selectedPeriod);
            if (res?.data) {
                setEntries(res.data);
            }
        } catch (err) {
            console.error('Failed to load leaderboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboardData(period);
    }, [period]);

    const topThree = entries.slice(0, 3);
    const gold = topThree[0];
    const silver = topThree[1];
    const bronze = topThree[2];

    const renderPodiumCard = (athlete, rank) => {
        if (!athlete) return null;

        const isCurrentAthlete = currentUserId && (athlete.userId === currentUserId);
        const avatarSrc = athlete.profilePictureUrl || (isCurrentAthlete ? localStorage.getItem('userAvatar') : '') || '';

        const rankConfig = {
            1: {
                border: '2px solid #EAB308',
                badgeBg: '#FEF08A',
                badgeColor: '#854D0E',
                badgeBorder: '#EAB308',
                badgeLabel: '👑 1st Place Champion',
                avatarBg: '#EAB308',
                avatarColor: '#000000',
                scoreBg: '#FEF9C3',
                scoreColor: '#854D0E',
                scoreBorder: '#FEF08A',
                statBg: '#FEFCE8',
                statColor: '#713F12',
                statBorder: '#FEF08A',
                boxShadow: '0 8px 30px rgba(234, 179, 8, 0.15)'
            },
            2: {
                border: '2px solid #94A3B8',
                badgeBg: '#F1F5F9',
                badgeColor: '#334155',
                badgeBorder: '#CBD5E1',
                badgeLabel: '🥈 2nd Place Elite',
                avatarBg: '#94A3B8',
                avatarColor: '#FFFFFF',
                scoreBg: '#F8FAFC',
                scoreColor: '#0F172A',
                scoreBorder: '#E2E8F0',
                statBg: '#F8FAFC',
                statColor: '#334155',
                statBorder: '#F1F5F9',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            },
            3: {
                border: '2px solid #FDBA74',
                badgeBg: '#FFEDD5',
                badgeColor: '#9A3412',
                badgeBorder: '#FDBA74',
                badgeLabel: '🥉 3rd Place Master',
                avatarBg: '#EA580C',
                avatarColor: '#FFFFFF',
                scoreBg: '#FFF7ED',
                scoreColor: '#9A3412',
                scoreBorder: '#FFEDD5',
                statBg: '#FFF7ED',
                statColor: '#9A3412',
                statBorder: '#FFEDD5',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }
        };

        const cfg = rankConfig[rank] || rankConfig[1];

        return (
            <Card sx={{
                height: '100%',
                borderRadius: 4,
                bgcolor: 'white',
                border: cfg.border,
                textAlign: 'center',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: cfg.boxShadow,
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                    boxShadow: '0 12px 36px rgba(0,0,0,0.1)'
                }
            }}>
                <Box>
                    {/* Header Rank Badge inside the card */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Chip
                            label={cfg.badgeLabel}
                            sx={{
                                bgcolor: cfg.badgeBg,
                                color: cfg.badgeColor,
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                border: `1px solid ${cfg.badgeBorder}`,
                                px: 1,
                                py: 0.5,
                                borderRadius: 2
                            }}
                        />
                    </Box>

                    {/* Avatar with Profile Photo */}
                    <Avatar
                        src={avatarSrc}
                        sx={{
                            width: rank === 1 ? 76 : 64,
                            height: rank === 1 ? 76 : 64,
                            mx: 'auto',
                            mb: 1.5,
                            bgcolor: cfg.avatarBg,
                            color: cfg.avatarColor,
                            fontSize: rank === 1 ? '1.75rem' : '1.4rem',
                            fontWeight: 800,
                            border: '3px solid white',
                            boxShadow: 2
                        }}
                    >
                        {athlete.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Name & Handle */}
                    <Typography variant={rank === 1 ? 'h6' : 'subtitle1'} fontWeight="bold" noWrap sx={{ color: '#0F172A' }}>
                        {athlete.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        @{athlete.username}
                    </Typography>

                    {/* PulseScore PTS Box */}
                    <Box sx={{
                        p: 1.5,
                        bgcolor: cfg.scoreBg,
                        borderRadius: 2.5,
                        border: `1px solid ${cfg.scoreBorder}`,
                        mb: 2
                    }}>
                        <Typography variant={rank === 1 ? 'h5' : 'h6'} fontWeight={800} sx={{ color: cfg.scoreColor }}>
                            {athlete.pulseScore?.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8 }}>PTS</span>
                        </Typography>
                    </Box>
                </Box>

                {/* 3 Metric Stat Pills */}
                <Grid container spacing={1}>
                    <Grid item xs={4}>
                        <Box sx={{ p: 1, bgcolor: cfg.statBg, borderRadius: 2, border: `1px solid ${cfg.statBorder}` }}>
                            <Typography variant="caption" sx={{ color: cfg.statColor, display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Burned</Typography>
                            <Typography variant="body2" fontWeight={800} sx={{ color: cfg.statColor, fontSize: '0.78rem' }}>{athlete.totalCalories?.toLocaleString()} kcal</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ p: 1, bgcolor: cfg.statBg, borderRadius: 2, border: `1px solid ${cfg.statBorder}` }}>
                            <Typography variant="caption" sx={{ color: cfg.statColor, display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Active</Typography>
                            <Typography variant="body2" fontWeight={800} sx={{ color: cfg.statColor, fontSize: '0.78rem' }}>{athlete.totalMinutes}m</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ p: 1, bgcolor: cfg.statBg, borderRadius: 2, border: `1px solid ${cfg.statBorder}` }}>
                            <Typography variant="caption" sx={{ color: cfg.statColor, display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Workouts</Typography>
                            <Typography variant="body2" fontWeight={800} sx={{ color: cfg.statColor, fontSize: '0.78rem' }}>{athlete.totalWorkouts}</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>
        );
    };

    return (
        <Box sx={{ pb: 6 }}>
            {/* Header Title & Timeframe Selector */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Avatar sx={{ bgcolor: 'linear-gradient(135deg, #f59e0b, #d97706)', bgcolor: '#f59e0b', width: 44, height: 44 }}>
                            <EmojiEventsIcon sx={{ fontSize: 26, color: '#000' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0F172A', letterSpacing: -0.5 }}>
                                Community Leaderboard & Rankings
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Real-time dynamic ranking based on calories, workout duration, and consistency.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'white', borderRadius: 2 }}>
                        <Button
                            variant={period === 'all' ? 'contained' : 'outlined'}
                            onClick={() => setPeriod('all')}
                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            All-Time
                        </Button>
                        <Button
                            variant={period === 'weekly' ? 'contained' : 'outlined'}
                            onClick={() => setPeriod('weekly')}
                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            This Week
                        </Button>
                        <Button
                            variant={period === 'monthly' ? 'contained' : 'outlined'}
                            onClick={() => setPeriod('monthly')}
                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                            This Month
                        </Button>
                    </ButtonGroup>

                    <Tooltip title="Refresh Leaderboard">
                        <IconButton onClick={() => fetchLeaderboardData(period)} disabled={loading} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Formula Explanation Card */}
            <Card sx={{ mb: 4, borderRadius: 3, bgcolor: '#0F172A', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <StarIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    PulseScore™ Formula
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    (Calories ÷ 10) + (Active Minutes × 2) + (Workouts × 50 pts)
                                </Typography>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Chip size="small" icon={<WhatshotIcon sx={{ '&&': { color: '#f97316' } }} />} label="1 pt / 10 kcal" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }} />
                            <Chip size="small" icon={<TimerIcon sx={{ '&&': { color: '#38bdf8' } }} />} label="2 pts / min" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }} />
                            <Chip size="small" icon={<FitnessCenterIcon sx={{ '&&': { color: '#4ade80' } }} />} label="50 pts / session" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'white' }} />
                        </Stack>
                    </Box>
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : entries.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                    <EmojiEventsIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1.5 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">
                        No Workout Data in this Period
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                        Log a workout to become the first champion on the leaderboard!
                    </Typography>
                </Paper>
            ) : (
                <>
                    {/* Dynamic Podium Display */}
                    {topThree.length === 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
                            <Box sx={{ width: '100%', maxWidth: 420 }}>
                                {renderPodiumCard(gold, 1)}
                            </Box>
                        </Box>
                    )}

                    {topThree.length === 2 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3.5, mb: 5 }}>
                            <Box sx={{ flex: '1 1 320px', maxWidth: 400 }}>
                                {renderPodiumCard(gold, 1)}
                            </Box>
                            <Box sx={{ flex: '1 1 320px', maxWidth: 400 }}>
                                {renderPodiumCard(silver, 2)}
                            </Box>
                        </Box>
                    )}

                    {topThree.length >= 3 && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 5, alignItems: 'stretch' }}>
                            <Box sx={{ order: { xs: 2, md: 1 } }}>
                                {renderPodiumCard(silver, 2)}
                            </Box>
                            <Box sx={{ order: { xs: 1, md: 2 } }}>
                                {renderPodiumCard(gold, 1)}
                            </Box>
                            <Box sx={{ order: { xs: 3, md: 3 } }}>
                                {renderPodiumCard(bronze, 3)}
                            </Box>
                        </Box>
                    )}

                    {/* Complete Leaderboard Table */}
                    <Card sx={{ borderRadius: 3.5, bgcolor: 'white', border: '1px solid #E2E8F0', overflow: 'hidden', mt: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                        <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Overall Athlete Standings ({entries.length} Active Athletes)
                            </Typography>
                            <Chip label="⚡ Live Rank Engine" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 'bold' }} />
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>RANK</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>ATHLETE</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }} align="center">TIER</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }} align="right">WORKOUTS</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }} align="right">TIME (MIN)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }} align="right">CALORIES</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }} align="right">PULSESCORE™</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {entries.map((entry) => {
                                        const isCurrentUser = currentUserId && (entry.userId === currentUserId);
                                        const entryAvatarSrc = entry.profilePictureUrl || (isCurrentUser ? localStorage.getItem('userAvatar') : '') || '';
                                        const tierInfo = TIER_CONFIG[entry.tier] || TIER_CONFIG.CHALLENGER;

                                        return (
                                            <TableRow
                                                key={entry.userId}
                                                sx={{
                                                    bgcolor: isCurrentUser ? 'rgba(59, 130, 246, 0.06)' : 'inherit',
                                                    borderLeft: isCurrentUser ? '4px solid #3B82F6' : 'none',
                                                    '&:hover': { bgcolor: isCurrentUser ? 'rgba(59, 130, 246, 0.1)' : '#F8FAFC' }
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ width: 28, color: entry.rank <= 3 ? '#0F172A' : '#64748B' }}>
                                                            {entry.rank === 1 ? '🥇 #1' : entry.rank === 2 ? '🥈 #2' : entry.rank === 3 ? '🥉 #3' : `#${entry.rank}`}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar src={entryAvatarSrc} sx={{ bgcolor: isCurrentUser ? '#3B82F6' : '#1E293B', width: 34, height: 34, fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                            {entry.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {entry.name}
                                                                </Typography>
                                                                {isCurrentUser && (
                                                                    <Chip label="YOU" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#3B82F6', color: 'white', fontWeight: 'bold' }} />
                                                                )}
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                @{entry.username}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={`${tierInfo.icon} ${tierInfo.label}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: tierInfo.bg,
                                                            color: tierInfo.color,
                                                            fontWeight: 'bold',
                                                            border: `1px solid ${tierInfo.border}`,
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {entry.totalWorkouts} sessions
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {entry.totalMinutes} min
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#ea580c' }}>
                                                        {entry.totalCalories?.toLocaleString()} kcal
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={`${entry.pulseScore?.toLocaleString()} pts`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#0F172A',
                                                            color: '#F8FAFC',
                                                            fontWeight: 'bold',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </>
            )}
        </Box>
    );
};

export default Leaderboard;
