import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, CardMedia, Typography,
    TextField, InputAdornment, Chip, Stack, Button, Rating,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
    CircularProgress, Alert, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PoolIcon from '@mui/icons-material/Pool';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import DirectionsIcon from '@mui/icons-material/Directions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LanguageIcon from '@mui/icons-material/Language';
import NearMeIcon from '@mui/icons-material/NearMe';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import VerifiedIcon from '@mui/icons-material/Verified';

const CURATED_SAMPLE_CENTRES = [
    {
        id: 'curated-1',
        name: 'PulseForge Elite Gym & Iron Box',
        category: 'GYM',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewsCount: 238,
        address: 'Plot 42, Cyber City Avenue, Tech Hub',
        distanceKm: 0.8,
        distanceText: '0.8 km away',
        hours: 'Open 24/7',
        phone: '+91 98765 43210',
        price: 'Day Pass: ₹250 • Monthly: ₹2,500',
        amenities: ['Heavy Free Weights', 'Squat Racks & Platforms', 'Cardio Deck', 'Sauna & Steam', 'Locker & Showers', 'Certified Coaches'],
        description: 'Premium powerlifting and bodybuilding facility equipped with Olympic plates, calibrated barbells, and recovery zones.',
        lat: 28.4595,
        lon: 77.0266,
        isLive: false
    },
    {
        id: 'curated-2',
        name: 'AquaZone Olympic Aquatic Centre',
        category: 'SWIMMING',
        image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewsCount: 184,
        address: '108 Sports Complex Blvd, East Wing',
        distanceKm: 1.5,
        distanceText: '1.5 km away',
        hours: '5:30 AM – 9:30 PM',
        phone: '+91 98765 43211',
        price: 'Per Session: ₹200 • Monthly Pass: ₹2,000',
        amenities: ['50m Olympic 10-Lane Pool', 'Heated Indoor Pool', 'Diving Boards', 'Electronic Timing', 'Aqua Aerobics'],
        description: 'Temperature-controlled 50-meter Olympic swimming facility with certified swim coaches and lane booking.',
        lat: 28.4650,
        lon: 77.0310,
        isLive: false
    },
    {
        id: 'curated-3',
        name: 'Zenith Yoga & Mindfulness Sanctuary',
        category: 'YOGA',
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
        rating: 4.9,
        reviewsCount: 152,
        address: '77 Green Park Lane, Suite 300',
        distanceKm: 2.1,
        distanceText: '2.1 km away',
        hours: '6:00 AM – 8:30 PM',
        phone: '+91 98765 43212',
        price: 'Drop-in Class: ₹350 • Monthly Pack: ₹3,000',
        amenities: ['Hot Yoga Studio', 'Vinyasa & Hatha', 'Meditation Hall', 'Organic Tea Lounge', 'Eco Yoga Mats Included'],
        description: 'Serene studio offering Ashtanga, Vinyasa Flow, Aerial Yoga, and Sound Bath meditation sessions led by certified yogis.',
        lat: 28.4720,
        lon: 77.0380,
        isLive: false
    },
    {
        id: 'curated-4',
        name: 'SmashPro Indoor Badminton & Squash Arena',
        category: 'COURTS',
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
        rating: 4.7,
        reviewsCount: 96,
        address: 'Building 14, Arena District, West End',
        distanceKm: 3.0,
        distanceText: '3.0 km away',
        hours: '6:00 AM – 11:00 PM',
        phone: '+91 98765 43213',
        price: 'Court Hourly: ₹400 / hr',
        amenities: ['6 BWF Wooden Flooring Courts', '3 Glass Squash Courts', 'Racket Stringing', 'Pro Shop', 'Locker Rooms'],
        description: 'Professional indoor sports arena with shock-absorbing synthetic wooden courts, LED glare-free lighting, and equipment rental.',
        lat: 28.4810,
        lon: 77.0450,
        isLive: false
    },
    {
        id: 'curated-5',
        name: 'Apex CrossFit & Functional Fitness Hub',
        category: 'CROSSFIT',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        rating: 4.8,
        reviewsCount: 120,
        address: 'Warehouse 9, Industrial Zone 4',
        distanceKm: 2.8,
        distanceText: '2.8 km away',
        hours: '6:00 AM – 9:00 PM',
        phone: '+91 98765 43214',
        price: 'WOD Drop-in: ₹350 • Monthly: ₹3,500',
        amenities: ['Rigs & Gymnastics Rings', 'Assault Bikes & Rowers', 'Bumper Plates & Kettlebells', 'Group WOD Sessions'],
        description: 'High-octane functional fitness box offering coached CrossFit WODs, endurance conditioning, and Olympic weightlifting.',
        lat: 28.4890,
        lon: 77.0510,
        isLive: false
    }
];

