import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Alert, CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import { addActivity } from '../store/api'

const ActivityForm = ({ onActivityAdded }) => {
    const [activity, setActivity] = useState({
        type: "RUNNING",
        duration: '',
        caloriesBurned: '',
        additionalMetrics: {}
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!activity.duration || !activity.caloriesBurned) {
            setError("Please fill in both duration and calories burned.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                type: activity.type,
                duration: parseInt(activity.duration, 10),
                caloriesBurned: parseInt(activity.caloriesBurned, 10),
                startTime: new Date().toISOString(),
                additionalMetrics: {}
            };

            await addActivity(payload);
            setSuccess(true);
            setActivity({ type: "RUNNING", duration: '', caloriesBurned: '', additionalMetrics: {} });
            if (typeof onActivityAdded === 'function') {
                onActivityAdded();
            }
        } catch (err) {
            console.error("Failed to add activity:", err);
            setError(err?.response?.data?.message || "Failed to log activity. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Activity logged successfully! AI Coach is analyzing it...</Alert>}

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Activity Type</InputLabel>
                <Select
                    value={activity.type}
                    label="Activity Type"
                    onChange={(e) => setActivity({ ...activity, type: e.target.value })}
                >
                    <MenuItem value="RUNNING">Running</MenuItem>
                    <MenuItem value="WALKING">Walking</MenuItem>
                    <MenuItem value="CYCLING">Cycling</MenuItem>
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="Duration (Minutes)"
                type="number"
                inputProps={{ min: 1 }}
                sx={{ mb: 2 }}
                value={activity.duration}
                onChange={(e) => setActivity({ ...activity, duration: e.target.value })}
            />

            <TextField
                fullWidth
                label="Calories Burned (kcal)"
                type="number"
                inputProps={{ min: 1 }}
                sx={{ mb: 2 }}
                value={activity.caloriesBurned}
                onChange={(e) => setActivity({ ...activity, caloriesBurned: e.target.value })}
            />

            <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Log Activity"}
            </Button>
        </Box>
    );
};

export default ActivityForm;
