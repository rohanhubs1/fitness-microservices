import React, { useState } from 'react';
import {
    Box, Grid, Card, CardContent, CardMedia, Typography,
    TextField, InputAdornment, Chip, Stack, Button, Rating,
    Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, MenuItem, Select, FormControl, InputLabel
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
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LanguageIcon from '@mui/icons-material/Language';
import NearMeIcon from '@mui/icons-material/NearMe';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import VerifiedIcon from '@mui/icons-material/Verified';

// ---------------------------------------------------------------------------
// Sample content shown only before the user has ever searched. This is
// clearly labelled as demo data in the UI and is NEVER re-labelled as "live"
// or re-anchored to a real distance once a real search has been attempted.
// ---------------------------------------------------------------------------
const CURATED_SAMPLE_CENTRES = [
    {
        id: 'curated-1',
        name: 'PulseForge Elite Gym & Iron Box',
        category: 'GYM',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
        rating: null,
        reviewsCount: null,
        address: 'Sample listing — search above for real facilities near you',
        distanceKm: null,
        distanceText: 'Distance unknown',
        hours: null,
        phone: null,
        price: 'Contact centre for membership plans',
        amenities: ['Heavy Free Weights', 'Squat Racks & Platforms', 'Cardio Deck'],
        description: 'Example listing shown before you search. Not a verified real-world facility.',
        lat: null,
        lon: null,
        isLive: false
    },
    {
        id: 'curated-2',
        name: 'AquaZone Olympic Aquatic Centre',
        category: 'SWIMMING',
        image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=600&auto=format&fit=crop&q=80',
        rating: null,
        reviewsCount: null,
        address: 'Sample listing — search above for real facilities near you',
        distanceKm: null,
        distanceText: 'Distance unknown',
        hours: null,
        phone: null,
        price: 'Contact centre for membership plans',
        amenities: ['50m Olympic 10-Lane Pool', 'Heated Indoor Pool', 'Diving Boards'],
        description: 'Example listing shown before you search. Not a verified real-world facility.',
        lat: null,
        lon: null,
        isLive: false
    },
    {
        id: 'curated-3',
        name: 'Zenith Yoga & Mindfulness Sanctuary',
        category: 'YOGA',
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
        rating: null,
        reviewsCount: null,
        address: 'Sample listing — search above for real facilities near you',
        distanceKm: null,
        distanceText: 'Distance unknown',
        hours: null,
        phone: null,
        price: 'Contact centre for membership plans',
        amenities: ['Hot Yoga Studio', 'Vinyasa & Hatha', 'Meditation Hall'],
        description: 'Example listing shown before you search. Not a verified real-world facility.',
        lat: null,
        lon: null,
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
    const R = 6371;
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

function getImageForCategory(cat, seed) {
    const list = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.GYM;
    const index = Math.abs(seed) % list.length;
    return list[index];
}

// Turn a set of raw Overpass tags into a display record WITHOUT inventing
// any field that OSM doesn't actually provide. Missing data stays missing
// and is rendered as such in the UI, instead of being replaced with a
// plausible-looking placeholder.
function buildRecordFromTags(tags, elId, idx, placeLat, placeLon, originLat, originLon) {
    const category = detectCategory(tags);
    const distanceKm = calculateDistanceKm(originLat, originLon, placeLat, placeLon);

    const street = tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : '';
    const city = tags['addr:city'] || tags['addr:suburb'] || tags['addr:district'] || '';
    const formattedAddress = street
        ? `${street}${city ? ', ' + city : ''}`
        : (tags['addr:full'] || null);

    const amenities = [];
    if (tags.shower === 'yes') amenities.push('Showers Available');
    if (tags.sauna === 'yes') amenities.push('Sauna');
    if (tags.swimming_pool === 'yes') amenities.push('Swimming Pool');
    if (tags.air_conditioning === 'yes') amenities.push('Air Conditioned');
    if (tags.wheelchair === 'yes') amenities.push('Wheelchair Accessible');
    if (tags.surface) amenities.push(`Court Surface: ${tags.surface}`);

    // Only use a rating/review count if OSM actually carries one. Real-world
    // OSM data almost never has these tags — leave them null rather than
    // generating a fake number, and let the UI show "Not yet rated" instead.
    const rating = tags.rating ? parseFloat(tags.rating) : (tags.stars ? parseFloat(tags.stars) : null);
    const reviewsCount = tags.user_ratings_total ? parseInt(tags.user_ratings_total, 10) : null;

    let priceText = 'Contact centre for membership plans';
    if (tags.fee === 'no') priceText = 'Public / Free Entry';
    else if (tags.charge) priceText = tags.charge;

    return {
        id: `live-${elId ?? idx}`,
        name: tags.name || null, // no name in OSM -> render "Unnamed facility", don't invent one
        category,
        image: getImageForCategory(category, elId ?? idx),
        rating,
        reviewsCount,
        address: formattedAddress, // null if unknown — UI shows "Address not listed"
        distanceKm,
        distanceText: `${distanceKm} km away`,
        hours: tags.opening_hours || null, // null -> UI shows "Hours not listed"
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        price: priceText,
        amenities,
        description: `${category.charAt(0) + category.slice(1).toLowerCase()} facility sourced from OpenStreetMap, ${distanceKm} km from your search point.`,
        lat: placeLat,
        lon: placeLon,
        isLive: true
    };
}

const OVERPASS_ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
];

async function queryOverpass(lat, lon, radiusMeters) {
    // Overpass's own [timeout:25] tells the SERVER how long it may spend
    // building the answer. Our client-side AbortSignal must be longer than
    // that, or we cancel the request before Overpass could ever reply —
    // which is what was happening with the old 8s abort vs a 15s server
    // budget on busy/large-radius queries (e.g. 30km around Delhi).
    const SERVER_TIMEOUT_S = 25;
    const CLIENT_TIMEOUT_MS = (SERVER_TIMEOUT_S + 10) * 1000; // 35s

    const query = `
        [out:json][timeout:${SERVER_TIMEOUT_S}];
        (
          node["leisure"~"fitness_centre|sports_centre|swimming_pool"](around:${radiusMeters},${lat},${lon});
          node["sport"~"fitness|swimming|yoga|badminton|tennis|crossfit|gymnastics"](around:${radiusMeters},${lat},${lon});
          way["leisure"~"fitness_centre|sports_centre|swimming_pool"](around:${radiusMeters},${lat},${lon});
        );
        out center 35;
    `;

    let lastError = null;

    for (const base of OVERPASS_ENDPOINTS) {
        try {
            const res = await fetch(base, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `data=${encodeURIComponent(query)}`,
                signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS)
            });
            if (res.ok) {
                const data = await res.json();
                if (data?.elements?.length) return data.elements;
                return []; // valid response, genuinely no results — don't try to fake it
            }
            lastError = `HTTP ${res.status} from ${base}`;
            // eslint-disable-next-line no-console
            console.warn('[FitnessCentres] Overpass mirror returned non-OK status:', lastError);
        } catch (err) {
            lastError = err?.message || String(err);
            // eslint-disable-next-line no-console
            console.warn(`[FitnessCentres] Overpass mirror failed (${base}):`, lastError);
            // If this looks like a CORS/network block rather than a slow
            // server, every mirror will fail the same way — but we still
            // try each one since it could be a mirror-specific outage.
        }
    }

    // eslint-disable-next-line no-console
    console.error('[FitnessCentres] All Overpass mirrors failed. Last error:', lastError);
    return null; // null = every mirror failed (network/service issue), not "zero results"
}

