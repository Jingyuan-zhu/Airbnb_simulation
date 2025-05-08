import React, { useCallback, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { CircularProgress, Box } from '@mui/material';

// Define default map settings
const containerStyle = {
  width: '100%',
  height: '65vh'
};

// London center coordinates
const defaultCenter = {
  lat: 51.507602,
  lng: -0.127816
};

const defaultZoom = 11;

const GoogleMapComponent = ({ listings, onMarkerClick, selectedListing }) => {
  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  
  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  // Handlers for map load/unload
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handler for marker click
  const handleMarkerClick = useCallback((listing) => {
    setActiveMarker(listing.id);
    if (onMarkerClick) {
      onMarkerClick(listing);
    }
  }, [onMarkerClick]);

  // Handler for info window close
  const handleInfoWindowClose = useCallback(() => {
    setActiveMarker(null);
  }, []);

  // Memorize markers to prevent unnecessary re-renders
  const markers = useMemo(() => {
    return listings.map(listing => (
      <MarkerF
        key={listing.id}
        position={{ lat: listing.latitude, lng: listing.longitude }}
        onClick={() => handleMarkerClick(listing)}
        icon={{
          path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
          fillColor: listing.id === selectedListing?.id ? '#ff385c' : '#4285F4',
          fillOpacity: 1,
          strokeColor: '#000',
          strokeWeight: 1,
          scale: 1,
          labelOrigin: { x: 0, y: -30 }
        }}
        animation={listing.id === selectedListing?.id ? 1 : null} // Google Maps BOUNCE animation
      >
        {activeMarker === listing.id && (
          <InfoWindowF
            position={{ lat: listing.latitude, lng: listing.longitude }}
            onCloseClick={handleInfoWindowClose}
          >
            <div style={{ padding: '5px', maxWidth: '200px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{listing.name}</h3>
              <p style={{ margin: '0', fontSize: '12px' }}>
                £{listing.price} per night · {listing.room_type_simple}
              </p>
            </div>
          </InfoWindowF>
        )}
      </MarkerF>
    ));
  }, [listings, activeMarker, handleMarkerClick, handleInfoWindowClose, selectedListing]);

  // Show loading indicator while Google Maps loads
  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '65vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedListing ? { lat: selectedListing.latitude, lng: selectedListing.longitude } : defaultCenter}
      zoom={selectedListing ? 14 : defaultZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }}
    >
      {markers}
    </GoogleMap>
  );
};

export default React.memo(GoogleMapComponent);