import React, { useCallback, useMemo, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import { CircularProgress, Box } from "@mui/material";

// Default map container style and initial view settings
const containerStyle = { width: "100%", height: "65vh" };
const defaultCenter = { lat: 51.507602, lng: -0.127816 };
const defaultZoom = 11;

const GoogleMapComponent = ({
  listings,
  onMarkerClick,
  selectedListing,
  onBoundsChanged,
}) => {
  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const [initialCenter] = useState(defaultCenter);
  const [initialZoom] = useState(defaultZoom);

  // Load Google Maps JS API (using provided API key)
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  });

  // On map load, keep reference to the map instance
  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);
  // On component unmount, clear the map instance
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // When a marker is clicked, activate it and notify parent
  const handleMarkerClick = useCallback(
    (listing) => {
      setActiveMarker(listing.id);
      if (onMarkerClick) {
        onMarkerClick(listing);
      }
    },
    [onMarkerClick]
  );

  // When an InfoWindow is closed, deactivate the marker
  const handleInfoWindowClose = useCallback(() => {
    setActiveMarker(null);
  }, []);

  // Generate a Marker component for each listing in the current list
  const markers = useMemo(() => {
    return listings.map((listing) => (
      <MarkerF
        key={listing.id}
        position={{ lat: listing.latitude, lng: listing.longitude }}
        onClick={() => {
          if (map) {
            map.panTo({ lat: listing.latitude, lng: listing.longitude });
          }
          handleMarkerClick(listing);
        }}
        icon={{
          path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
          fillColor: listing.id === selectedListing?.id ? "#ff385c" : "#4285F4",
          fillOpacity: 1,
          strokeColor: "#000",
          strokeWeight: 1,
          scale: 1,
          labelOrigin: { x: 0, y: -30 },
        }}
      >
        {activeMarker === listing.id && (
          <InfoWindowF
            position={{ lat: listing.latitude, lng: listing.longitude }}
            onCloseClick={handleInfoWindowClose}
          >
            <div style={{ padding: "5px", maxWidth: "200px" }}>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>
                {listing.name}
              </h3>
              <p style={{ margin: "0", fontSize: "12px" }}>
                £{listing.price} per night &middot; {listing.room_type_simple}
              </p>
            </div>
          </InfoWindowF>
        )}
      </MarkerF>
    ));
  }, [
    listings,
    selectedListing,
    activeMarker,
    handleMarkerClick,
    handleInfoWindowClose,
  ]);

  // Show a loading indicator until the Google Maps API is ready
  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "65vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={initialCenter}
      zoom={initialZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onIdle={() => {
        // Fired when the map stops moving (user finished dragging or zooming)
        if (map && onBoundsChanged) {
          // Get the current bounds of the map view
          const bounds = map.getBounds();
          if (bounds) {
            const ne = bounds.getNorthEast(); // north-east corner of bounds
            const sw = bounds.getSouthWest(); // south-west corner of bounds
            // Send the new bounds to the parent component via callback
            onBoundsChanged({
              lat_min: sw.lat(),
              lat_max: ne.lat(),
              lng_min: sw.lng(),
              lng_max: ne.lng(),
            });
          }
        }
      }}
      options={{
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }}
    >
      {markers}
    </GoogleMap>
  );
};

export default React.memo(GoogleMapComponent);