const FitnessCentres = () => {
    const [centres, setCentres] = useState(CURATED_SAMPLE_CENTRES);
    const [hasSearched, setHasSearched] = useState(false);
    const [cityInput, setCityInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedCentre, setSelectedCentre] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [locationStatus, setLocationStatus] = useState(null);
    const [searchRadius, setSearchRadius] = useState(7000);

    // Single accurate path used by BOTH "near me" (GPS) and "search a city".
    // Both end up sourcing real tags from Overpass/OSM around a real
    // coordinate, so no field is ever fabricated differently depending on
    // which entry point the user used.
    const searchAroundCoords = async (lat, lon, radiusMeters) => {
        setLoadingLocation(true);
        setLocationStatus(
            radiusMeters >= 15000
                ? 'Querying live OpenStreetMap registry (larger radius can take up to 30s)...'
                : 'Querying live OpenStreetMap registry...'
        );
        setHasSearched(true);

        const elements = await queryOverpass(lat, lon, radiusMeters);

        if (elements === null) {
            setLocationStatus('⚠️ Could not reach the facility registry right now. Please try again shortly.');
            setCentres([]);
            setLoadingLocation(false);
            return;
        }

        const usable = elements.filter((el) => el.tags);
        const liveList = usable.map((el, idx) => {
            const placeLat = el.lat ?? el.center?.lat ?? lat;
            const placeLon = el.lon ?? el.center?.lon ?? lon;
            return buildRecordFromTags(el.tags, el.id, idx, placeLat, placeLon, lat, lon);
        });

        liveList.sort((a, b) => a.distanceKm - b.distanceKm);
        setCentres(liveList);

        if (liveList.length > 0) {
            setLocationStatus(`✅ Found ${liveList.length} facility record${liveList.length === 1 ? '' : 's'} within ${(radiusMeters / 1000)} km, sourced from OpenStreetMap.`);
        } else {
            setLocationStatus('No facilities found in OpenStreetMap for this radius — try a wider radius.');
        }

        setLoadingLocation(false);
    };

    const handleFindNearMe = () => {
        if (!navigator.geolocation) {
            setLocationStatus('⚠️ Geolocation is not supported by your browser.');
            return;
        }

        setLoadingLocation(true);
        setLocationStatus('Acquiring GPS location...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserCoords({ lat: latitude, lon: longitude });
                searchAroundCoords(latitude, longitude, searchRadius);
            },
            () => {
                setLoadingLocation(false);
                setLocationStatus('⚠️ GPS access denied or timed out.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    // Geocode the city name to ONE coordinate (a single Nominatim request,
    // respecting its usage policy), then reuse the exact same Overpass
    // pipeline as "near me" — so results carry real tags, not invented ones.
    const handleCitySearch = async (cityOverride) => {
        const queryCity = (typeof cityOverride === 'string' ? cityOverride : cityInput).trim();
        if (!queryCity) return;

        setSearchTerm('');
        setLoadingLocation(true);
        setHasSearched(true);
        setLocationStatus(`Locating "${queryCity}"...`);

        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryCity)}&limit=1`
            );
            if (!geoRes.ok) throw new Error('geocode failed');
            const geoData = await geoRes.json();

            if (!geoData || geoData.length === 0) {
                setLocationStatus(`Could not find a location matching "${queryCity}".`);
                setCentres([]);
                setLoadingLocation(false);
                return;
            }

            const lat = parseFloat(geoData[0].lat);
            const lon = parseFloat(geoData[0].lon);
            setUserCoords({ lat, lon });
            await searchAroundCoords(lat, lon, searchRadius);
        } catch {
            setLocationStatus('⚠️ Could not reach the location service right now. Please try again shortly.');
            setCentres([]);
            setLoadingLocation(false);
        }
    };

    const filteredCentres = centres.filter((c) => {
        const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
        const haystack = `${c.name || ''} ${c.address || ''} ${(c.amenities || []).join(' ')}`.toLowerCase();
        const matchesSearch = haystack.includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const openDirections = (name, lat, lon, address) => {
        const query = (lat != null && lon != null)
            ? `${lat},${lon}`
            : encodeURIComponent(`${name || ''}, ${address || ''}`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
    };

    return (
        <Box sx={{ mb: 4 }}>
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
                            startIcon={loadingLocation ? <CircularProgress size={18} sx={{ color: '#ffffff' }} /> : <MyLocationIcon />}
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
                                '&:hover': { bgcolor: '#4facfe' },
                                '&.Mui-disabled': { bgcolor: '#0284c7 !important', color: '#ffffff !important', opacity: 1 }
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

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={8} sm={8} md={5}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Discover in City / Area"
                        placeholder="Type city (e.g. Agra, Delhi, Mumbai, London, New York)..."
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCitySearch(cityInput); } }}
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
                <Grid item xs={4} sm={4} md={2}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="medium"
                        onClick={() => handleCitySearch(cityInput)}
                        disabled={loadingLocation || !cityInput.trim()}
                        startIcon={loadingLocation ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <SearchIcon />}
                        sx={{
                            height: 40,
                            bgcolor: '#003566',
                            color: '#00f2fe',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': { bgcolor: '#0d1b2a', color: '#fff' },
                            '&.Mui-disabled': { bgcolor: '#0284c7 !important', color: '#ffffff !important', opacity: 0.8 }
                        }}
                    >
                        {loadingLocation ? 'Searching...' : '🔍 Search'}
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
                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white', borderRadius: 2 }}>
                        <InputLabel>Search Radius</InputLabel>
                        <Select
                            value={searchRadius}
                            label="Search Radius"
                            onChange={(e) => {
                                setSearchRadius(e.target.value);
                                if (userCoords) searchAroundCoords(userCoords.lat, userCoords.lon, e.target.value);
                            }}
                        >
                            <MenuItem value={3000}>3 km (Walk)</MenuItem>
                            <MenuItem value={7000}>7 km (Area)</MenuItem>
                            <MenuItem value={15000}>15 km (City)</MenuItem>
                            <MenuItem value={30000}>30 km (Metro)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, overflowX: 'auto', py: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    Quick Cities:
                </Typography>
                {['Agra', 'Delhi', 'Mumbai', 'Bengaluru', 'London', 'New York', 'Tokyo'].map((quickCity) => (
                    <Chip
                        key={quickCity}
                        size="small"
                        label={quickCity}
                        onClick={() => { setCityInput(quickCity); handleCitySearch(quickCity); }}
                        sx={{ cursor: 'pointer', fontSize: '0.75rem', bgcolor: 'white', '&:hover': { bgcolor: '#e0f2fe' } }}
                    />
                ))}
            </Stack>

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

            {!hasSearched && (
                <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                    Showing example listings below. Use "Find Near My Live GPS" or search a city to see real, verified facilities.
                </Typography>
            )}

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
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }
                                }}
                            >
                                <Box sx={{ position: 'relative' }}>
                                    <CardMedia component="img" height="180" image={centre.image} alt={centre.name || 'Facility'} sx={{ objectFit: 'cover' }} />
                                    <Chip
                                        icon={centre.isLive ? <VerifiedIcon sx={{ '&&': { color: '#00f2fe', fontSize: 14 } }} /> : undefined}
                                        label={centre.isLive ? 'OSM Sourced' : 'Sample Data'}
                                        size="small"
                                        sx={{
                                            position: 'absolute', top: 10, right: 10,
                                            bgcolor: 'rgba(15,23,42,0.85)',
                                            color: centre.isLive ? '#00f2fe' : '#F97316',
                                            fontWeight: 'bold', fontSize: '0.68rem',
                                            backdropFilter: 'blur(4px)', height: 22
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            sx={{
                                                fontSize: '1rem', lineHeight: 1.3, color: '#0F172A', minHeight: 44,
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1
                                            }}
                                        >
                                            {centre.name || 'Unnamed facility'}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2, minHeight: 24 }}>
                                            {centre.rating ? (
                                                <>
                                                    <Rating value={centre.rating} precision={0.1} size="small" readOnly />
                                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#0F172A' }}>
                                                        {centre.rating}{centre.reviewsCount ? ` (${centre.reviewsCount})` : ''}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Chip label="Not yet rated" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 'bold', fontSize: '0.68rem', height: 20 }} />
                                            )}
                                            <Chip
                                                size="small"
                                                label={centre.distanceText}
                                                color="primary"
                                                variant="outlined"
                                                sx={{ ml: 'auto', fontSize: '0.68rem', height: 20, fontWeight: 600 }}
                                            />
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 38, fontSize: '0.8rem', lineHeight: 1.3, mb: 1 }}
                                        >
                                            📍 {centre.address || 'Address not listed'}
                                        </Typography>

                                        <Box sx={{ minHeight: 42, mb: 1.5 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
                                                <AccessTimeIcon sx={{ fontSize: 14, color: '#64748B' }} />
                                                {centre.hours || 'Hours not listed'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#EA580C', fontWeight: 600 }}>
                                                <CurrencyRupeeIcon sx={{ fontSize: 14 }} />
                                                {centre.price}
                                            </Typography>
                                        </Box>

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
                                                <Chip label="No amenity data listed" size="small" sx={{ fontSize: '0.65rem', bgcolor: '#F1F5F9', height: 20 }} />
                                            )}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1.2, mt: 'auto', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                                        <Button fullWidth variant="outlined" size="small" onClick={() => setSelectedCentre(centre)} sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '0.78rem' }}>
                                            Details
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="small"
                                            startIcon={<DirectionsIcon />}
                                            disabled={centre.lat == null || centre.lon == null}
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

            {selectedCentre && (
                <Dialog open={Boolean(selectedCentre)} onClose={() => setSelectedCentre(null)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {selectedCentre.name || 'Unnamed facility'}
                        <Chip label={selectedCentre.isLive ? 'OSM Sourced' : 'Sample Data'} size="small" color={selectedCentre.isLive ? 'info' : 'warning'} variant="outlined" />
                    </DialogTitle>
                    <DialogContent dividers>
                        <CardMedia component="img" height="200" image={selectedCentre.image} alt={selectedCentre.name || 'Facility'} sx={{ borderRadius: 2, mb: 2 }} />
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {selectedCentre.description}
                        </Typography>

                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                            💎 Listed Features:
                        </Typography>
                        {selectedCentre.amenities && selectedCentre.amenities.length > 0 ? (
                            <Grid container spacing={1} sx={{ mb: 2 }}>
                                {selectedCentre.amenities.map((a) => (
                                    <Grid item xs={6} key={a} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                                        <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>{a}</Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                No amenity data available for this listing.
                            </Typography>
                        )}

                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CurrencyRupeeIcon sx={{ fontSize: 16, color: '#EA580C' }} /> Pricing & Plans:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                            {selectedCentre.price}
                        </Typography>

                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                            📍 Location & Contact:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            📍 {selectedCentre.address || 'Address not listed'} ({selectedCentre.distanceText})
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            ⏰ Hours: {selectedCentre.hours || 'Not listed'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            📞 Phone: {selectedCentre.phone || 'Not listed'}
                        </Typography>

                        {selectedCentre.website && (
                            <Box sx={{ mt: 1.5 }}>
                                <Button size="small" startIcon={<LanguageIcon />} href={selectedCentre.website} target="_blank" rel="noreferrer" sx={{ textTransform: 'none' }}>
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
                            disabled={selectedCentre.lat == null || selectedCentre.lon == null}
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
