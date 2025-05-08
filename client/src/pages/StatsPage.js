import { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Divider } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
const config = require('../config.json');

export default function StatsPage() {
  const [hostData, setHostData] = useState([]);
  const [verifiedData, setVerifiedData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching host types data...');
    // Fetch host type data from the /hosts/types API
    fetch(`http://${config.server_host}:${config.server_port}/hosts/types`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Host Types Data:', data);
        // Aggregate num_listings by neighborhood to find top 5
        const neighborhoodTotals = {};
        data.forEach(item => {
          const neighborhood = item.neighbourhood_cleansed;
          neighborhoodTotals[neighborhood] = (neighborhoodTotals[neighborhood] || 0) + parseInt(item.num_listings);
        });
        const topNeighborhoods = Object.keys(neighborhoodTotals)
          .sort((a, b) => neighborhoodTotals[b] - neighborhoodTotals[a])
          .slice(0, 5);

        // Format data for top 5 neighborhoods
        const formattedData = topNeighborhoods.map(neighborhood => ({
          neighborhood,
          superhost: data.find(item => item.neighbourhood_cleansed === neighborhood && item.host_type === 'Superhost')?.avg_rating || 0,
          nonSuperhost: data.find(item => item.neighbourhood_cleansed === neighborhood && item.host_type === 'Non-Superhost')?.avg_rating || 0,
        }));

        console.log('Formatted Host Data:', formattedData);
        setHostData(formattedData);
      })
      .catch(err => {
        console.error('Error fetching host type data:', err.message);
        setError('Unable to load host type data');
      });

    console.log('Fetching verified hosts data...');
    // Fetch verified hosts data from the /hosts/verified API
    fetch(`http://${config.server_host}:${config.server_port}/hosts/verified`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Verified Hosts Data:', data);
        const formattedData = data.map((item, index) => ({
          id: index,
          value: parseFloat(item.percentage_of_total),
          label: item.identity_verified ? 'Verified' : 'Non-Verified',
          color: index === 0 ? '#FF6384' : '#36A2EB',
        }));
        console.log('Formatted Verified Data:', formattedData);
        setVerifiedData(formattedData);
      })
      .catch(err => {
        console.error('Error fetching verified hosts data:', err.message);
        setError('Unable to load verified hosts data');
      });
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Host Types Explorer
      </Typography>
      
      <Typography variant="body1" paragraph>
        Explore the performance of Airbnb hosts in London, comparing Superhosts and Non-Superhosts across neighborhoods based on ratings, reviews, and pricing.
      </Typography>
      
      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Host Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Host Type Ratings by Neighborhood
            </Typography>
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : hostData.length > 0 ? (
              <BarChart
                series={[
                  { 
                    data: hostData.map(item => parseFloat(item.superhost)), 
                    label: 'Superhost', 
                    color: '#FF6384' 
                  },
                  { 
                    data: hostData.map(item => parseFloat(item.nonSuperhost)), 
                    label: 'Non-Superhost', 
                    color: '#36A2EB' 
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: hostData.map(item => item.neighborhood),
                    label: 'Neighborhood',
                  },
                ]}
                yAxis={[
                  {
                    label: 'Average Rating',
                    min: 0,
                    max: 5,
                  },
                ]}
                margin={{ top: 20, bottom: 80, left: 60, right: 20 }}
                height={300}
                layout="grouped"
              />
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Host Verification Status
            </Typography>
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : verifiedData.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: verifiedData,
                    innerRadius: 30,
                    outerRadius: 120,
                    paddingAngle: 2,
                    cornerRadius: 5,
                    cx: 150,
                    cy: 150,
                  },
                ]}
                slotProps={{
                  legend: {
                    direction: 'row',
                    position: { vertical: 'bottom', horizontal: 'middle' },
                    padding: 0,
                  },
                }}
                margin={{ top: 0, bottom: 80, left: 0, right: 20 }}
                height={300}
              />
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}