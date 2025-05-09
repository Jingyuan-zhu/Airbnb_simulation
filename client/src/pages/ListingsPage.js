import { useEffect, useState } from 'react';
import { Container, Typography, Divider } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

export default function ListingsPage() {
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
    // {
    //   field: 'number_of_reviews',
    //   headerName: 'Number of Reviews',
    //   width: 150
    // },
    // {
    //   field: 'review_scores_rating',
    //   headerName: 'Review Score',
    //   renderCell: (row) => `${row.review_scores_rating} / 10`,
    //   width: 150
    // }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        London Airbnb Listings
      </Typography>
      <Typography variant="body1" paragraph>
        Browse available Airbnb listings in London. Click on a listing name to view more details.
      </Typography>
      <Divider sx={{ my: 3 }} />
      <LazyTable 
        route={`http://${config.server_host}:${config.server_port}/listings`} 
        columns={listingColumns}
        defaultPageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Container>
  );
} 