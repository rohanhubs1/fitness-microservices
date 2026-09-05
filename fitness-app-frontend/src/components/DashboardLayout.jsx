import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, IconButton,
    Avatar, Chip, Divider, Tooltip, useTheme, useMediaQuery,
    Button, Container, Badge, Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import GoalProgressBanner from './GoalProgressBanner';
import AnalyticsDashboard from './AnalyticsDashboard';
import ActivityForm from './ActivityForm';
import ActivityList from './ActivityList';
import AICoachChat from './AICoachChat';
import FitnessCentres from './FitnessCentres';
import Leaderboard from './Leaderboard';
import CommunityContests from './CommunityContests';
import AdminDashboard from './AdminDashboard';
import { getActiveAnnouncement, getUserProfile } from '../store/api';

const DRAWER_WIDTH = 270;
const DRAWER_COLLAPSED_WIDTH = 76;

const ATHLETE_NAV_ITEMS = [
    { key: 0, path: '/dashboard', label: 'Dashboard & Analytics', icon: BarChartIcon, subtitle: 'Real-time charts & stats' },
    { key: 1, path: '/log-workout', label: 'Log Workout', icon: AddCircleIcon, subtitle: 'Multi-sport smart form' },
    { key: 2, path: '/history', label: 'Workout History & Recommendations', icon: HistoryIcon, subtitle: 'Filter & review sessions' },
    { key: 3, path: '/ai-coach', label: 'AI Coach Chat', icon: SmartToyIcon, subtitle: 'Grok training advisor' },
    { key: 4, path: '/fitness-centres', label: 'Fitness Centres', icon: LocationOnIcon, subtitle: 'Gyms & pools near you' },
    { key: 5, path: '/leaderboard', label: 'Community Leaderboard', icon: EmojiEventsIcon, subtitle: 'Real-time rankings & podium' },
    { key: 6, path: '/contests', label: 'Contests & Challenges', icon: CampaignIcon, subtitle: 'Live challenges & rewards' }
];

const ADMIN_NAV_ITEMS = [
    { key: 0, path: '/admin/athletes', label: 'Athlete Management', icon: PeopleAltIcon, subtitle: 'Moderation, soft-delete & telemetry' },
    { key: 1, path: '/admin/leaderboard', label: 'Platform Leaderboard', icon: EmojiEventsIcon, subtitle: 'Real-time athlete rankings' },
    { key: 2, path: '/admin/contests', label: 'Contests & Broadcasts', icon: CampaignIcon, subtitle: 'Community challenges & alerts' }
];

