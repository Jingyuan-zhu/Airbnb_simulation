import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  CircularProgress,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  Divider,
  Chip
} from '@mui/material';
import GoogleMapComponent from '../components/map/GoogleMapComponent';
import ListingDetailsPane from '../components/map/ListingDetailsPane';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

const config = require('../config.json');

export default function MapPage() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [activeFilters, setActiveFilters] = useState({});
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState('');

  // Fetch listings for the map
  useEffect(() => {
    setLoading(true);
    
    // Build the API URL with any active filters
    let apiUrl = `http://${config.server_host}:${config.server_port}/listings/map?limit=500`;
    
    // Add price filter if set
    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      apiUrl += `&price_low=${priceRange[0]}&price_high=${priceRange[1]}`;
    }
    
    // Add neighbourhood filter if selected
    if (selectedNeighbourhood) {
      apiUrl += `&neighbourhood_cleansed=${selectedNeighbourhood}`;
    }
    
    // Add other active filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== '') {
        apiUrl += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch listings');
        }
        return res.json();
      })
      .then(data => {
        setListings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
        setLoading(false);
      });
  }, [priceRange, selectedNeighbourhood, activeFilters]);

  // Fetch neighbourhoods for filtering
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/neighbourhoods`)
      .then(res => res.json())
      .then(data => setNeighbourhoods(data))
      .catch(err => console.error('Error fetching neighbourhoods:', err));
  }, []);

  // Handle marker click to show listing details
  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
  };

  // Close the details pane
  const handleCloseDetails = () => {
    setSelectedListing(null);
  };

  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Toggle filter visibility
  const toggleFilters = () => {
    setFilterVisible(!filterVisible);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        London Airbnb Listings Map
      </Typography>
      
      <Typography variant="body1" paragraph>
        Explore Airbnb listings across London. Click on a marker to view details about the listing.
      </Typography>
      
      {/* Error notification */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch 
              checked={filterVisible} 
              onChange={toggleFilters} 
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 0.5 }} />
              <Typography variant="body2">Filters</Typography>
            </Box>
          }
        />
        
        <TextField
          select
          label="Neighbourhood"
          value={selectedNeighbourhood}
          onChange={(e) => setSelectedNeighbourhood(e.target.value)}
          SelectProps={{
            native: true,
          }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <option value="">All Neighbourhoods</option>
          {neighbourhoods.map((n) => (
            <option key={n.neighbourhood} value={n.neighbourhood}>
              {n.neighbourhood}
            </option>
          ))}
        </TextField>
        
        <TextField
          label="Min Price"
          type="number"
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start">£</InputAdornment>,
          }}
          value={priceRange[0]}
          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
          sx={{ width: 120 }}
        />
        
        <TextField
          label="Max Price"
          type="number"
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start">£</InputAdornment>,
          }}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
          sx={{ width: 120 }}
        />
        
        <Chip 
          label={`${listings.length} listings`} 
          color="primary" 
          variant="outlined"
          sx={{ ml: 'auto' }}
        />
      </Paper>
      
      <Grid container spacing={3}>
        {/* Map area */}
        <Grid item xs={12} md={selectedListing ? 8 : 12}>
          <Paper 
            sx={{ 
              height: '70vh', 
              overflow: 'hidden', 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <GoogleMapComponent 
                listings={listings}
                onMarkerClick={handleMarkerClick}
                selectedListing={selectedListing}
              />
            )}
          </Paper>
        </Grid>
        
        {/* Listing details pane */}
        {selectedListing && (
          <Grid item xs={12} md={4}>
            <ListingDetailsPane 
              listing={selectedListing}
              onClose={handleCloseDetails}
            />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}