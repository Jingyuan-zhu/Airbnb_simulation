import { useState, useEffect } from 'react';
import { Container, Typography, Paper, Divider } from '@mui/material';

const config = require('../config.json');

export default function MapPage() {
  const [neighbourhoods, setNeighbourhoods] = useState([]);

  useEffect(() => {
    // Fetch neighbourhoods data
    fetch(`http://${config.server_host}:${config.server_port}/neighbourhoods`)
      .then(res => res.json())
      .then(data => setNeighbourhoods(data));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        London Neighborhoods Map
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page will display an interactive map of London with Airbnb listings. 
        For now, here's a list of London neighborhoods that have Airbnb listings.
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          London Neighborhoods ({neighbourhoods.length})
        </Typography>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '12px',
          marginTop: '16px'
        }}>
          {neighbourhoods.map((item, index) => (
            <Paper 
              key={index} 
              elevation={1} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                }
              }}
            >
              <Typography variant="body1">
                {item.neighbourhood}
              </Typography>
            </Paper>
          ))}
        </div>
      </Paper>
    </Container>
  );
} 