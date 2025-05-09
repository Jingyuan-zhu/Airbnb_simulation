import { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Divider } from '@mui/material';
import { PieChart, BarChart, LineChart } from '@mui/x-charts';
const config = require('../config.json');

export default function HomePage() {
  const [stats, setStats] = useState({
    total_listings: 0,
    avg_price: 0,
    total_neighborhoods: 0
  });
  const [roomTypeData, setRoomTypeData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [error, setError] = useState(null);
  const [priceError, setPriceError] = useState(null);

  useEffect(() => {
    // Fetch statistics from the /home API
    fetch(`http://${config.server_host}:${config.server_port}/home`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => {
        console.error('Error fetching stats:', err);
        setError('Unable to load market stats');
      });

    // Fetch room type distribution from the /analytics/room_types API
    fetch(`http://${config.server_host}:${config.server_port}/analytics/room_types`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Room Type Data:', data);
        const formattedData = data.map((item, index) => ({
          id: index,
          value: parseFloat(item.percentage_of_total),
          label: item.room_type_simple.charAt(0).toUpperCase() + item.room_type_simple.slice(1),
          color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][index % 4]
        }));
        console.log('Formatted Room Type Data:', formattedData);
        setRoomTypeData(formattedData);
      })
      .catch(err => {
        console.error('Error fetching room type data:', err);
        setError('Unable to load room type data');
      });

    // Fetch room type sentiment from the /analytics/room_type_sentiment API
    fetch(`http://${config.server_host}:${config.server_port}/analytics/room_type_sentiment`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Sentiment Data:', data);
        const formattedData = data.map((item, index) => ({
          id: index,
          value: parseFloat(item.percent_positive_reviews),
          label: item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1),
          color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][index % 4]
        }));
        console.log('Formatted Sentiment Data:', formattedData);
        setSentimentData(formattedData);
      })
      .catch(err => {
        console.error('Error fetching sentiment data:', err);
        setError('Unable to load sentiment data');
      });

    // Fetch monthly price data from the /analytics/monthly_price API
    console.log('Fetching monthly price data...');
    fetch(`http://${config.server_host}:${config.server_port}/analytics/monthly_price`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Monthly Price Data:', data);
        const formattedData = data
          .map(item => ({
            month: item.review_month,
            price: parseFloat(item.average_price_of_reviewed_listings) || 0,
          }))
          .sort((a, b) => {
            const [yearA, monthA] = a.month.split('-').map(Number);
            const [yearB, monthB] = b.month.split('-').map(Number);
            return yearA !== yearB ? yearA - yearB : monthA - monthB;
          });
        console.log('Formatted Price Data:', formattedData);
        setPriceData(formattedData);
      })
      .catch(err => {
        console.error('Error fetching monthly price data:', err);
        setPriceError('Unable to load monthly price data');
      });
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Project Description
      </Typography>
      
      <Typography variant="body1" paragraph>
        The Airbnb market is extensive and complex, making it difficult for users to evaluate listing values, 
        understand pricing trends, and identify high-quality options efficiently. Our application addresses 
        these issues by providing an intuitive platform that offers actionable insights and visualizations.
      </Typography>
      
      <Typography variant="body1" paragraph>
        This application provides insights into London's Airbnb market, allowing users to browse listings,
        view neighborhoods on a map, and explore detailed information about each property.
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
              bgcolor: 'primary.main',
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
              bgcolor: 'success.main',
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
              bgcolor: 'error.light',
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
        Room Type Statistics
      </Typography>

      <Typography variant="body1" paragraph>
        Explore key statistics about Airbnb listings in London, including room type distributions and guest sentiment based on positive reviews.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Room Type Distribution (%)
            </Typography>
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : roomTypeData.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: roomTypeData,
                    innerRadius: 30,
                    outerRadius: 120,
                    paddingAngle: 0,
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
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                height={300}
              />
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Room Type Sentiment
            </Typography>
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : sentimentData.length > 0 ? (
              <BarChart
                series={[
                  {
                    data: sentimentData.map(item => item.value),
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'band',
                    data: sentimentData.map(item => item.label),
                    label: 'Room Type',
                    colorMap: {
                      type: 'ordinal',
                      values: roomTypeData.map(item => item.label),
                      colors: roomTypeData.map(item => item.color),
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: 'Positive Reviews (%)',
                    min: 0,
                    max: 100,
                  },
                ]}
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                height={300}
              />
            ) : (
              <Typography>Loading...</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        Monthly Price Trends
      </Typography>

      <Typography variant="body1" paragraph>
        Analyze the average price of reviewed Airbnb listings in London over time, based on review months.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Average Price by Review Month
            </Typography>
            {priceError ? (
              <Typography color="error">{priceError}</Typography>
            ) : priceData.length > 0 ? (
              <LineChart
                series={[
                  {
                    data: priceData.map(item => item.price),
                    label: 'Average Price',
                    color: '#4BC0C0',
                    showMark: false,
                  },
                ]}
                xAxis={[
                  {
                    scaleType: 'point',
                    data: priceData.map(item => item.month),
                    label: 'Review Year',
                    valueFormatter: (value) => value.split('-')[0],
                    tickInterval: (value) => {
                      const [year, month] = value.split('-');
                      return month === '01' || priceData.find(item => item.month === `${year}-01`) === undefined;
                    },
                  },
                ]}
                yAxis={[
                  {
                    label: 'Average Price (£)',
                    min: 0,
                    max: Math.max(...priceData.map(item => item.price)) * 1.1,
                  },
                ]}
                margin={{ top: 20, bottom: 60, left: 0, right: 20 }}
                height={400}
                width={800}
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