import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button,
    Avatar, Stack, Chip, CircularProgress, Paper, Tooltip
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';
import { sendAIChatMessage, getUserProfile } from '../store/api';

const PROMPT_SUGGESTIONS = [
    '💪 Give me a 4-day Push-Pull-Legs split for muscle gain',
    '🥗 How much daily protein do I need for my weight?',
    '🏃 What is the optimal heart rate zone for fat loss?',
    '🩹 How to recover faster from intense leg day soreness?'
];

const AICoachChat = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: '👋 Hello Athlete! I am your **PulseForge AI Coach**.\n\nAsk me anything about your training splits, daily protein goals, heart rate zones, or recovery protocols!',
            source: 'system'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        getUserProfile()
            .then((res) => {
                if (res.data) setProfile(res.data);
            })
            .catch(() => {});
    }, []);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (textToSend) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: query };
        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInput('');
        setLoading(true);

        try {
            const payload = {
                message: query,
                userWeight: profile?.weight || parseFloat(localStorage.getItem('userWeight') || '75'),
                userHeight: profile?.height || 175.0,
                fitnessGoal: profile?.fitnessGoal || 'MUSCLE_BUILDING',
                age: profile?.age || 25,
                gender: profile?.gender || 'Male'
            };

            const response = await sendAIChatMessage(payload);
            const data = response.data;

            const aiMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.reply || 'Great question! Keep maintaining progressive overload and consistent nutrition.',
                source: data.source,
                cached: data.cached,
                responseTimeMs: data.responseTimeMs
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            console.warn('AI Chat error:', err);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: '🎯 **AI Coach Guidance**:\n\nFocus on progressive overload, adequate hydration (3+ Liters/day), and consuming 1.8-2.2g of protein per kg of body weight for optimal recovery!',
                    source: 'fallback'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#ff9800', color: '#000' }}>
                        <AutoAwesomeIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            PulseForge AI Fitness Coach
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Personalized with your biometrics ({profile?.weight || 75}kg • {(profile?.fitnessGoal || 'FITNESS').replace('_', ' ')})
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Quick Suggestion Chips */}
            <Stack direction="row" spacing={1} sx={{ p: 1.5, bgcolor: '#F8FAFC', overflowX: 'auto', borderBottom: '1px solid #E2E8F0' }}>
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                    <Chip
                        key={idx}
                        label={s}
                        size="small"
                        onClick={() => handleSend(s)}
                        sx={{ cursor: 'pointer', bgcolor: 'white', border: '1px solid #CBD5E1', '&:hover': { bgcolor: '#F1F5F9' } }}
                    />
                ))}
            </Stack>

            {/* Messages Area */}
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((m) => (
                    <Box
                        key={m.id}
                        sx={{
                            display: 'flex',
                            justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                            gap: 1.5
                        }}
                    >
                        {m.sender === 'ai' && (
                            <Avatar sx={{ bgcolor: '#ff9800', color: '#000', width: 34, height: 34, mt: 0.5 }}>
                                <SmartToyIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                        )}
                        <Box sx={{ maxWidth: { xs: '85%', sm: '75%' } }}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: m.sender === 'user' ? '#1E3A8A' : '#F1F5F9',
                                    color: m.sender === 'user' ? 'white' : '#0F172A',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.6
                                }}
                            >
                                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                    {m.text}
                                </Typography>
                            </Paper>
                        </Box>
                        {m.sender === 'user' && (
                            <Avatar sx={{ bgcolor: '#1E3A8A', width: 34, height: 34, mt: 0.5 }}>
                                <PersonIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Avatar>
                        )}
                    </Box>
                ))}
                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#ff9800', color: '#000', width: 34, height: 34 }}>
                            <SmartToyIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Paper sx={{ p: 1.5, borderRadius: 3, bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} />
                            <Typography variant="caption" color="text.secondary">
                                AI Coach is analyzing your biometrics...
                            </Typography>
                        </Paper>
                    </Box>
                )}
                <div ref={chatEndRef} />
            </CardContent>

            {/* Input Bar */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: '#E2E8F0', display: 'flex', gap: 1, bgcolor: 'white' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Ask your AI Coach a question (e.g. workout splits, protein timing, recovery)..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button
                    variant="contained"
                    disabled={!input.trim() || loading}
                    onClick={() => handleSend()}
                    endIcon={<SendIcon />}
                    sx={{ px: 3, bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
                >
                    Ask
                </Button>
            </Box>
        </Card>
    );
};

export default AICoachChat;