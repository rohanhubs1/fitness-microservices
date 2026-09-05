import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, TextField,
    Button, Avatar, Chip, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions, DialogContentText, Tooltip, IconButton,
    InputAdornment, CircularProgress, Alert, Snackbar, Tabs, Tab,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CampaignIcon from '@mui/icons-material/Campaign';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

import Leaderboard from './Leaderboard';
import { ContestCountdown } from './CommunityContests';
import {
    getAdminUsers,
    getAdminUserStats,
    getAdminActivityStats,
    deactivateUser,
    restoreUser,
    purgeUser,
    getAllAnnouncements,
    publishAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    clearAnnouncement
} from '../store/api';

const AdminDashboard = ({ activeTab = 0 }) => {
    const currentTab = activeTab;

    // Users & Telemetry State
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [activityStats, setActivityStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Contest & Announcement Hub State
    const [announcements, setAnnouncements] = useState([]);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementText, setAnnouncementText] = useState('');
    const [announcementType, setAnnouncementType] = useState('CHALLENGE');
    const [announcementPrize, setAnnouncementPrize] = useState('');
    const [targetSport, setTargetSport] = useState('ALL');
    const [targetMetric, setTargetMetric] = useState('CALORIES');
    const [targetGoal, setTargetGoal] = useState(1000);
    const [pointsAwarded, setPointsAwarded] = useState(500);
    const [durationDays, setDurationDays] = useState(7);
    const [announcementSubmitting, setAnnouncementSubmitting] = useState(false);

    // Modals state
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState(null); // 'DEACTIVATE' | 'RESTORE' | 'PURGE'
    const [actionLoading, setActionLoading] = useState(false);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, uStatsRes, aStatsRes, annListRes] = await Promise.allSettled([
                getAdminUsers(),
                getAdminUserStats(),
                getAdminActivityStats(),
                getAllAnnouncements()
            ]);

            if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
                setUsers(usersRes.value.data);
            }
            if (uStatsRes.status === 'fulfilled' && uStatsRes.value?.data) {
                setUserStats(uStatsRes.value.data);
            }
            if (aStatsRes.status === 'fulfilled' && aStatsRes.value?.data) {
                setActivityStats(aStatsRes.value.data);
            }
            if (annListRes.status === 'fulfilled' && annListRes.value?.data) {
                setAnnouncements(annListRes.value.data);
            }
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleConfirmAction = async () => {
        if (!selectedUser || !actionType) return;
        setActionLoading(true);
        const userId = selectedUser.keycloakId || selectedUser.id;

        try {
            if (actionType === 'DEACTIVATE') {
                await deactivateUser(userId);
                setSnackbar({
                    open: true,
                    message: `Athlete ${selectedUser.firstName || selectedUser.email} has been deactivated (Soft Deleted).`,
                    severity: 'warning'
                });
            } else if (actionType === 'RESTORE') {
                await restoreUser(userId);
                setSnackbar({
                    open: true,
                    message: `Athlete ${selectedUser.firstName || selectedUser.email} has been restored to Active.`,
                    severity: 'success'
                });
            } else if (actionType === 'PURGE') {
                await purgeUser(userId);
                setSnackbar({
                    open: true,
                    message: `Athlete account has been permanently purged from database.`,
                    severity: 'error'
                });
            }
            await loadData();
        } catch (err) {
            setSnackbar({
                open: true,
                message: `Failed to execute action: ${err.message}`,
                severity: 'error'
            });
        } finally {
            setActionLoading(false);
            setSelectedUser(null);
            setActionType(null);
        }
    };

    const handleCreateContest = async (e) => {
        e?.preventDefault();
        if (!announcementText.trim()) {
            setSnackbar({ open: true, message: 'Please enter announcement/challenge description.', severity: 'warning' });
            return;
        }

        setAnnouncementSubmitting(true);
        try {
            await publishAnnouncement({
                title: announcementTitle.trim(),
                message: announcementText.trim(),
                type: announcementType,
                prize: announcementPrize.trim(),
                targetActivityType: targetSport,
                targetMetric: targetMetric,
                targetGoal: Number(targetGoal) || 1000,
                pointsAwarded: Number(pointsAwarded) || 500,
                durationDays: Number(durationDays) || 7
            });

            setSnackbar({
                open: true,
                message: '🏆 Contest & Challenge broadcast published live to all athletes!',
                severity: 'success'
            });

            setAnnouncementTitle('');
            setAnnouncementText('');
            setAnnouncementPrize('');
            setTargetSport('ALL');
            setTargetMetric('CALORIES');
            setTargetGoal(1000);
            setPointsAwarded(500);
            setDurationDays(7);
            await loadData();
        } catch (err) {
            setSnackbar({ open: true, message: `Failed to publish contest: ${err.message}`, severity: 'error' });
        } finally {
            setAnnouncementSubmitting(false);
        }
    };

    const handleToggleContest = async (id) => {
        try {
            await toggleAnnouncement(id);
            setSnackbar({ open: true, message: 'Contest active status updated.', severity: 'info' });
            await loadData();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update contest status.', severity: 'error' });
        }
    };

    const handleDeleteContest = async (id) => {
        try {
            await deleteAnnouncement(id);
            setSnackbar({ open: true, message: 'Contest deleted.', severity: 'info' });
            await loadData();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete contest.', severity: 'error' });
        }
    };

    const handleClearAllActive = async () => {
        try {
            await clearAnnouncement();
            setSnackbar({ open: true, message: 'All active broadcasts cleared from dashboards.', severity: 'info' });
            await loadData();
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to clear broadcasts.', severity: 'error' });
        }
    };

    const athleteUsers = users.filter((u) => u.role !== 'ADMIN' && (u.email || '').toLowerCase() !== 'admin@pulseforge.ai');

    const filteredUsers = athleteUsers.filter((u) => {
        const matchesSearch =
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.fitnessGoal || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && (!u.deleted && u.status !== 'DEACTIVATED')) ||
            (statusFilter === 'DEACTIVATED' && (u.deleted || u.status === 'DEACTIVATED'));

        return matchesSearch && matchesStatus;
    });

    const activeCount = userStats?.activeUsers ?? athleteUsers.filter((u) => !u.deleted && u.status !== 'DEACTIVATED').length;
    const deactivatedCount = userStats?.deactivatedUsers ?? athleteUsers.filter((u) => u.deleted || u.status === 'DEACTIVATED').length;
    const totalCount = userStats?.totalUsers ?? athleteUsers.length;

    return (
        <Box sx={{ pb: 6 }}>
            {/* Header Title & Refresh */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Avatar sx={{ bgcolor: '#7e22ce', width: 42, height: 42 }}>
                            <AdminPanelSettingsIcon sx={{ fontSize: 24, color: '#fff' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: '#0F172A', letterSpacing: -0.5 }}>
                                Platform Operations & Administration
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Root backoffice control • User moderation, community rankings & contests
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Tooltip title="Refresh Telemetry & Records">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={loadData}
                            startIcon={<RefreshIcon />}
                            disabled={loading}
                            sx={{ borderRadius: 2, textTransform: 'none', color: '#7e22ce', borderColor: '#7e22ce', fontWeight: 'bold' }}
                        >
                            Refresh Live Data
                        </Button>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Platform Telemetry Top Cards (Athlete Management Tab only) */}
            {currentTab === 0 && (
                <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                            Total Athletes
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" sx={{ color: '#0F172A', mt: 0.5 }}>
                                            {totalCount}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 44, height: 44 }}>
                                        <PeopleAltIcon />
                                    </Avatar>
                                </Box>
                                <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                                    <Chip label={`${activeCount} Active`} size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 'bold', fontSize: '0.7rem' }} />
                                    {deactivatedCount > 0 && (
                                        <Chip label={`${deactivatedCount} Deactivated`} size="small" sx={{ bgcolor: '#FEF2F2', color: '#B91C1C', fontWeight: 'bold', fontSize: '0.7rem' }} />
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                            Workouts Logged
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" sx={{ color: '#0F172A', mt: 0.5 }}>
                                            {activityStats?.totalWorkouts ?? '0'}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 44, height: 44 }}>
                                        <FitnessCenterIcon />
                                    </Avatar>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                                    {(activityStats?.totalMinutesLogged ?? 0).toLocaleString()} Total Active Minutes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                            Total Calories Burned
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" sx={{ color: '#ea580c', mt: 0.5 }}>
                                            {(activityStats?.totalCaloriesBurned ?? 0).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', width: 44, height: 44 }}>
                                        <LocalFireDepartmentIcon />
                                    </Avatar>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                                    ~{activityStats?.averageCaloriesPerWorkout ?? 0} kcal / session avg
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                            Contests & Alerts
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" sx={{ color: '#7e22ce', mt: 0.5 }}>
                                            {announcements.filter((a) => a.active).length} Active
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: 'rgba(126, 34, 206, 0.1)', color: '#7e22ce', width: 44, height: 44 }}>
                                        <CampaignIcon />
                                    </Avatar>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                                    {announcements.length} Total Historical Broadcasts
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}



            {/* TAB 0: ATHLETE MANAGEMENT & SOFT DELETE */}
            {currentTab === 0 && (
                <Card sx={{ borderRadius: 3.5, bgcolor: 'white', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
                        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                            <Grid item xs={12} md={7}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search athletes by name, email, or goal..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#94a3b8' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    label={`All (${totalCount})`}
                                    onClick={() => setStatusFilter('ALL')}
                                    color={statusFilter === 'ALL' ? 'primary' : 'default'}
                                    variant={statusFilter === 'ALL' ? 'filled' : 'outlined'}
                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                />
                                <Chip
                                    label={`Active (${activeCount})`}
                                    onClick={() => setStatusFilter('ACTIVE')}
                                    color={statusFilter === 'ACTIVE' ? 'success' : 'default'}
                                    variant={statusFilter === 'ACTIVE' ? 'filled' : 'outlined'}
                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                />
                                <Chip
                                    label={`Deactivated (${deactivatedCount})`}
                                    onClick={() => setStatusFilter('DEACTIVATED')}
                                    color={statusFilter === 'DEACTIVATED' ? 'error' : 'default'}
                                    variant={statusFilter === 'DEACTIVATED' ? 'filled' : 'outlined'}
                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>ATHLETE</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>STATUS</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>ROLE</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>FITNESS GOAL</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>METRICS</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }} align="right">ACTIONS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredUsers.map((user) => {
                                        const isDeactivated = user.deleted || user.status === 'DEACTIVATED';
                                        const isAdminUser = user.role === 'ADMIN';

                                        return (
                                            <TableRow key={user.id || user.keycloakId} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Avatar sx={{ bgcolor: isDeactivated ? '#94a3b8' : isAdminUser ? '#7e22ce' : '#3b82f6', width: 38, height: 38, fontWeight: 'bold' }}>
                                                            {(user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)).toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Athlete'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {user.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {isDeactivated ? (
                                                        <Chip label="DEACTIVATED" size="small" sx={{ bgcolor: '#FEF2F2', color: '#B91C1C', fontWeight: 'bold', fontSize: '0.7rem' }} />
                                                    ) : (
                                                        <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 'bold', fontSize: '0.7rem' }} />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.role || 'USER'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: isAdminUser ? 'rgba(126, 34, 206, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                                            color: isAdminUser ? '#7e22ce' : '#64748b',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.7rem'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                        {(user.fitnessGoal || 'General Fitness').toLowerCase().replace('_', ' ')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {user.weight ? `${user.weight}kg` : '—'} • {user.height ? `${user.height}cm` : '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        {isDeactivated ? (
                                                            <Tooltip title="Restore Athlete Account">
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="success"
                                                                    startIcon={<RestoreIcon />}
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setActionType('RESTORE');
                                                                    }}
                                                                    sx={{ textTransform: 'none', py: 0.2 }}
                                                                >
                                                                    Restore
                                                                </Button>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip title="Soft Delete (Deactivate)">
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="warning"
                                                                    startIcon={<BlockIcon />}
                                                                    disabled={isAdminUser}
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setActionType('DEACTIVATE');
                                                                    }}
                                                                    sx={{ textTransform: 'none', py: 0.2 }}
                                                                >
                                                                    Deactivate
                                                                </Button>
                                                            </Tooltip>
                                                        )}

                                                        <Tooltip title="Permanently Purge (Hard Delete)">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                disabled={isAdminUser}
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setActionType('PURGE');
                                                                }}
                                                            >
                                                                <DeleteForeverIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Card>
            )}

            {/* TAB 1: COMMUNITY LEADERBOARD (ADMIN VIEW) */}
            {currentTab === 1 && (
                <Box>
                    <Leaderboard />
                </Box>
            )}

            {/* TAB 2: CONTESTS & BROADCASTS HUB */}
            {currentTab === 2 && (
                <Grid container spacing={3}>
                    {/* Dynamic Contest Creator Form */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ borderRadius: 3.5, bgcolor: 'white', border: '1px solid #E2E8F0', p: 1 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F172A', mb: 0.5 }}>
                                    📢 Create & Broadcast Contest
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                                    Configure custom rules, target metrics, points awarded, and duration without hardcoding.
                                </Typography>

                                <Box component="form" onSubmit={handleCreateContest}>
                                    <TextField
                                        fullWidth
                                        label="Contest / Challenge Title"
                                        placeholder="e.g. ⚡ Weekend 10K Running Challenge"
                                        value={announcementTitle}
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />

                                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Category</InputLabel>
                                                <Select
                                                    value={announcementType}
                                                    label="Category"
                                                    onChange={(e) => setAnnouncementType(e.target.value)}
                                                >
                                                    <MenuItem value="CHALLENGE">⚡ Workout Challenge</MenuItem>
                                                    <MenuItem value="CONTEST">🏆 Community Contest</MenuItem>
                                                    <MenuItem value="ALERT">🚨 Platform Alert</MenuItem>
                                                    <MenuItem value="EVENT">🎉 Special Event</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Target Sport</InputLabel>
                                                <Select
                                                    value={targetSport}
                                                    label="Target Sport"
                                                    onChange={(e) => setTargetSport(e.target.value)}
                                                >
                                                    <MenuItem value="ALL">All Sports</MenuItem>
                                                    <MenuItem value="RUNNING">Running</MenuItem>
                                                    <MenuItem value="WEIGHT_TRAINING">Weight Training</MenuItem>
                                                    <MenuItem value="CYCLING">Cycling</MenuItem>
                                                    <MenuItem value="SWIMMING">Swimming</MenuItem>
                                                    <MenuItem value="HIIT">HIIT</MenuItem>
                                                    <MenuItem value="YOGA">Yoga</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Target Metric</InputLabel>
                                                <Select
                                                    value={targetMetric}
                                                    label="Target Metric"
                                                    onChange={(e) => setTargetMetric(e.target.value)}
                                                >
                                                    <MenuItem value="CALORIES">Calories (kcal)</MenuItem>
                                                    <MenuItem value="DURATION_MINUTES">Active Time (mins)</MenuItem>
                                                    <MenuItem value="WORKOUT_COUNT">Workouts (sessions)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Target Goal"
                                                placeholder="e.g. 1000"
                                                value={targetGoal}
                                                onChange={(e) => setTargetGoal(e.target.value)}
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="PulsePoints Awarded"
                                                placeholder="e.g. 500"
                                                value={pointsAwarded}
                                                onChange={(e) => setPointsAwarded(e.target.value)}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Duration</InputLabel>
                                                <Select
                                                    value={durationDays}
                                                    label="Duration"
                                                    onChange={(e) => setDurationDays(e.target.value)}
                                                >
                                                    <MenuItem value={1}>1 Day (Daily Sprint)</MenuItem>
                                                    <MenuItem value={3}>3 Days (Weekend Challenge)</MenuItem>
                                                    <MenuItem value={7}>7 Days (Weekly Sprint)</MenuItem>
                                                    <MenuItem value={14}>14 Days (Bi-weekly)</MenuItem>
                                                    <MenuItem value={30}>30 Days (Monthly Contest)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    <TextField
                                        fullWidth
                                        label="Prize / Reward Badge (Optional)"
                                        placeholder="e.g. 🏆 500 PulsePoints + Gold Champion Badge"
                                        value={announcementPrize}
                                        onChange={(e) => setAnnouncementPrize(e.target.value)}
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />

                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Message & Athlete Instructions"
                                        placeholder="Burn at least 1000 kcal this week to claim bonus PulsePoints and climb the leaderboard podium!"
                                        value={announcementText}
                                        onChange={(e) => setAnnouncementText(e.target.value)}
                                        size="small"
                                        required
                                        sx={{ mb: 2.5 }}
                                    />

                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        disabled={announcementSubmitting}
                                        startIcon={<CampaignIcon />}
                                        sx={{
                                            bgcolor: '#7e22ce',
                                            borderRadius: 2.5,
                                            py: 1.2,
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#6b21a8' }
                                        }}
                                    >
                                        {announcementSubmitting ? 'Publishing...' : 'Publish Contest Live to Athletes'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Historical Contests & Active Manager */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ borderRadius: 3.5, bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                            <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Contests & Announcements Directory
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Manage active contests, dynamically configured rules, and platform broadcasts.
                                    </Typography>
                                </Box>

                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={handleClearAllActive}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Clear Active Alerts
                                </Button>
                            </Box>

                            {announcements.length === 0 ? (
                                <Box sx={{ p: 5, textAlign: 'center', color: '#94A3B8' }}>
                                    <CampaignIcon sx={{ fontSize: 44, mb: 1, color: '#CBD5E1' }} />
                                    <Typography variant="body2">No contests created yet.</Typography>
                                </Box>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>STATUS</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>CONTEST / RULES</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }}>AWARD</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#64748B' }} align="right">ACTIONS</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {announcements.map((item) => (
                                                <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                                    <TableCell>
                                                        {item.active ? (
                                                            <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 'bold', fontSize: '0.68rem' }} />
                                                        ) : (
                                                            <Chip label="INACTIVE" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 'bold', fontSize: '0.68rem' }} />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {item.title || 'Platform Contest'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 260 }} noWrap>
                                                            {item.message}
                                                        </Typography>
                                                        <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                                            <Chip
                                                                size="small"
                                                                label={`Sport: ${item.targetActivityType || 'ALL'}`}
                                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                                            />
                                                            <Chip
                                                                size="small"
                                                                label={`Goal: ${item.targetGoal || 1000} ${item.targetMetric === 'DURATION_MINUTES' ? 'min' : item.targetMetric === 'WORKOUT_COUNT' ? 'sessions' : 'kcal'}`}
                                                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#FEF3C7', color: '#92400E' }}
                                                            />
                                                            <ContestCountdown endDate={item.endDate} createdAt={item.createdAt} durationDays={item.durationDays || 7} />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`+${item.pointsAwarded || 500} pts`}
                                                            size="small"
                                                            sx={{ bgcolor: '#FAF5FF', color: '#7E22CE', fontWeight: 'bold', border: '1px solid #E9D5FF' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                            <Tooltip title={item.active ? 'Deactivate Contest' : 'Activate Contest'}>
                                                                <IconButton size="small" onClick={() => handleToggleContest(item.id)} color={item.active ? 'success' : 'default'}>
                                                                    {item.active ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Contest">
                                                                <IconButton size="small" color="error" onClick={() => handleDeleteContest(item.id)}>
                                                                    <DeleteForeverIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Action Confirmation Modal */}
            <Dialog open={Boolean(selectedUser && actionType)} onClose={() => { setSelectedUser(null); setActionType(null); }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {actionType === 'DEACTIVATE' && '⚠️ Confirm Soft Delete (Deactivate)'}
                    {actionType === 'RESTORE' && '✅ Confirm Athlete Restoration'}
                    {actionType === 'PURGE' && '🚨 Permanent Account Purge (Hard Delete)'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {actionType === 'DEACTIVATE' && (
                            <>
                                Are you sure you want to <strong>deactivate</strong> the athlete account for <strong>{selectedUser?.email}</strong>?
                                <br /><br />
                                This will soft-delete the account. Their workout history and AI recommendations are safely preserved, and the account can be restored at any time.
                            </>
                        )}
                        {actionType === 'RESTORE' && (
                            <>
                                Restore athlete account for <strong>{selectedUser?.email}</strong> back to Active status?
                            </>
                        )}
                        {actionType === 'PURGE' && (
                            <>
                                <strong style={{ color: '#dc2626' }}>Warning:</strong> This will <strong>permanently hard-delete</strong> the user record for <strong>{selectedUser?.email}</strong>.
                                <br /><br />
                                This action cannot be undone.
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => { setSelectedUser(null); setActionType(null); }} color="inherit" disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={actionType === 'PURGE' ? 'error' : actionType === 'DEACTIVATE' ? 'warning' : 'success'}
                        onClick={handleConfirmAction}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Action'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminDashboard;
