import React, { useState, useEffect } from 'react';
import {
    Box, Button, FormControl, InputLabel, MenuItem, Select,
    TextField, Alert, CircularProgress, Grid, Typography, Card,
    CardContent, InputAdornment, Tooltip, IconButton
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { addActivity } from '../store/api';

const MET_VALUES = {
    RUNNING: 9.8,
    WALKING: 3.8,
    CYCLING: 7.5,
    SWIMMING: 8.0,
    WEIGHT_TRAINING: 6.0,
    HIIT: 10.0,
    YOGA: 3.0
};

const ActivityForm = ({ onActivityAdded }) => {
    const [activityType, setActivityType] = useState('RUNNING');
    const [duration, setDuration] = useState('');
    const [caloriesBurned, setCaloriesBurned] = useState('');
    const [userOverridden, setUserOverridden] = useState(false);

    // Dynamic metrics
    const [distance, setDistance] = useState('');
    const [incline, setIncline] = useState('');
    const [speed, setSpeed] = useState('');
    const [laps, setLaps] = useState('');
    const [stroke, setStroke] = useState('Freestyle');
    const [muscleGroup, setMuscleGroup] = useState('Chest & Triceps');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [weightLifted, setWeightLifted] = useState('');
    const [rounds, setRounds] = useState('');
    const [yogaStyle, setYogaStyle] = useState('Vinyasa Flow');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const userWeight = parseFloat(localStorage.getItem('userWeight') || '70');

    // Auto calculate calories using MET formula
    useEffect(() => {
        if (!userOverridden && duration && !isNaN(duration) && duration > 0) {
            const met = MET_VALUES[activityType] || 6.0;
            const calculated = Math.round((parseFloat(duration) / 60) * met * userWeight);
            setCaloriesBurned(calculated.toString());
        }
    }, [duration, activityType, userOverridden, userWeight]);

    const handleDurationChange = (val) => {
        setDuration(val);
        if (!userOverridden && val && !isNaN(val) && val > 0) {
            const met = MET_VALUES[activityType] || 6.0;
            const calculated = Math.round((parseFloat(val) / 60) * met * userWeight);
            setCaloriesBurned(calculated.toString());
        }
    };

    const handleTypeChange = (newType) => {
        setActivityType(newType);
        if (!userOverridden && duration && !isNaN(duration) && duration > 0) {
            const met = MET_VALUES[newType] || 6.0;
            const calculated = Math.round((parseFloat(duration) / 60) * met * userWeight);
            setCaloriesBurned(calculated.toString());
        }
    };

    const recalculateCalories = () => {
        if (duration && !isNaN(duration) && duration > 0) {
            const met = MET_VALUES[activityType] || 6.0;
            const calculated = Math.round((parseFloat(duration) / 60) * met * userWeight);
            setCaloriesBurned(calculated.toString());
            setUserOverridden(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!duration || parseInt(duration, 10) <= 0) {
            setError('Please enter a valid workout duration in minutes.');
            return;
        }

        const calories = parseInt(caloriesBurned, 10) || Math.round((parseFloat(duration) / 60) * (MET_VALUES[activityType] || 6.0) * userWeight);

        // Build additional dynamic metrics
        const metrics = {};
        if (activityType === 'RUNNING' || activityType === 'WALKING') {
            if (distance) metrics.distanceKm = parseFloat(distance);
            if (incline) metrics.inclinePercent = parseFloat(incline);
        } else if (activityType === 'CYCLING') {
            if (distance) metrics.distanceKm = parseFloat(distance);
            if (speed) metrics.avgSpeedKmh = parseFloat(speed);
        } else if (activityType === 'SWIMMING') {
            if (laps) metrics.laps = parseInt(laps, 10);
            if (stroke) metrics.stroke = stroke;
        } else if (activityType === 'WEIGHT_TRAINING') {
            if (muscleGroup) metrics.muscleGroup = muscleGroup;
            if (sets) metrics.sets = parseInt(sets, 10);
            if (reps) metrics.reps = parseInt(reps, 10);
            if (weightLifted) metrics.weightKg = parseFloat(weightLifted);
        } else if (activityType === 'HIIT') {
            if (rounds) metrics.rounds = parseInt(rounds, 10);
        } else if (activityType === 'YOGA') {
            if (yogaStyle) metrics.style = yogaStyle;
        }

        setLoading(true);
        try {
            const payload = {
                type: activityType,
                duration: parseInt(duration, 10),
                caloriesBurned: calories,
                startTime: new Date().toISOString(),
                additionalMetrics: metrics
            };

            await addActivity(payload);
            setSuccess(true);
            setDuration('');
            setCaloriesBurned('');
            setUserOverridden(false);
            setDistance('');
            setIncline('');
            setSpeed('');
            setLaps('');
            setSets('');
            setReps('');
            setWeightLifted('');
            setRounds('');

            if (typeof onActivityAdded === 'function') {
                onActivityAdded();
            }
        } catch (err) {
            console.error('Failed to add activity:', err);
            setError(err?.response?.data?.message || 'Failed to log activity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const applyPreset = (preset) => {
        setActivityType(preset.type);
        setDuration(preset.duration.toString());
        setUserOverridden(false);
        if (preset.distance) setDistance(preset.distance.toString());
        if (preset.muscleGroup) setMuscleGroup(preset.muscleGroup);
        if (preset.sets) setSets(preset.sets.toString());
        if (preset.reps) setReps(preset.reps.toString());
        if (preset.weightLifted) setWeightLifted(preset.weightLifted.toString());
        if (preset.laps) setLaps(preset.laps.toString());
        if (preset.rounds) setRounds(preset.rounds.toString());
        if (preset.yogaStyle) setYogaStyle(preset.yogaStyle);

        const met = MET_VALUES[preset.type] || 6.0;
        const calculated = Math.round((preset.duration / 60) * met * userWeight);
        setCaloriesBurned(calculated.toString());
    };

    return (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        ⚡ Log New Workout
                    </Typography>
                </Box>

                {/* Quick Presets */}
                <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                        ⚡ Quick Workout Presets:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyPreset({ type: 'WEIGHT_TRAINING', duration: 60, muscleGroup: 'Chest & Triceps', sets: 21, reps: 12, weightLifted: 75 })}
                            sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            🏋️ 60m Heavy Push Day
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyPreset({ type: 'RUNNING', duration: 30, distance: 5.0 })}
                            sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            🏃 30m 5K Run
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyPreset({ type: 'HIIT', duration: 30, rounds: 5 })}
                            sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            🔥 30m Full Body HIIT
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyPreset({ type: 'SWIMMING', duration: 45, laps: 30 })}
                            sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            🏊 45m Swim (30 Laps)
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => applyPreset({ type: 'YOGA', duration: 30, yogaStyle: 'Vinyasa Flow' })}
                            sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            🧘 30m Vinyasa Yoga
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Workout logged successfully! AI Coach is analyzing it...</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* 1. Activity Type */}
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Activity Type</InputLabel>
                                <Select
                                    value={activityType}
                                    label="Activity Type"
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                >
                                    <MenuItem value="RUNNING">🏃 Running</MenuItem>
                                    <MenuItem value="WALKING">🚶 Walking</MenuItem>
                                    <MenuItem value="CYCLING">🚴 Cycling</MenuItem>
                                    <MenuItem value="SWIMMING">🏊 Swimming</MenuItem>
                                    <MenuItem value="WEIGHT_TRAINING">🏋️ Weight Training / Gym</MenuItem>
                                    <MenuItem value="HIIT">🔥 HIIT & Cardio</MenuItem>
                                    <MenuItem value="YOGA">🧘 Yoga & Pilates</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* 2. Duration */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Duration (Minutes)"
                                type="number"
                                inputProps={{ min: 1 }}
                                value={duration}
                                onChange={(e) => handleDurationChange(e.target.value)}
                                placeholder="e.g. 45"
                                required
                            />
                        </Grid>

                        {/* 3. Calories (Auto-calculated with override) */}
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Calories Burned (kcal)"
                                type="number"
                                inputProps={{ min: 1 }}
                                value={caloriesBurned}
                                onChange={(e) => {
                                    setCaloriesBurned(e.target.value);
                                    setUserOverridden(true);
                                }}
                                placeholder="Auto-calculated"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title="Recalculate with MET formula">
                                                <IconButton onClick={recalculateCalories} edge="end" size="small" color="primary">
                                                    <AutoFixHighIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                                helperText={userOverridden ? 'Manual override' : `⚡ Auto-estimated for ${userWeight}kg body weight`}
                            />
                        </Grid>

                        {/* ================================================================= */}
                        {/* DYNAMIC ACTIVITY-SPECIFIC INPUT FIELDS */}
                        {/* ================================================================= */}
                        {(activityType === 'RUNNING' || activityType === 'WALKING') && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Distance (km)"
                                        type="number"
                                        inputProps={{ step: 0.1, min: 0 }}
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        placeholder="e.g. 5.2"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Incline (%)"
                                        type="number"
                                        inputProps={{ step: 0.5, min: 0 }}
                                        value={incline}
                                        onChange={(e) => setIncline(e.target.value)}
                                        placeholder="e.g. 2.0"
                                    />
                                </Grid>
                            </>
                        )}

                        {activityType === 'CYCLING' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Distance (km)"
                                        type="number"
                                        inputProps={{ step: 0.1, min: 0 }}
                                        value={distance}
                                        onChange={(e) => setDistance(e.target.value)}
                                        placeholder="e.g. 15.0"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Avg Speed (km/h)"
                                        type="number"
                                        inputProps={{ step: 0.5, min: 0 }}
                                        value={speed}
                                        onChange={(e) => setSpeed(e.target.value)}
                                        placeholder="e.g. 22.5"
                                    />
                                </Grid>
                            </>
                        )}

                        {activityType === 'SWIMMING' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Total Laps"
                                        type="number"
                                        inputProps={{ min: 1 }}
                                        value={laps}
                                        onChange={(e) => setLaps(e.target.value)}
                                        placeholder="e.g. 20"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Primary Stroke</InputLabel>
                                        <Select
                                            value={stroke}
                                            label="Primary Stroke"
                                            onChange={(e) => setStroke(e.target.value)}
                                        >
                                            <MenuItem value="Freestyle">Freestyle</MenuItem>
                                            <MenuItem value="Breaststroke">Breaststroke</MenuItem>
                                            <MenuItem value="Backstroke">Backstroke</MenuItem>
                                            <MenuItem value="Butterfly">Butterfly</MenuItem>
                                            <MenuItem value="Mixed">Mixed Medley</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        )}

                        {activityType === 'WEIGHT_TRAINING' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Target Muscle Group</InputLabel>
                                        <Select
                                            value={muscleGroup}
                                            label="Target Muscle Group"
                                            onChange={(e) => setMuscleGroup(e.target.value)}
                                        >
                                            <MenuItem value="Chest & Triceps">Chest & Triceps</MenuItem>
                                            <MenuItem value="Back & Biceps">Back & Biceps</MenuItem>
                                            <MenuItem value="Legs & Calves">Legs & Calves</MenuItem>
                                            <MenuItem value="Shoulders & Traps">Shoulders & Traps</MenuItem>
                                            <MenuItem value="Full Body / Core">Full Body / Core</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <TextField
                                        fullWidth
                                        label="Sets"
                                        type="number"
                                        inputProps={{ min: 1 }}
                                        value={sets}
                                        onChange={(e) => setSets(e.target.value)}
                                        placeholder="4"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <TextField
                                        fullWidth
                                        label="Reps/Set"
                                        type="number"
                                        inputProps={{ min: 1 }}
                                        value={reps}
                                        onChange={(e) => setReps(e.target.value)}
                                        placeholder="10"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <TextField
                                        fullWidth
                                        label="Max Wt (kg)"
                                        type="number"
                                        inputProps={{ step: 2.5, min: 0 }}
                                        value={weightLifted}
                                        onChange={(e) => setWeightLifted(e.target.value)}
                                        placeholder="75"
                                    />
                                </Grid>
                            </>
                        )}

                        {activityType === 'HIIT' && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Rounds / Circuits Completed"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    value={rounds}
                                    onChange={(e) => setRounds(e.target.value)}
                                    placeholder="e.g. 5"
                                />
                            </Grid>
                        )}

                        {activityType === 'YOGA' && (
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Yoga Style</InputLabel>
                                    <Select
                                        value={yogaStyle}
                                        label="Yoga Style"
                                        onChange={(e) => setYogaStyle(e.target.value)}
                                    >
                                        <MenuItem value="Vinyasa Flow">Vinyasa Flow</MenuItem>
                                        <MenuItem value="Hatha Yoga">Hatha Yoga</MenuItem>
                                        <MenuItem value="Power Yoga">Power Yoga</MenuItem>
                                        <MenuItem value="Ashtanga">Ashtanga</MenuItem>
                                        <MenuItem value="Restorative / Yin">Restorative / Yin</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ px: 4, py: 1.2, fontWeight: 'bold' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : '🔥 Log Workout'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ActivityForm;
