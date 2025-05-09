import { useState, useEffect } from 'react';
import { Container, Typography, Divider, Tabs, Tab, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

export default function ListingsPage() {
  const [tabValue, setTabValue] = useState(0); // 0 for All Listings, 1 for Hidden Gems

  // Define the columns for the listings table
  const listingColumns = [
    {
      field: 'name',
      headerName: 'Listing Name',
      renderCell: (row) => <NavLink to={`/listings/${row.id}`}>{row.name}</NavLink>,
      width: 400
    },
    {
      field: 'neighbourhood_cleansed',
      headerName: 'Neighborhood',
      width: 200
    },
    {
      field: 'room_type_simple',
      headerName: 'Room Type',
      width: 150
    },
    {
      field: 'price',
      headerName: 'Price',
      renderCell: (row) => `£${row.price}`,
      width: 100
    },
    {
      field: 'accommodates',
      headerName: 'Accommodates',
      width: 100
    },
    {
      field: 'bathrooms',
      headerName: 'Bathrooms',
      width: 100
    },
    {
      field: 'bedrooms',
      headerName: 'Bedrooms',
      width: 100
    },
    {
      field: 'beds',
      headerName: 'Beds',
      width: 100
    },
  ];

  // Define the columns for the hidden gems table
  const hiddenGemsColumns = [
    {
      field: 'listing_name',
      headerName: 'Listing Name',
      renderCell: (row) => <NavLink to={`/listings/${row.listing_id}`}>{row.listing_name}</NavLink>,
      width: 400
    },
    {
      field: 'neighbourhood_cleansed',
      headerName: 'Neighborhood',
      width: 200
    },
    {
      field: 'room_type_simple',
      headerName: 'Room Type',
      width: 150
    },
    {
      field: 'scores_rating',
      headerName: 'Rating',
      renderCell: (row) => row.scores_rating != null && !isNaN(row.scores_rating) ? `${parseFloat(row.scores_rating).toFixed(1)} / 5` : 'N/A',
      width: 100
    },
    {
      field: 'scores_value',
      headerName: 'Value Score',
      renderCell: (row) => row.scores_value != null && !isNaN(row.scores_value) ? `${parseFloat(row.scores_value).toFixed(1)} / 5` : 'N/A',
      width: 100
    },
    {
      field: 'number_of_reviews',
      headerName: 'Reviews',
      width: 100
    },
    {
      field: 'price',
      headerName: 'Price',
      renderCell: (row) => row.price != null && !isNaN(row.price) ? `£${parseFloat(row.price).toFixed(2)}` : 'N/A',
      width: 100
    },
    {
      field: 'avg_neighbourhood_reviews',
      headerName: 'Avg. Neighborhood Reviews',
      renderCell: (row) => row.avg_neighbourhood_reviews != null && !isNaN(row.avg_neighbourhood_reviews) ? `${parseFloat(row.avg_neighbourhood_reviews).toFixed(2)}` : 'N/A',
      width: 150
    },
    {
      field: 'avg_neighbourhood_price_for_room_type',
      headerName: 'Avg. Neighborhood Price',
      renderCell: (row) => row.avg_neighbourhood_price_for_room_type != null && !isNaN(row.avg_neighbourhood_price_for_room_type) ? `£${parseFloat(row.avg_neighbourhood_price_for_room_type).toFixed(2)}` : 'N/A',
      width: 150
    },
  ];

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        London Airbnb Listings
      </Typography>
      <Typography variant="body1" paragraph>
        Browse available Airbnb listings in London. Click on a listing name to view more details.
      </Typography>
      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="All Listings" />
          <Tab label="Hidden Gems" />
        </Tabs>
      </Box>
      <Divider sx={{ my: 3 }} />
      {tabValue === 0 ? (
        <LazyTable 
          route={`http://${config.server_host}:${config.server_port}/listings`} 
          columns={listingColumns}
          defaultPageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
        />
      ) : (
        <LazyTable 
          route={`http://${config.server_host}:${config.server_port}/analytics/hidden_gems?min_rating=4.8`} 
          columns={hiddenGemsColumns}
          defaultPageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
        />
      )}
    </Container>
  );
}