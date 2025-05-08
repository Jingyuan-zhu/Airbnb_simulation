import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const config = require('../../config.json');

const NeighbourhoodVisualization = ({ selectedNeighbourhood }) => {
  const [hostTypeData, setHostTypeData] = useState([]);
  const [neighbourhoodOverview, setNeighbourhoodOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch data when the selected neighbourhood changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Function to fetch all required data
    const fetchNeighbourhoodData = async () => {
      try {
        // Fetch host types data
        const hostTypesResponse = await fetch(`http://${config.server_host}:${config.server_port}/hosts/types`);
        if (!hostTypesResponse.ok) {
          throw new Error('Failed to fetch host types data');
        }
        const hostTypesData = await hostTypesResponse.json();
        
        // Filter data for the selected neighbourhood if specified
        const filteredHostTypesData = selectedNeighbourhood !== 'All' 
          ? hostTypesData.filter(item => item.neighbourhood_cleansed === selectedNeighbourhood)
          : hostTypesData;
          
        setHostTypeData(filteredHostTypesData);
        
        // Fetch neighbourhood overview data
        const overviewResponse = await fetch(`http://${config.server_host}:${config.server_port}/analytics/overview`);
        if (!overviewResponse.ok) {
          throw new Error('Failed to fetch neighbourhood overview data');
        }
        const overviewData = await overviewResponse.json();
        
        // Get overview data for the selected neighbourhood
        const selectedOverview = selectedNeighbourhood !== 'All'
          ? overviewData.find(n => n.neighbourhood_cleansed === selectedNeighbourhood)
          : null;
          
        setNeighbourhoodOverview(selectedOverview);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching neighbourhood data:', err);
        setError('Failed to load neighbourhood data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchNeighbourhoodData();
  }, [selectedNeighbourhood]);
  
  // Group host type data by neighbourhood
  const groupedData = hostTypeData.reduce((acc, item) => {
    if (!acc[item.neighbourhood_cleansed]) {
      acc[item.neighbourhood_cleansed] = [];
    }
    acc[item.neighbourhood_cleansed].push(item);
    return acc;
  }, {});
  
  // Calculate difference between superhosts and non-superhosts for each metric
  const calculateDifferences = (neighbourhood) => {
    const data = groupedData[neighbourhood];
    if (!data || data.length !== 2) return null;
    
    const superhost = data.find(d => d.host_type === 'Superhost');
    const nonSuperhost = data.find(d => d.host_type === 'Non-Superhost');
    
    if (!superhost || !nonSuperhost) return null;
    
    return {
      ratingDiff: (superhost.avg_rating - nonSuperhost.avg_rating).toFixed(2),
      reviewsDiff: (superhost.avg_reviews_per_month - nonSuperhost.avg_reviews_per_month).toFixed(2),
      priceDiff: (superhost.avg_price - nonSuperhost.avg_price).toFixed(2),
      listingsDiff: superhost.num_listings - nonSuperhost.num_listings,
      superhostData: superhost,
      nonSuperhostData: nonSuperhost
    };
  };
  
  // Render loading state
  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading neighbourhood data...</Typography>
      </Paper>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }
  
  // If all neighbourhoods are selected but no specific one is chosen for visualization
  if (selectedNeighbourhood === 'All') {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>Neighbourhood Host Analysis</Typography>
        <Typography variant="body1">
          Please select a specific neighbourhood to view host type analysis.
        </Typography>
      </Paper>
    );
  }
  
  // Get differences for the selected neighbourhood
  const differences = calculateDifferences(selectedNeighbourhood);
  
  // If no data is available for the selected neighbourhood
  if (!differences) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          No Data Available
        </Typography>
        <Typography variant="body1">
          There is no host type comparison data available for {selectedNeighbourhood}.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, height: '100%', width: '100%'}}>
      <Typography variant="h6" gutterBottom>
        {selectedNeighbourhood} Host Analysis
      </Typography>
      
      {neighbourhoodOverview && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Neighbourhood Overview
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<HomeIcon />} 
              label={`${neighbourhoodOverview.number_of_listings} listings`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<AttachMoneyIcon />} 
              label={`Avg. £${Math.round(neighbourhoodOverview.average_price)} per night`} 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Superhost vs. Non-Superhost Comparison
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SupervisorAccountIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Superhosts</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {differences.superhostData.num_listings} listings in this neighbourhood
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon fontSize="small" sx={{ mr: 1 }} />
                    Average Rating: {differences.superhostData.avg_rating}
                  </Box>
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <RateReviewIcon fontSize="small" sx={{ mr: 1 }} />
                    Reviews Per Month: {differences.superhostData.avg_reviews_per_month}
                  </Box>
                </Typography>
                
                <Typography variant="body2">
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                    Average Price: £{Math.round(differences.superhostData.avg_price)}
                  </Box>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Non-Superhosts</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {differences.nonSuperhostData.num_listings} listings in this neighbourhood
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon fontSize="small" sx={{ mr: 1 }} />
                    Average Rating: {differences.nonSuperhostData.avg_rating}
                  </Box>
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <RateReviewIcon fontSize="small" sx={{ mr: 1 }} />
                    Reviews Per Month: {differences.nonSuperhostData.avg_reviews_per_month}
                  </Box>
                </Typography>
                
                <Typography variant="body2">
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                    Average Price: £{Math.round(differences.nonSuperhostData.avg_price)}
                  </Box>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* <Grid item size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Performance Comparison
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Rating Difference</Typography>
                  <Typography variant="body2">
                    {differences.ratingDiff > 0 ? '+' : ''}{differences.ratingDiff}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={50 + (differences.ratingDiff / 0.1) * 5} 
                  color={differences.ratingDiff > 0 ? "success" : "error"} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Reviews Per Month</Typography>
                  <Typography variant="body2">
                    {differences.reviewsDiff > 0 ? '+' : ''}{differences.reviewsDiff}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={50 + (differences.reviewsDiff / 1) * 5} 
                  color={differences.reviewsDiff > 0 ? "success" : "error"} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Price Difference</Typography>
                  <Typography variant="body2">
                    {differences.priceDiff > 0 ? '+' : ''}£{differences.priceDiff}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={50 + (differences.priceDiff / 20) * 5} 
                  color={differences.priceDiff > 0 ? "info" : "warning"} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Paper>
  );
};

export default NeighbourhoodVisualization;