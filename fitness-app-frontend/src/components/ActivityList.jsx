import React, { useEffect, useState } from 'react'
import {Grid, Typography, Card, CardContent} from '@mui/material'
import { useNavigate } from 'react-router';
import { getActivities } from '../store/api';


const ActivityList = () => {

    const [activities, setActivities] = useState([]);
    const navigate = useNavigate();

    const fetchActivities = async () => {
        try{
            const response = await getActivities();
            setActivities(response.data);
        }catch(error){
            console.error(error);
        }
    }
    useEffect(() => {
        fetchActivities();
    },[]);

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
        {activities.length === 0 ? (
            <Grid item xs={12}>
                <Typography color="text.secondary">No activities logged yet. Add your first workout above!</Typography>
            </Grid>
        ) : (
            activities.map((activity) => (
                <Grid item xs={12} sm={6} md={4} key={activity.id}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: 4,
                            }
                        }}
                        onClick={() => navigate(`/activities/${activity.id}`)}
                    >
                        <CardContent>
                            <Typography variant='h6' color="primary">{activity.type}</Typography>
                            <Typography variant='body2'>Duration: {activity.duration} mins</Typography>
                            <Typography variant='body2'>Calories: {activity.caloriesBurned} kcal</Typography>
                            {activity.createdAt && (
                                <Typography variant='caption' color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    {new Date(activity.createdAt).toLocaleDateString()}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            ))
        )}
    </Grid>
  );
}

export default ActivityList;
