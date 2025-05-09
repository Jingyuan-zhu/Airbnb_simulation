import React, { useState, useEffect, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const config = require('../../config.json');

const NeighbourhoodVisualization = ({ selectedNeighbourhood, selectedBedrooms }) => {
  const [hostTypeData, setHostTypeData] = useState([]);
  const [neighbourhoodOverview, setNeighbourhoodOverview] = useState(null);
  const [interactionData, setInteractionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Aggregation function for interaction data
  const aggregate = (data) => {
    if (data.length === 0) return [];

    let totalRatingGood = 0,
      totalPriceGood = 0,
      totalCountGood = 0;
    let totalRatingOther = 0,
      totalPriceOther = 0,
      totalCountOther = 0;

    for (let d of data) {
      const ratingGood = parseFloat(d.avg_rating_good_interaction_hosts);
      const priceGood = parseFloat(d.avg_price_good_interaction_hosts);
      const countGood = parseInt(d.count_listings_good_interaction_hosts);
      const ratingOther = parseFloat(d.avg_rating_other_hosts);
      const priceOther = parseFloat(d.avg_price_other_hosts);
      const countOther = parseInt(d.count_listings_other_hosts);

      if (!isNaN(ratingGood) && !isNaN(countGood)) {
        totalRatingGood += ratingGood * countGood;
        totalCountGood += countGood;
      }
      if (!isNaN(priceGood) && !isNaN(countGood)) {
        totalPriceGood += priceGood * countGood;
      }
      if (!isNaN(ratingOther) && !isNaN(countOther)) {
        totalRatingOther += ratingOther * countOther;
        totalCountOther += countOther;
      }
      if (!isNaN(priceOther) && !isNaN(countOther)) {
        totalPriceOther += priceOther * countOther;
      }
    }

    return [{
      neighbourhood_cleansed: 'All Neighborhoods',
      bedrooms: selectedBedrooms,
      avg_rating_good_interaction_hosts: totalCountGood > 0 ? (totalRatingGood / totalCountGood).toFixed(2) : 'N/A',
      avg_price_good_interaction_hosts: totalCountGood > 0 ? (totalPriceGood / totalCountGood).toFixed(2) : 'N/A',
      count_listings_good_interaction_hosts: totalCountGood,
      avg_rating_other_hosts: totalCountOther > 0 ? (totalRatingOther / totalCountOther).toFixed(2) : 'N/A',
      avg_price_other_hosts: totalCountOther > 0 ? (totalPriceOther / totalCountOther).toFixed(2) : 'N/A',
      count_listings_other_hosts: totalCountOther,
    }];
  };

  // Fetch all required data
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const [hostTypesResponse, overviewResponse, interactionResponse] = await Promise.all([
          fetch(`http://${config.server_host}:${config.server_port}/hosts/types`),
          fetch(`http://${config.server_host}:${config.server_port}/analytics/overview`),
          fetch(`http://${config.server_host}:${config.server_port}/hosts/interactions`),
        ]);

        if (!hostTypesResponse.ok || !overviewResponse.ok || !interactionResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const hostTypesData = await hostTypesResponse.json();
        const overviewData = await overviewResponse.json();
        const interactionData = await interactionResponse.json();

        // Filter hostTypesData for the selected neighbourhood
        const filteredHostTypesData = selectedNeighbourhood !== 'All'
          ? hostTypesData.filter(item => item.neighbourhood_cleansed === selectedNeighbourhood)
          : hostTypesData;
        setHostTypeData(filteredHostTypesData);

        // Get overview data for the selected neighbourhood
        const selectedOverview = selectedNeighbourhood !== 'All'
          ? overviewData.find(n => n.neighbourhood_cleansed === selectedNeighbourhood)
          : null;
        setNeighbourhoodOverview(selectedOverview);

        setInteractionData(interactionData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedNeighbourhood]);

  // Compute display interaction data with fallback
  const { displayInteractionData, isFallback } = useMemo(() => {
    if (!interactionData) return { displayInteractionData: [], isFallback: false };

    let filtered = interactionData.filter((d) => {
      if (selectedNeighbourhood !== 'All' && d.neighbourhood_cleansed !== selectedNeighbourhood) return false;
      if (selectedBedrooms !== 'All' && d.bedrooms != parseInt(selectedBedrooms)) return false;
      return true;
    });

    // Fallback to all bedrooms if no data for specific bedroom count
    let isFallback = false;
    if (filtered.length === 0 && selectedNeighbourhood !== 'All' && selectedBedrooms !== 'All') {
      filtered = interactionData.filter((d) => d.neighbourhood_cleansed === selectedNeighbourhood);
      isFallback = filtered.length > 0;
    }

    if (selectedNeighbourhood === 'All') {
      return { displayInteractionData: aggregate(filtered), isFallback: false };
    } else {
      return { displayInteractionData: filtered, isFallback };
    }
  }, [interactionData, selectedNeighbourhood, selectedBedrooms]);

  // Calculate differences for Superhost vs Non-Superhost
  const calculateDifferences = () => {
    if (selectedNeighbourhood === 'All' || hostTypeData.length !== 2) return null;
    const superhost = hostTypeData.find(d => d.host_type === 'Superhost');
    const nonSuperhost = hostTypeData.find(d => d.host_type === 'Non-Superhost');
    if (!superhost || !nonSuperhost) return null;

    return {
      ratingDiff: (superhost.avg_rating - nonSuperhost.avg_rating).toFixed(2),
      reviewsDiff: (superhost.avg_reviews_per_month - nonSuperhost.avg_reviews_per_month).toFixed(2),
      priceDiff: (superhost.avg_price - nonSuperhost.avg_price).toFixed(2),
      listingsDiff: superhost.num_listings - nonSuperhost.num_listings,
      superhostData: superhost,
      nonSuperhostData: nonSuperhost,
    };
  };

  const differences = calculateDifferences();

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading neighbourhood data...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%', width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {selectedNeighbourhood === 'All' ? 'Neighbourhood Host Analysis' : `${selectedNeighbourhood} Host Performance Analysis`}
      </Typography>

      {selectedNeighbourhood === 'All' ? (
        <Box>
          <Typography variant="body1">
            Please select a specific neighbourhood to view detailed host performance analysis.
          </Typography>
          {/* Host Interaction Analysis for All Neighbourhoods */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Host Interaction Analysis
            </Typography>
            {displayInteractionData.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Neighborhood</TableCell>
                      <TableCell>Bedrooms</TableCell>
                      <TableCell>Avg Rating Good Hosts</TableCell>
                      <TableCell>Avg Price Good Hosts</TableCell>
                      <TableCell>Count Listings Good Hosts</TableCell>
                      <TableCell>Avg Rating Other Hosts</TableCell>
                      <TableCell>Avg Price Other Hosts</TableCell>
                      <TableCell>Count Listings Other Hosts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayInteractionData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.neighbourhood_cleansed}</TableCell>
                        <TableCell>{row.bedrooms}</TableCell>
                        <TableCell>
                          {row.avg_rating_good_interaction_hosts && !isNaN(parseFloat(row.avg_rating_good_interaction_hosts))
                            ? parseFloat(row.avg_rating_good_interaction_hosts).toFixed(2)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {row.avg_price_good_interaction_hosts && !isNaN(parseFloat(row.avg_price_good_interaction_hosts))
                            ? `£${parseFloat(row.avg_price_good_interaction_hosts).toFixed(2)}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{row.count_listings_good_interaction_hosts || 'N/A'}</TableCell>
                        <TableCell>
                          {row.avg_rating_other_hosts && !isNaN(parseFloat(row.avg_rating_other_hosts))
                            ? parseFloat(row.avg_rating_other_hosts).toFixed(2)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {row.avg_price_other_hosts && !isNaN(parseFloat(row.avg_price_other_hosts))
                            ? `£${parseFloat(row.avg_price_other_hosts).toFixed(2)}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{row.count_listings_other_hosts || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>
                No interaction data available for the selected combination. Try selecting a different bedroom count or neighborhood.
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <>
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

          {/* Host Performance Analysis */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Superhost vs. Non-Superhost Comparison
            </Typography>
            {differences ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
              </Grid>
            ) : (
              <Typography variant="body1">
                No host type comparison data available for {selectedNeighbourhood}.
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Host Interaction Analysis
            </Typography>
            
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SupervisorAccountIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Good Hosts</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {displayInteractionData[0].count_listings_good_interaction_hosts} listings in this neighbourhood
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon fontSize="small" sx={{ mr: 1 }} />
                            Average Rating: {displayInteractionData[0].avg_rating_good_interaction_hosts}
                          </Box>
                        </Typography>
                        <Typography variant="body2">
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                            Average Price: £{displayInteractionData[0].avg_price_good_interaction_hosts}
                          </Box>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Other Hosts</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {displayInteractionData[0].count_listings_other_hosts} listings in this neighbourhood
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon fontSize="small" sx={{ mr: 1 }} />
                            Average Rating: {displayInteractionData[0].avg_rating_other_hosts}
                          </Box>
                        </Typography>
                        <Typography variant="body2">
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                            Average Price: £{displayInteractionData[0].avg_price_other_hosts}
                          </Box>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

          </Box>
        </>
      )}
    </Paper>
  );
};

export default NeighbourhoodVisualization;