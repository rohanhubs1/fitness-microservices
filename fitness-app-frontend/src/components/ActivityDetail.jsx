import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getActivity, getActivityRecommendation } from '../store/api';
import { Box, Card, CardContent, CircularProgress, Divider, Typography } from '@mui/material';

const ActivityDetail = () => {
    const { id } = useParams();
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            {activity && (
                <Card sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Activity Details
                        </Typography>
                        <Typography>Type: {activity.type}</Typography>
                        <Typography>Duration: {activity.duration} minutes</Typography>
                        <Typography>Calories Burned: {activity.caloriesBurned}</Typography>
                        {activity.createdAt && (
                            <Typography>Date: {new Date(activity.createdAt).toLocaleString()}</Typography>
                        )}
                    </CardContent>
                </Card>
            )}

            {recommendation ? (
                <Card>
                    <CardContent>
                        <Typography variant="h5" color="primary" gutterBottom>
                            AI Coach Recommendation (Grok)
                        </Typography>

                        <Typography variant="h6" sx={{ mt: 1 }}>
                            Analysis
                        </Typography>
                        <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                            {recommendation.recommendation}
                        </Typography>

                        {recommendation.improvements && recommendation.improvements.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6">Improvements</Typography>
                                {recommendation.improvements.map((improvement, index) => (
                                    <Typography key={index} paragraph>
                                        • {improvement}
                                    </Typography>
                                ))}
                            </>
                        )}

                        {recommendation.suggestions && recommendation.suggestions.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6">Suggestions</Typography>
                                {recommendation.suggestions.map((suggestion, index) => (
                                    <Typography key={index} paragraph>
                                        • {suggestion}
                                    </Typography>
                                ))}
                            </>
                        )}

                        {recommendation.safety && recommendation.safety.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6">Safety Guidelines</Typography>
                                {recommendation.safety.map((safety, index) => (
                                    <Typography key={index} paragraph>
                                        • {safety}
                                    </Typography>
                                ))}
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary">
                            AI recommendation is being processed. Please refresh in a moment.
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default ActivityDetail;
