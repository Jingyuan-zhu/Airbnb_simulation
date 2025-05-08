import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Divider,
  Rating,
  Chip,
  Stack,
  Button,
  IconButton
} from '@mui/material';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';

const ListingDetailsPane = ({ listing, onClose }) => {
  if (!listing) {
    return (
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', 
        p: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper'
      }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Select a listing on the map to view details
        </Typography>
      </Card>
    );
  }

  // Format rating to show only one decimal place
  const formattedRating = listing.scores_rating ? 
    (Math.round(listing.scores_rating * 10) / 10).toFixed(1) : 
    'No ratings';

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 2,
        overflow: 'auto'
      }}
    >
      <IconButton 
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(255, 255, 255, 0.7)' }} 
        size="small"
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>

      {listing.picture_url ? (
        <CardMedia
          component="img"
          height="200"
          image={listing.picture_url}
          alt={listing.name}
        />
      ) : (
        <Box 
          sx={{ 
            height: 200, 
            bgcolor: 'grey.200', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <HomeIcon sx={{ fontSize: 60, color: 'grey.400' }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {listing.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Rating 
              value={listing.scores_rating ? listing.scores_rating / 5 : 0} 
              precision={0.1} 
              readOnly 
              size="small"
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {formattedRating}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOnIcon fontSize="small" color="primary" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {listing.neighbourhood_cleansed}
          </Typography>
        </Box>

        <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
          £{listing.price} per night
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip 
            icon={<PersonIcon />} 
            label={`${listing.accommodates} guests`} 
            variant="outlined" 
            size="small"
          />
          <Chip 
            icon={<BedIcon />} 
            label={`${listing.bedrooms} bedroom${listing.bedrooms !== 1 ? 's' : ''}`} 
            variant="outlined" 
            size="small"
          />
          <Chip 
            icon={<BathtubIcon />} 
            label={`${listing.bathrooms} bathroom${listing.bathrooms !== 1 ? 's' : ''}`} 
            variant="outlined" 
            size="small"
          />
        </Stack>

        <Chip 
          label={listing.room_type_simple} 
          color="primary" 
          size="small" 
          sx={{ mb: 2 }}
        />

        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          component={Link} 
          to={`/listing/${listing.id}`}
          sx={{ mt: 2 }}
        >
          View Full Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ListingDetailsPane;