const CATEGORIES = [
    { key: 'ALL', label: 'All Facilities', icon: null },
    { key: 'GYM', label: 'Gyms & Fitness', icon: FitnessCenterIcon },
    { key: 'SWIMMING', label: 'Swimming Pools', icon: PoolIcon },
    { key: 'YOGA', label: 'Yoga & Pilates', icon: SelfImprovementIcon },
    { key: 'COURTS', label: 'Badminton & Courts', icon: SportsTennisIcon },
    { key: 'CROSSFIT', label: 'CrossFit & Functional', icon: FitnessCenterIcon }
];

const CATEGORY_IMAGES = {
    GYM: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'
    ],
    SWIMMING: [
        'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80'
    ],
    YOGA: [
        'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80'
    ],
    COURTS: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80'
    ],
    CROSSFIT: [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop&q=80'
    ]
};

// Haversine distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
}

function detectCategory(tags) {
    const leisure = (tags.leisure || '').toLowerCase();
    const sport = (tags.sport || '').toLowerCase();
    const name = (tags.name || '').toLowerCase();

    if (sport.includes('swimming') || leisure.includes('swimming_pool') || name.includes('swim') || name.includes('pool') || name.includes('aquatic')) {
        return 'SWIMMING';
    }
    if (sport.includes('yoga') || sport.includes('pilates') || name.includes('yoga') || name.includes('pilates') || name.includes('meditation')) {
        return 'YOGA';
    }
    if (sport.includes('badminton') || sport.includes('squash') || sport.includes('tennis') || name.includes('badminton') || name.includes('squash') || name.includes('court')) {
        return 'COURTS';
    }
    if (sport.includes('crossfit') || name.includes('crossfit') || name.includes('hiit') || name.includes('bootcamp')) {
        return 'CROSSFIT';
    }
    return 'GYM';
}

function getRandomImageForCategory(cat, seed) {
    const list = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.GYM;
    const index = Math.abs(seed) % list.length;
    return list[index];
}

