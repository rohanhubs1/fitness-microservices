import React from 'react';
import {
    Box, Container, Typography, Button, Grid, Card, CardContent,
    Stack, Chip, Avatar, Paper, useTheme
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';

const APP_FEATURES = [
    {
        icon: SmartToyIcon,
        color: '#a855f7',
        badge: 'Grok AI Engine',
        title: '24/7 Grok AI Athletic Coach',
        description: 'Instant post-workout physiological analysis, progressive overload recommendations, recovery cues, and real-time interactive training advice.'
    },
    {
        icon: EmojiEventsIcon,
        color: '#ff9800',
        badge: 'Podium Rankings',
        title: 'PulseScore Rating & Community Podium',
        description: 'Unified athletic scoring combining active calories, training duration, consistency streaks, and completed challenge bonuses on live podiums.'
    },
    {
        icon: CampaignIcon,
        color: '#ec4899',
        badge: 'Live Challenges',
        title: 'Live Timed Contests & PulsePoints',
        description: 'Participate in community challenges with ticking live countdown timers, achieve caloric targets, and earn exclusive PulsePoints and prizes.'
    },
    {
        icon: BarChartIcon,
        color: '#3b82f6',
        badge: 'Visual Analytics',
        title: '7-Day Caloric Trends & Sport Analytics',
        description: 'Interactive visual energy charts, multi-sport distribution rings, daily progress meters, and active streak milestones.'
    },
    {
        icon: LocationOnIcon,
        color: '#10b981',
        badge: 'Map Navigation',
        title: 'Fitness & Sports Centres Locator',
        description: 'Discover premier gyms, Olympic swimming pools, CrossFit boxes, and yoga sanctuaries near you with one-tap Google Maps directions.'
    },
    {
        icon: SpeedIcon,
        color: '#f59e0b',
        badge: 'Scientific MET',
        title: 'Precision ACSM Caloric Engine',
        description: 'Stanford ACSM scientific formulas tailored dynamically to your body weight and height across 7 specialized sport categories.'
    }
];

const LandingPage = ({ onLogin }) => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0B0F19', color: 'white', overflowX: 'hidden' }}>
            {/* Top Navigation Bar */}
            <Box
                sx={{
                    py: 2,
                    px: { xs: 2, md: 6 },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    bgcolor: 'rgba(11, 15, 25, 0.9)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#ff9800', width: 42, height: 42 }}>
                        <FitnessCenterIcon sx={{ color: '#000', fontSize: 24 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: 0.5, lineHeight: 1.1 }}>
                            PulseForge <Typography component="span" variant="h5" sx={{ color: '#ff9800', fontWeight: '900' }}>AI</Typography>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', letterSpacing: 1 }}>
                            ATHLETIC INTELLIGENCE PLATFORM
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={onLogin}
                        sx={{
                            bgcolor: '#ff9800',
                            color: '#000',
                            fontWeight: 'bold',
                            px: 3.5,
                            py: 1,
                            borderRadius: 2.5,
                            boxShadow: '0 4px 14px rgba(255, 152, 0, 0.35)',
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            '&:hover': { bgcolor: '#f57c00' }
                        }}
                    >
                        Sign In / Join
                    </Button>
                </Box>
            </Box>

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, textAlign: 'center' }}>
                <Chip
                    icon={<AutoAwesomeIcon sx={{ '&&': { color: '#ff9800' } }} />}
                    label="⚡ Next-Gen Athletic Intelligence & Community Fitness"
                    sx={{
                        bgcolor: 'rgba(255, 152, 0, 0.12)',
                        color: '#ffb74d',
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                        mb: 3,
                        fontWeight: 'bold',
                        px: 1.5,
                        py: 0.5
                    }}
                />

                <Typography
                    variant="h2"
                    fontWeight="900"
                    sx={{
                        fontSize: { xs: '2.5rem', sm: '3.6rem', md: '4.4rem' },
                        lineHeight: 1.15,
                        mb: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #ff9800 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: -0.5
                    }}
                >
                    Transform Your Fitness With Intelligent AI Coaching
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        maxWidth: 780,
                        mx: 'auto',
                        color: 'rgba(255, 255, 255, 0.72)',
                        lineHeight: 1.65,
                        mb: 5,
                        fontSize: { xs: '1.05rem', md: '1.25rem' }
                    }}
                >
                    Log workouts across 7 sports with dynamic biometric metrics, auto-calculated MET calories, real-time PulseScore podium rankings, and instant Grok AI training insights.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 8 }}>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={onLogin}
                        sx={{
                            bgcolor: '#ff9800',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            px: 4.5,
                            py: 1.8,
                            borderRadius: 3,
                            boxShadow: '0 8px 25px rgba(255, 152, 0, 0.45)',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#f57c00', transform: 'translateY(-2px)' }
                        }}
                    >
                        Launch Athlete Dashboard
                    </Button>
                </Stack>

                {/* Live Metric Stats Bar */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                    gridAutoRows: '1fr',
                    gap: 2.5,
                    maxWidth: 950,
                    mx: 'auto',
                    mb: 10
                }}>
                    {[
                        { value: '7+', label: 'Sport Disciplines', sub: 'Gym, Run, Swim, HIIT, Yoga, Cycling' },
                        { value: '24/7', label: 'Grok AI Coach', sub: 'Instant Post-Workout Feedback' },
                        { value: 'PulseScore', label: 'Community Podiums', sub: 'Live Dynamic Athlete Rankings' },
                        { value: 'Live Contests', label: 'Timed Challenges', sub: 'Ticking Timers & Bonus Points' }
                    ].map((stat, i) => (
                        <Paper
                            key={i}
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(8px)',
                                textAlign: 'center',
                                height: '100%',
                                minHeight: 130,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#ff9800', mb: 0.5 }}>
                                {stat.value}
                            </Typography>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white', fontSize: '0.88rem' }}>
                                {stat.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                {stat.sub}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            </Container>

            {/* Core App Features Bento Grid */}
            <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', py: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="overline" sx={{ color: '#ff9800', fontWeight: 'bold', letterSpacing: 2 }}>
                            PLATFORM FEATURES
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                            Everything You Need To Elevate Your Fitness
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                        gridAutoRows: '1fr',
                        gap: 3,
                        alignItems: 'stretch'
                    }}>
                        {APP_FEATURES.map((feat, index) => {
                            const IconComponent = feat.icon;
                            return (
                                <Card
                                    key={index}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            borderColor: feat.color,
                                            boxShadow: `0 12px 30px ${feat.color}25`
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: `${feat.color}20`,
                                                    color: feat.color,
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 3
                                                }}
                                            >
                                                <IconComponent fontSize="medium" />
                                            </Avatar>
                                            <Chip
                                                label={feat.badge}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${feat.color}15`,
                                                    color: feat.color,
                                                    border: `1px solid ${feat.color}40`,
                                                    fontWeight: 'bold',
                                                    fontSize: '0.72rem'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', mb: 1.2, fontSize: '1.15rem', minHeight: '3.2rem', display: 'flex', alignItems: 'center' }}>
                                            {feat.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.65, fontSize: '0.88rem', flexGrow: 1 }}>
                                            {feat.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                </Container>
            </Box>

            {/* Call To Action Banner */}
            <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
                <Paper
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 5,
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                >
                    <Typography variant="h4" fontWeight="900" sx={{ mb: 2, color: 'white' }}>
                        Ready To Unleash Your Full Athletic Potential?
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 4, maxWidth: 600, mx: 'auto' }}>
                        Join PulseForge AI today. Track your workouts, consult Grok AI for tailored advice, and climb the community leaderboard.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={onLogin}
                        sx={{
                            bgcolor: '#ff9800',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '1.05rem',
                            px: 4.5,
                            py: 1.6,
                            borderRadius: 3,
                            boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#f57c00' }
                        }}
                    >
                        Sign In / Get Started Now
                    </Button>
                </Paper>
            </Container>

            {/* Clean Footer */}
            <Box sx={{ py: 4, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    © 2026 PulseForge AI. Empowering athletes with intelligent coaching and live community competition.
                </Typography>
            </Box>
        </Box>
    );
};

export default LandingPage;