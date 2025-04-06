import { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Divider } from '@mui/material';
const config = require('../config.json');

export default function HomePage() {
  const [stats, setStats] = useState({
    total_listings: 0,
    avg_price: 0,
    total_neighborhoods: 0
  });

  useEffect(() => {
    // Fetch statistics from the API
    fetch(`http://${config.server_host}:${config.server_port}/home`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Airbnb London Explorer
      </Typography>
      
      <Typography variant="body1" paragraph>
        This application provides insights into London's Airbnb market, allowing users to explore listings, 
        analyze prices, and discover popular neighborhoods.
      </Typography>
      
      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Market Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Listings
            </Typography>
            <Typography variant="h3">
              {stats.total_listings?.toLocaleString() || 'Loading...'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
              bgcolor: 'secondary.light',
              color: 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Average Price
            </Typography>
            <Typography variant="h3">
              £{stats.avg_price ? Math.round(stats.avg_price).toLocaleString() : 'Loading...'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
              bgcolor: 'info.light',
              color: 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Neighborhoods
            </Typography>
            <Typography variant="h3">
              {stats.total_neighborhoods?.toLocaleString() || 'Loading...'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Project Description
      </Typography>
      
      <Typography variant="body1" paragraph>
        The Airbnb market is extensive and complex, making it difficult for users to evaluate listing values, 
        understand pricing trends, and identify high-quality options efficiently. Our application addresses 
        these issues by providing an intuitive platform that offers actionable insights and visualizations.
      </Typography>
      
      <Typography variant="body1" paragraph>
        This application allows you to browse listings, view neighborhoods on a map, and explore detailed 
        information about each property.
      </Typography>
    </Container>
  );
}