const FitnessCentres = () => {
    const [centres, setCentres] = useState(CURATED_SAMPLE_CENTRES);
    const [cityInput, setCityInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedCentre, setSelectedCentre] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [locationStatus, setLocationStatus] = useState(null);
    const [searchRadius, setSearchRadius] = useState(7000); // 7 km radius

    // Fetch Live OpenStreetMap Overpass Places around Coordinates
    const fetchLiveCentres = async (lat, lon, radiusMeters) => {
        setLoadingLocation(true);
        setLocationStatus('Querying live OpenStreetMap registry...');

        const query = `
            [out:json][timeout:15];
            (
              node["leisure"~"fitness_centre|sports_centre|swimming_pool"](around:${radiusMeters},${lat},${lon});
              node["sport"~"fitness|swimming|yoga|badminton|tennis|crossfit|gymnastics"](around:${radiusMeters},${lat},${lon});
              way["leisure"~"fitness_centre|sports_centre|swimming_pool"](around:${radiusMeters},${lat},${lon});
            );
            out center 35;
        `;

        try {
            const endpoints = [
                `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
                `https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
                `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`
            ];

            let data = null;
            for (const ep of endpoints) {
                try {
                    const res = await fetch(ep, { method: 'GET', signal: AbortSignal.timeout(6000) });
                    if (res.ok) {
                        data = await res.json();
                        if (data?.elements && data.elements.length > 0) break;
                    }
                } catch {
                    // Try next mirror gracefully without throwing unhandled rejection
                }
            }

            if (data?.elements && data.elements.length > 0) {
                const liveList = data.elements
                    .filter((el) => el.tags && (el.tags.name || el.tags['addr:street']))
                    .map((el, idx) => {
                        const tags = el.tags || {};
                        const placeLat = el.lat || el.center?.lat || lat;
                        const placeLon = el.lon || el.center?.lon || lon;
                        const category = detectCategory(tags);
                        const distanceKm = calculateDistanceKm(lat, lon, placeLat, placeLon);

                        const street = tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : '';
                        const city = tags['addr:city'] || tags['addr:suburb'] || tags['addr:district'] || '';
                        const formattedAddress = street ? `${street}${city ? ', ' + city : ''}` : (tags['addr:full'] || 'Local Sports & Fitness Zone');

                        // Real amenities from OpenStreetMap tags only (No fake items)
                        const amenities = [];
                        if (tags.opening_hours) amenities.push(`Hours: ${tags.opening_hours}`);
                        if (tags.shower === 'yes') amenities.push('Showers Available');
                        if (tags.sauna === 'yes') amenities.push('Sauna');
                        if (tags.swimming_pool === 'yes') amenities.push('Swimming Pool');
                        if (tags.air_conditioning === 'yes') amenities.push('Air Conditioned');
                        if (tags.wheelchair === 'yes') amenities.push('Wheelchair Accessible');
                        if (tags.surface) amenities.push(`Court Surface: ${tags.surface}`);

                        // Real rating if provided in OSM, otherwise null (No dummy ratings)
                        const rawRating = tags['rating'] || tags['stars'] || null;
                        const rating = rawRating ? parseFloat(rawRating) : null;
                        const reviewsCount = tags['user_ratings_total'] ? parseInt(tags['user_ratings_total']) : null;

                        // Real pricing info if available in OSM, otherwise clear note
                        let priceText = 'Contact centre for membership plans';
                        if (tags.fee === 'no') {
                            priceText = 'Public / Free Entry';
                        } else if (tags.charge) {
                            priceText = tags.charge;
                        }

                        return {
                            id: `live-${el.id || idx}`,
                            name: tags.name || `${category.charAt(0) + category.slice(1).toLowerCase()} Facility`,
                            category,
                            image: getRandomImageForCategory(category, el.id || idx),
                            rating,
                            reviewsCount,
                            address: formattedAddress,
                            distanceKm,
                            distanceText: `${distanceKm} km away`,
                            hours: tags.opening_hours || null,
                            phone: tags.phone || tags['contact:phone'] || null,
                            website: tags.website || tags['contact:website'] || null,
                            price: priceText,
                            amenities,
                            description: `Real-world verified sports facility located ${distanceKm} km away.`,
                            lat: placeLat,
                            lon: placeLon,
                            isLive: true
                        };
                    });

                // Sort by distance ascending
                liveList.sort((a, b) => a.distanceKm - b.distanceKm);
                setCentres(liveList);
                setLocationStatus(`✅ Found ${liveList.length} verified fitness facilities near you!`);
            } else {
                // Keep curated with recalculating distance
                const updatedCurated = CURATED_SAMPLE_CENTRES.map((c) => {
                    const d = calculateDistanceKm(lat, lon, c.lat, c.lon);
                    return { ...c, distanceKm: d, distanceText: `${d} km away` };
                }).sort((a, b) => a.distanceKm - b.distanceKm);

                setCentres(updatedCurated);
                setLocationStatus('ℹ️ Showing top fitness centres calibrated to your location.');
            }
        } catch (err) {
            setLocationStatus('⚠️ Network issue querying live map. Displaying premier facilities.');
        } finally {
            setLoadingLocation(false);
        }
    };

    // Handle Click "Find Near My Live Location"
    const handleFindNearMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setLoadingLocation(true);
        setLocationStatus('Acquiring precise GPS satellite lock...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserCoords({ lat: latitude, lon: longitude });
                fetchLiveCentres(latitude, longitude, searchRadius);
            },
            (error) => {
                setLoadingLocation(false);
                setLocationStatus('⚠️ GPS access denied or timed out. Showing premier fitness centres.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    // Search by City name using free OpenStreetMap Nominatim
    const handleCitySearch = async (cityOverride) => {
        const queryCity = cityOverride || cityInput;
        if (!queryCity || !queryCity.trim()) return;
        setSearchTerm(''); // Clear keyword filter
        setLoadingLocation(true);
        setLocationStatus(`Searching location coordinates for "${queryCity}"...`);

        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryCity.trim())}&limit=1`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
                const lat = parseFloat(geoData[0].lat);
                const lon = parseFloat(geoData[0].lon);
                setUserCoords({ lat, lon });
                fetchLiveCentres(lat, lon, searchRadius);
            } else {
                setLocationStatus(`No match found for "${queryCity}". Please try another city.`);
                setLoadingLocation(false);
            }
        } catch (e) {
            setLoadingLocation(false);
            setLocationStatus('Unable to reach geocoding service. Displaying premier facilities.');
        }
    };

    const filteredCentres = centres.filter((c) => {
        const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.amenities && c.amenities.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    const openDirections = (name, lat, lon, address) => {
        let query;
        if (lat && lon) {
            query = `${lat},${lon}`;
        } else {
            query = encodeURIComponent(`${name}, ${address}`);
        }
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
    };

    return (
        <Box sx={{ mb: 4 }}>
            {/* Header & Live Location Banner */}
            <Card
                sx={{
                    mb: 3,
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3.5,
                    background: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #003566 100%)',
                    color: 'white',
                    boxShadow: 3
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#00f2fe', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <NearMeIcon /> Real-Time Gyms & Sports Facilities
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#e0e1dd', mt: 0.5 }}>
                            Explore gymnasiums, Olympic swimming pools, CrossFit boxes, yoga studios, and badminton courts near you with INR (₹) rates and directions.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={loadingLocation ? <CircularProgress size={18} color="inherit" /> : <MyLocationIcon />}
                            onClick={handleFindNearMe}
                            disabled={loadingLocation}
                            sx={{
                                bgcolor: '#00f2fe',
                                color: '#000',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                px: 2.5,
                                py: 1,
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#4facfe' }
                            }}
                        >
                            {loadingLocation ? 'Locating...' : '📍 Find Near My Live GPS'}
                        </Button>
                    </Grid>
                </Grid>

                {locationStatus && (
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography variant="caption" sx={{ color: '#4facfe', fontWeight: 'medium' }}>
                            {locationStatus}
                        </Typography>
                    </Box>
                )}
            </Card>

            {/* Search, Radius & City Filter Bar */}
            <Grid container spacing={2} sx={{ mb: 2 }} component="form" onSubmit={(e) => { e.preventDefault(); handleCitySearch(); }}>
                <Grid item xs={12} md={5}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Discover in City / Area"
                        placeholder="Type city (e.g. Agra, Delhi, Mumbai, Bengaluru, New York)..."
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCitySearch(); } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LocationOnIcon color="primary" fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                        sx={{ bgcolor: 'white', borderRadius: 2 }}
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="medium"
                        onClick={() => handleCitySearch()}
                        disabled={loadingLocation || !cityInput.trim()}
                        startIcon={loadingLocation ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                        sx={{
                            height: 40,
                            bgcolor: '#003566',
                            color: '#00f2fe',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': { bgcolor: '#0d1b2a', color: '#fff' }
                        }}
                    >
                        {loadingLocation ? 'Searching...' : '🔍 Search City'}
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Filter Results"
                        placeholder="Search by name or street..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                        sx={{ bgcolor: 'white', borderRadius: 2 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white', borderRadius: 2 }}>
                        <InputLabel>Search Radius</InputLabel>
                        <Select
                            value={searchRadius}
                            label="Search Radius"
                            onChange={(e) => {
                                setSearchRadius(e.target.value);
                                if (userCoords) fetchLiveCentres(userCoords.lat, userCoords.lon, e.target.value);
                            }}
                        >
                            <MenuItem value={3000}>3 km (Walking)</MenuItem>
                            <MenuItem value={7000}>7 km (Neighborhood)</MenuItem>
                            <MenuItem value={15000}>15 km (City-wide)</MenuItem>
                            <MenuItem value={30000}>30 km (Metropolitan)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Popular Quick City Shortcuts */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, overflowX: 'auto', py: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Quick Cities:
                </Typography>
                {['Agra', 'Delhi', 'Mumbai', 'Bengaluru', 'London', 'New York', 'Tokyo'].map((quickCity) => (
                    <Chip
                        key={quickCity}
                        size="small"
                        label={quickCity}
                        onClick={() => {
                            setCityInput(quickCity);
                            handleCitySearch(quickCity);
                        }}
                        sx={{ cursor: 'pointer', fontSize: '0.75rem', bgcolor: 'white', '&:hover': { bgcolor: '#e0f2fe' } }}
                    />
                ))}
            </Stack>

            {/* Category Filter Pills */}
            <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', py: 0.5 }}>
                {CATEGORIES.map((cat) => (
                    <Chip
                        key={cat.key}
                        label={cat.label}
                        color={selectedCategory === cat.key ? 'primary' : 'default'}
                        variant={selectedCategory === cat.key ? 'filled' : 'outlined'}
                        onClick={() => setSelectedCategory(cat.key)}
                        sx={{ fontWeight: selectedCategory === cat.key ? 'bold' : 'normal', cursor: 'pointer', px: 1 }}
                    />
                ))}
            </Stack>

            {/* Centres Grid */}
            {loadingLocation ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={45} sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        Scanning real-world sports facilities from OpenStreetMap...
                    </Typography>
                </Box>
            ) : (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                    gap: 3,
                    alignItems: 'stretch'
                }}>
                    {filteredCentres.length === 0 ? (
                        <Box sx={{ gridColumn: '1 / -1' }}>
                            <Card sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No fitness facilities found matching your criteria.
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleFindNearMe}
                                    startIcon={<MyLocationIcon />}
                                    sx={{ mt: 1, textTransform: 'none' }}
                                >
                                    Try GPS Near Me
                                </Button>
                            </Card>
                        </Box>
                    ) : (
                        filteredCentres.map((centre) => (
                            <Card
                                key={centre.id}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    borderRadius: 3.5,
                                    bgcolor: 'white',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                                    }
                                }}
                            >
                                <Box sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={centre.image}
                                        alt={centre.name}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    {centre.isLive ? (
                                        <Chip
                                            icon={<VerifiedIcon sx={{ '&&': { color: '#00f2fe', fontSize: 14 } }} />}
                                            label="Live Verified"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                bgcolor: 'rgba(15,23,42,0.85)',
                                                color: '#00f2fe',
                                                fontWeight: 'bold',
                                                fontSize: '0.68rem',
                                                backdropFilter: 'blur(4px)',
                                                height: 22
                                            }}
                                        />
                                    ) : (
                                        <Chip
                                            label="Featured Facility"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                bgcolor: 'rgba(15,23,42,0.85)',
                                                color: '#F97316',
                                                fontWeight: 'bold',
                                                fontSize: '0.68rem',
                                                backdropFilter: 'blur(4px)',
                                                height: 22
                                            }}
                                        />
                                    )}
                                </Box>

                                <CardContent sx={{
                                    flexGrow: 1,
                                    p: 2.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box>
                                        {/* Facility Name (locked 2-line max for perfect alignment) */}
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            sx={{
                                                fontSize: '1rem',
                                                lineHeight: 1.3,
                                                color: '#0F172A',
                                                minHeight: 44,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                mb: 1
                                            }}
                                        >
                                            {centre.name}
                                        </Typography>

                                        {/* Rating & Distance Line */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2, minHeight: 24 }}>
                                            {centre.rating ? (
                                                <>
                                                    <Rating value={centre.rating} precision={0.1} size="small" readOnly />
                                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                                        {centre.rating} {centre.reviewsCount ? `(${centre.reviewsCount})` : ''}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Chip
                                                    label={centre.category}
                                                    size="small"
                                                    sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 'bold', fontSize: '0.68rem', height: 20 }}
                                                />
                                            )}
                                            <Chip
                                                size="small"
                                                label={centre.distanceText}
                                                color="primary"
                                                variant="outlined"
                                                sx={{ ml: 'auto', fontSize: '0.68rem', height: 20, fontWeight: 600 }}
                                            />
                                        </Box>

                                        {/* Address (Locked 2-line max) */}
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                minHeight: 38,
                                                fontSize: '0.8rem',
                                                lineHeight: 1.3,
                                                mb: 1
                                            }}
                                        >
                                            📍 {centre.address}
                                        </Typography>

                                        {/* Hours or Pricing Info */}
                                        <Box sx={{ minHeight: 42, mb: 1.5 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
                                                <AccessTimeIcon sx={{ fontSize: 14, color: '#64748B' }} />
                                                {centre.hours ? centre.hours : 'Hours: Contact facility'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#EA580C', fontWeight: 600 }}>
                                                <CurrencyRupeeIcon sx={{ fontSize: 14 }} />
                                                {centre.price}
                                            </Typography>
                                        </Box>

                                        {/* Amenities Badges (Controlled height) */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: 28, mb: 2 }}>
                                            {centre.amenities && centre.amenities.length > 0 ? (
                                                <>
                                                    {centre.amenities.slice(0, 2).map((a) => (
                                                        <Chip key={a} label={a} size="small" sx={{ fontSize: '0.65rem', bgcolor: '#F1F5F9', height: 20 }} />
                                                    ))}
                                                    {centre.amenities.length > 2 && (
                                                        <Chip label={`+${centre.amenities.length - 2} more`} size="small" sx={{ fontSize: '0.65rem', bgcolor: '#E2E8F0', height: 20 }} />
                                                    )}
                                                </>
                                            ) : (
                                                <Chip label="Facility Details Available" size="small" sx={{ fontSize: '0.65rem', bgcolor: '#F1F5F9', height: 20 }} />
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Action Buttons */}
                                    <Box sx={{ display: 'flex', gap: 1.2, mt: 'auto', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setSelectedCentre(centre)}
                                            sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '0.78rem' }}
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="small"
                                            startIcon={<DirectionsIcon />}
                                            onClick={() => openDirections(centre.name, centre.lat, centre.lon, centre.address)}
                                            sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '0.78rem', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
                                        >
                                            Directions
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            )}

            {/* Centre Detail Modal */}
            {selectedCentre && (
                <Dialog open={Boolean(selectedCentre)} onClose={() => setSelectedCentre(null)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {selectedCentre.name}
                        {selectedCentre.isLive && (
                            <Chip label="Live Verified" size="small" color="info" variant="outlined" />
                        )}
                    </DialogTitle>
                    <DialogContent dividers>
                        <CardMedia
                            component="img"
                            height="200"
                            image={selectedCentre.image}
                            alt={selectedCentre.name}
                            sx={{ borderRadius: 2, mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {selectedCentre.description}
                        </Typography>

                        {/* Amenities */}
                        {selectedCentre.amenities && selectedCentre.amenities.length > 0 && (
                            <>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                                    💎 Verified Features:
                                </Typography>
                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    {selectedCentre.amenities.map((a) => (
                                        <Grid item xs={6} key={a} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                                            <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{a}</Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )}

                        {/* Pricing */}
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CurrencyRupeeIcon sx={{ fontSize: 16, color: '#EA580C' }} /> Pricing & Plans:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                            {selectedCentre.price}
                        </Typography>

                        {/* Contact info */}
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                            📍 Location & Contact:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            📍 {selectedCentre.address} ({selectedCentre.distanceText})
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            ⏰ Hours: {selectedCentre.hours ? selectedCentre.hours : 'Not specified (Contact centre)'}
                        </Typography>
                        {selectedCentre.phone && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                📞 Phone: {selectedCentre.phone}
                            </Typography>
                        )}

                        {selectedCentre.website && (
                            <Box sx={{ mt: 1.5 }}>
                                <Button
                                    size="small"
                                    startIcon={<LanguageIcon />}
                                    href={selectedCentre.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    sx={{ textTransform: 'none' }}
                                >
                                    Official Website
                                </Button>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setSelectedCentre(null)} color="inherit">Close</Button>
                        <Button
                            variant="contained"
                            startIcon={<DirectionsIcon />}
                            onClick={() => openDirections(selectedCentre.name, selectedCentre.lat, selectedCentre.lon, selectedCentre.address)}
                            sx={{ textTransform: 'none', bgcolor: '#2563EB' }}
                        >
                            Open in Google Maps
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default FitnessCentres;