const DashboardLayout = ({ tokenData, logOut, onOpenProfile }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerCollapsed, setDrawerCollapsed] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeAnnouncement, setActiveAnnouncement] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const isAdmin = Boolean(
        tokenData?.realm_access?.roles?.includes('ADMIN') ||
        tokenData?.resource_access?.['oauth2-pkce-client']?.roles?.includes('ADMIN') ||
        tokenData?.roles?.includes('ADMIN') ||
        tokenData?.preferred_username?.toLowerCase() === 'admin'
    );

    const navItems = isAdmin ? ADMIN_NAV_ITEMS : ATHLETE_NAV_ITEMS;

    // Determine active tab dynamically from the browser URL path
    const getActiveTabFromPath = () => {
        const path = location.pathname;
        if (isAdmin) {
            if (path.includes('/admin/leaderboard')) return 1;
            if (path.includes('/admin/contests')) return 2;
            return 0; // /admin/athletes or /admin
        } else {
            if (path.startsWith('/log-workout')) return 1;
            if (path.startsWith('/history') || path.startsWith('/activities')) return 2;
            if (path.startsWith('/ai-coach')) return 3;
            if (path.startsWith('/fitness-centres')) return 4;
            if (path.startsWith('/leaderboard')) return 5;
            if (path.startsWith('/contests')) return 6;
            return 0; // /dashboard or /
        }
    };

    const selectedTab = getActiveTabFromPath();

    const handleNavigateTab = (tabIndexOrPath) => {
        if (typeof tabIndexOrPath === 'string') {
            navigate(tabIndexOrPath);
        } else {
            const item = navItems.find((n) => n.key === tabIndexOrPath);
            if (item?.path) navigate(item.path);
        }
        if (isMobile) setMobileOpen(false);
    };

    React.useEffect(() => {
        if (!isAdmin) {
            getActiveAnnouncement()
                .then((res) => {
                    if (res?.data?.message) {
                        setActiveAnnouncement(res.data.message);
                    }
                })
                .catch(() => {
                    const local = localStorage.getItem('admin_broadcast_message');
                    if (local) setActiveAnnouncement(local);
                });
        }
    }, [refreshKey, selectedTab, isAdmin]);

    const [userProfileData, setUserProfileData] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('userAvatar') || '');

    useEffect(() => {
        if (!isAdmin) {
            getUserProfile()
                .then((res) => {
                    if (res?.data) {
                        setUserProfileData(res.data);
                        if (res.data.profilePictureUrl) {
                            setAvatarUrl(res.data.profilePictureUrl);
                            localStorage.setItem('userAvatar', res.data.profilePictureUrl);
                        }
                    }
                })
                .catch(() => {});
        }
    }, [refreshKey, isAdmin]);

    const isProfileIncomplete = !isAdmin && userProfileData && (!userProfileData.weight || !userProfileData.height);

    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [readNotificationIds, setReadNotificationIds] = useState(() => {
        try {
            const saved = localStorage.getItem('pulseforge_read_notifications');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Build real notifications strictly from active platform events
    const allNotifications = isAdmin ? [
        ...(activeAnnouncement ? [{ id: 'ann-admin', title: '📢 Active Contest Broadcast', desc: activeAnnouncement, time: 'Now', tab: 2, isHot: true }] : [])
    ] : [
        ...(activeAnnouncement ? [{ id: 'ann-' + encodeURIComponent(activeAnnouncement.slice(0, 20)), title: '⚡ LIVE PLATFORM BROADCAST', desc: activeAnnouncement, time: 'Now', tab: 6, isHot: true }] : []),
        ...(isProfileIncomplete ? [{ id: 'setup-profile', title: '⚠️ Complete Your Profile', desc: 'Set your body weight and height for accurate MET calorie formulas.', time: 'Action', isProfilePrompt: true, isHot: true }] : [])
    ];

    const unreadNotifications = allNotifications.filter((n) => !readNotificationIds.includes(n.id));
    const unreadCount = unreadNotifications.length;

    const handleOpenNotifications = (event) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleCloseNotifications = () => {
        setNotificationAnchor(null);
    };

    const handleNotificationClick = (item) => {
        if (!readNotificationIds.includes(item.id)) {
            const updated = [...readNotificationIds, item.id];
            setReadNotificationIds(updated);
            localStorage.setItem('pulseforge_read_notifications', JSON.stringify(updated));
        }
        if (item.isProfilePrompt && onOpenProfile) {
            onOpenProfile();
        } else if (item.tab !== undefined) {
            handleNavigateTab(item.tab);
        }
        handleCloseNotifications();
    };

    const handleMarkAllRead = () => {
        const allIds = allNotifications.map((n) => n.id);
        const updated = Array.from(new Set([...readNotificationIds, ...allIds]));
        setReadNotificationIds(updated);
        localStorage.setItem('pulseforge_read_notifications', JSON.stringify(updated));
    };

    const username = tokenData?.preferred_username || tokenData?.name || (isAdmin ? 'Platform Admin' : 'Athlete');
    const email = tokenData?.email || (isAdmin ? 'admin@pulseforge.ai' : 'user@pulseforge.ai');

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setDrawerCollapsed(!drawerCollapsed);
        }
    };

    const handleActivityAdded = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const isCollapsed = drawerCollapsed && !isMobile;

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0F172A',
            color: 'white',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
        }}>
            {/* Logo & Header */}
            <Box sx={{
                p: isCollapsed ? 1.5 : 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                minHeight: 64
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                    <Avatar sx={{ bgcolor: isAdmin ? '#9333ea' : '#ff9800', width: 36, height: 36, flexShrink: 0 }}>
                        {isAdmin ? <AdminPanelSettingsIcon sx={{ fontSize: 22, color: '#fff' }} /> : <FitnessCenterIcon sx={{ fontSize: 22, color: '#000' }} />}
                    </Avatar>
                    {!isCollapsed && (
                        <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.1, letterSpacing: 0.5 }}>
                                PulseForge <Typography component="span" variant="h6" sx={{ color: isAdmin ? '#c084fc' : '#ff9800', fontWeight: 'bold' }}>{isAdmin ? 'ADMIN' : 'AI'}</Typography>
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.68rem', display: 'block' }}>
                                {isAdmin ? 'BACKOFFICE CONSOLE' : 'ATHLETIC INTELLIGENCE'}
                            </Typography>
                        </Box>
                    )}
                </Box>
                {!isMobile && !isCollapsed && (
                    <IconButton size="small" onClick={() => setDrawerCollapsed(true)} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Box>

            {/* User Profile Card */}
            <Box sx={{
                p: isCollapsed ? 1 : 1.5,
                m: isCollapsed ? 1 : 1.5,
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 2.5,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
            }}>
                {isCollapsed ? (
                    <Tooltip title={`${username} (${isAdmin ? 'Admin' : 'Athlete'})`} placement="right">
                        <Avatar
                            src={avatarUrl || undefined}
                            sx={{ bgcolor: isAdmin ? '#7e22ce' : '#1976d2', fontWeight: 'bold', width: 36, height: 36 }}
                        >
                            {username.charAt(0).toUpperCase()}
                        </Avatar>
                    </Tooltip>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', overflow: 'hidden' }}>
                        <Avatar
                            src={avatarUrl || undefined}
                            sx={{ bgcolor: isAdmin ? '#7e22ce' : '#1976d2', fontWeight: 'bold', width: 38, height: 38, flexShrink: 0 }}
                        >
                            {username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                {username}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isAdmin ? '#c084fc' : '#4caf50', flexShrink: 0 }} />
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }} noWrap>
                                    {isAdmin ? 'System Admin' : 'Active Athlete'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Expand toggle when collapsed */}
            {isCollapsed && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
                    <IconButton size="small" onClick={() => setDrawerCollapsed(false)} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        <ChevronLeftIcon sx={{ transform: 'rotate(180deg)' }} />
                    </IconButton>
                </Box>
            )}

            {/* Navigation List */}
            <List sx={{ px: 1, flexGrow: 1, py: 1 }}>
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = selectedTab === item.key;
                    return (
                        <ListItem key={item.key} disablePadding sx={{ mb: 0.8 }}>
                            <Tooltip title={isCollapsed ? item.label : ''} placement="right">
                                <ListItemButton
                                    onClick={() => handleNavigateTab(item.path || item.key)}
                                    sx={{
                                        borderRadius: 2.5,
                                        py: 1.2,
                                        px: isCollapsed ? 1.5 : 2,
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        bgcolor: isSelected
                                            ? (isAdmin ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 152, 0, 0.15)')
                                            : 'transparent',
                                        border: isSelected
                                            ? (isAdmin ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(255, 152, 0, 0.4)')
                                            : '1px solid transparent',
                                        color: isSelected
                                            ? (isAdmin ? '#c084fc' : '#ff9800')
                                            : 'rgba(255, 255, 255, 0.75)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.06)',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        color: isSelected ? (isAdmin ? '#c084fc' : '#ff9800') : 'rgba(255, 255, 255, 0.6)',
                                        minWidth: isCollapsed ? 0 : 38,
                                        justifyContent: 'center'
                                    }}>
                                        <IconComponent />
                                    </ListItemIcon>
                                    {!isCollapsed && (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isSelected ? 'bold' : 'medium',  color: isSelected
                                                ? (isAdmin ? '#c084fc' : '#ff9800')
                                                : 'rgba(255, 255, 255, 0.9)',noWrap: true }}
                                            secondary={item.subtitle}
                                            secondaryTypographyProps={{ fontSize: '0.7rem', color: isSelected ? (isAdmin ? 'rgba(192, 132, 252, 0.8)' : 'rgba(255, 152, 0, 0.8)') : 'rgba(255, 255, 255, 0.4)', noWrap: true }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Bottom Section: Profile (Athletes Only) & Clean Sign Out */}
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {!isAdmin && (
                    !isCollapsed ? (
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AccountCircleIcon />}
                            onClick={onOpenProfile}
                            sx={{
                                borderRadius: 2,
                                color: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                textTransform: 'none',
                                fontSize: '0.85rem'
                            }}
                        >
                            Profile & Goals
                        </Button>
                    ) : (
                        <Tooltip title="Profile & Goals" placement="right">
                            <IconButton
                                onClick={onOpenProfile}
                                sx={{
                                    width: 42,
                                    height: 42,
                                    mx: 'auto',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                            >
                                <AccountCircleIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )
                )}

                {!isCollapsed ? (
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={logOut}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            bgcolor: 'rgba(244, 67, 54, 0.15)',
                            color: '#f44336',
                            border: '1px solid rgba(244, 67, 54, 0.3)',
                            '&:hover': { bgcolor: '#f44336', color: 'white' }
                        }}
                    >
                        Sign Out
                    </Button>
                ) : (
                    <Tooltip title="Sign Out" placement="right">
                        <IconButton
                            onClick={logOut}
                            sx={{
                                width: 42,
                                height: 42,
                                mx: 'auto',
                                bgcolor: 'rgba(244, 67, 54, 0.15)',
                                color: '#f44336',
                                border: '1px solid rgba(244, 67, 54, 0.3)',
                                '&:hover': { bgcolor: '#f44336', color: 'white' }
                            }}
                        >
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            {/* Sidebar for Desktop */}
            <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    width: isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        borderRight: 'none',
                        overflowX: 'hidden',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main Application Area */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
                {/* Top App Header */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        color: '#0F172A',
                        borderBottom: '1px solid #E2E8F0',
                        zIndex: 5
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <IconButton edge="start" onClick={handleDrawerToggle} sx={{ color: '#334155' }}>
                                <MenuIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                                    {navItems.find((i) => i.key === selectedTab)?.label || 'Dashboard'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    {isAdmin ? 'Backoffice Operations & Community Management' : (navItems.find((i) => i.key === selectedTab)?.subtitle || 'Smart Training & Athletic Analytics')}
                                 </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Tooltip title="Notifications">
                                <IconButton onClick={handleOpenNotifications} sx={{ color: '#334155' }}>
                                    <Badge badgeContent={unreadCount} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <Menu
                                anchorEl={notificationAnchor}
                                open={Boolean(notificationAnchor)}
                                onClose={handleCloseNotifications}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                PaperProps={{
                                    sx: {
                                        width: 340,
                                        maxHeight: 460,
                                        borderRadius: 3,
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                                        p: 1,
                                        border: '1px solid #E2E8F0'
                                    }
                                }}
                            >
                                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Notifications {unreadCount > 0 ? `(${unreadCount} new)` : ''}
                                    </Typography>
                                    {unreadCount > 0 && (
                                        <Button size="small" onClick={handleMarkAllRead} startIcon={<DoneAllIcon />} sx={{ textTransform: 'none', fontSize: '0.72rem' }}>
                                             Mark all read
                                        </Button>
                                    )}
                                </Box>
                                <Divider sx={{ mb: 1 }} />
                                {allNotifications.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center' }}>
                                        <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
                                        <Typography variant="body2" fontWeight="bold" color="text.secondary">
                                            You're All Caught Up!
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled">
                                            No platform alerts or broadcasts.
                                        </Typography>
                                    </Box>
                                ) : (
                                    allNotifications.map((n) => {
                                        const isRead = readNotificationIds.includes(n.id);
                                        return (
                                            <MenuItem
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                sx={{
                                                    borderRadius: 2,
                                                    mb: 0.5,
                                                    p: 1.2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    bgcolor: !isRead && n.isHot ? '#FAF5FF' : isRead ? '#F8FAFC' : 'transparent',
                                                    border: !isRead && n.isHot ? '1px solid #E9D5FF' : '1px solid transparent',
                                                    opacity: isRead ? 0.75 : 1
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', mb: 0.3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                        {!isRead && (
                                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7E22CE' }} />
                                                        )}
                                                        <Typography variant="caption" fontWeight="bold" sx={{ color: !isRead && n.isHot ? '#7E22CE' : '#0F172A' }}>
                                                            {n.title}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={isRead ? 'Read' : n.time}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            height: 18,
                                                            bgcolor: isRead ? '#E2E8F0' : n.isHot ? '#FEF08A' : '#F1F5F9',
                                                            color: isRead ? '#64748B' : n.isHot ? '#854D0E' : '#64748B'
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                                                    {n.desc}
                                                </Typography>
                                            </MenuItem>
                                        );
                                    })
                                )}
                            </Menu>

                            {isAdmin && (
                                <Chip
                                    icon={<AdminPanelSettingsIcon sx={{ '&&': { color: '#9333ea', fontSize: 16 } }} />}
                                    label="Root Administrator"
                                    size="small"
                                    sx={{ bgcolor: '#FAF5FF', color: '#7E22CE', fontWeight: 'bold', border: '1px solid #E9D5FF' }}
                                />
                            )}
                            <Avatar
                                src={avatarUrl || undefined}
                                onClick={!isAdmin ? onOpenProfile : undefined}
                                sx={{ bgcolor: isAdmin ? '#7e22ce' : '#ff9800', width: 36, height: 36, cursor: !isAdmin ? 'pointer' : 'default', fontWeight: 'bold', color: isAdmin ? '#fff' : '#000' }}
                            >
                                {username.charAt(0).toUpperCase()}
                            </Avatar>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Main Content Body */}
                <Container maxWidth={false} sx={{ py: 3.5, px: { xs: 2, sm: 3, md: 4 }, flexGrow: 1, width: '100%' }}>
                    {/* ADMIN VIEW */}
                    {isAdmin ? (
                        <AdminDashboard activeTab={selectedTab} onTabChange={(t) => handleNavigateTab(t)} />
                    ) : (
                        /* ATHLETE VIEW */
                        <>
                            {/* Incomplete Profile Onboarding Setup Banner */}
                            {isProfileIncomplete && (
                                <Box sx={{ mb: 3, p: 2, bgcolor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <InfoOutlinedIcon sx={{ color: '#D97706', fontSize: 28 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#92400E' }}>
                                                👋 Welcome! Complete your athlete biometrics setup
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#B45309' }}>
                                                Set your actual body weight and height to get personalized AI coaching and accurate MET calorie burns.
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={onOpenProfile}
                                        sx={{ bgcolor: '#D97706', color: 'white', fontWeight: 'bold', textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#B45309' } }}
                                    >
                                        Complete Profile
                                    </Button>
                                </Box>
                            )}

                            {/* Global Admin Broadcast Announcement Banner if active */}
                            {activeAnnouncement && (
                                <Box
                                    sx={{
                                        mb: 3,
                                        p: 2,
                                        borderRadius: 2.5,
                                        background: 'linear-gradient(90deg, #7e22ce 0%, #3b82f6 100%)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        boxShadow: 3
                                    }}
                                >
                                    <CampaignIcon sx={{ fontSize: 28, color: '#fde047' }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', color: '#fde047' }}>
                                            ⚡ LIVE PLATFORM BROADCAST
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {activeAnnouncement}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Goal Progress Banner (rendered on Log screen) */}
                            {selectedTab === 1 && (
                                <GoalProgressBanner refreshKey={refreshKey} onOpenProfile={onOpenProfile} />
                            )}

                            {/* View Switching for Athletes */}
                            {selectedTab === 0 && (
                                <AnalyticsDashboard
                                    refreshKey={refreshKey}
                                    onNavigateTab={(tab) => handleNavigateTab(tab)}
                                    onOpenProfile={onOpenProfile}
                                    username={username}
                                    avatarUrl={avatarUrl}
                                />
                            )}
                            {selectedTab === 1 && <ActivityForm onActivityAdded={handleActivityAdded} />}
                            {selectedTab === 2 && <ActivityList key={refreshKey} onActivityDeleted={() => setRefreshKey((p) => p + 1)} />}
                            {selectedTab === 3 && <AICoachChat />}
                            {selectedTab === 4 && <FitnessCentres />}
                            {selectedTab === 5 && <Leaderboard />}
                            {selectedTab === 6 && (
                                <CommunityContests
                                    onNavigateToLog={() => handleNavigateTab('/log-workout')}
                                    onNavigateToLeaderboard={() => handleNavigateTab('/leaderboard')}
                                />
                            )}
                        </>
                    )}
                </Container>

            </Box>
        </Box>
    );
};

export default DashboardLayout;