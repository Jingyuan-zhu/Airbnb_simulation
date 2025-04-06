import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid, Paper, Divider, Box, Chip } from '@mui/material';
import LazyTable from '../components/LazyTable';

const config = require('../config.json');

export default function ListingDetailPage() {
  const { listing_id } = useParams();
  const [listing, setListing] = useState(null);
  
  useEffect(() => {
    // Fetch the listing details
    fetch(`http://${config.server_host}:${config.server_port}/listing/${listing_id}`)
      .then(res => res.json())
      .then(data => setListing(data));
  }, [listing_id]);

  // Define the columns for the reviews table
  const reviewColumns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 150
    },
    {
      field: 'comments',
      headerName: 'Review',
      width: 650
    }
  ];
  
  // If listing is still loading, display a loading message
  if (!listing) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5">Loading listing details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {listing.name}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Listing Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About this listing
            </Typography>
            <Typography variant="body1" paragraph>
              {listing.description || 'No description available.'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Neighborhood
                </Typography>
                <Typography variant="body1">
                  {listing.neighbourhood_cleansed}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Room Type
                </Typography>
                <Typography variant="body1">
                  {listing.room_type}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Accommodates
                </Typography>
                <Typography variant="body1">
                  {listing.accommodates} guests
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Bathrooms
                </Typography>
                <Typography variant="body1">
                  {listing.bathrooms_text || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Bedrooms
                </Typography>
                <Typography variant="body1">
                  {listing.bedrooms || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Beds
                </Typography>
                <Typography variant="body1">
                  {listing.beds || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Reviews Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reviews ({listing.number_of_reviews})
            </Typography>
            {listing.number_of_reviews > 0 ? (
              <LazyTable 
                route={`http://${config.server_host}:${config.server_port}/reviews/${listing_id}`} 
                columns={reviewColumns}
                defaultPageSize={5}
                rowsPerPageOptions={[5, 10, 25]}
              />
            ) : (
              <Typography variant="body1">
                No reviews available for this listing.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Price and Availability */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              £{listing.price}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              per night
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Availability
              </Typography>
              <Typography variant="body1">
                {listing.availability_365 === 0 ? 'Not available' : 
                 `Available for ${listing.availability_365} days in the year`}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Minimum Stay
              </Typography>
              <Typography variant="body1">
                {listing.minimum_nights} night(s)
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Maximum Stay
              </Typography>
              <Typography variant="body1">
                {listing.maximum_nights} night(s)
              </Typography>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Host Information
            </Typography>
            <Typography variant="h6" gutterBottom>
              {listing.host_name || 'Unknown Host'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Host since: {listing.host_since || 'Unknown'}
            </Typography>
            <Typography variant="body1" paragraph>
              Response rate: {listing.host_response_rate || 'Unknown'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 