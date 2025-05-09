import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import GoogleMapComponent from "../components/map/GoogleMapComponent";
import ListingDetailsPane from "../components/map/ListingDetailsPane";

const config = require("../config.json");

export default function MapPage() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState("All");
  const [mapBounds, setMapBounds] = useState(null); // holds current map bounding box (lat/lng limits)
  const [neighbourhoodChanged, setNeighbourhoodChanged] = useState(false);


  // Check if a listing is inside the current bounds
  const isWithinBounds = useCallback(
    (l, bounds) =>
      !bounds ||
      (l.latitude >= bounds.lat_min &&
        l.latitude <= bounds.lat_max &&
        l.longitude >= bounds.lng_min &&
        l.longitude <= bounds.lng_max),
    []
  );

  // Fetch listings whenever map bounds or filters change
  useEffect(() => {
    setLoading(true);
    
    // Determine how many listings to fetch and which to keep
    let survivors = [];
    let stillNeeded = 300;
    
    // // Only keep existing listings if neighbourhood hasn't changed
    // if (!neighbourhoodChanged) {
    //   survivors = listings.filter((l) => isWithinBounds(l, mapBounds));
    //   stillNeeded = Math.max(0, 300 - survivors.length);
      
    //   // If we have enough listings, just show them and avoid the API call
    //   if (stillNeeded === 0) {
    //     setListings(survivors);
    //     setLoading(false);
    //     return;
    //   }
    // }

    let apiUrl =
      `http://${config.server_host}:${config.server_port}` +
      `/listings/map?limit=${stillNeeded}`;

    // Include viewport bounds if available (to fetch only listings in view)
    if (mapBounds) {
      apiUrl +=
        `&lat_min=${mapBounds.lat_min}&lat_max=${mapBounds.lat_max}` +
        `&lng_min=${mapBounds.lng_min}&lng_max=${mapBounds.lng_max}`;
    }

    // Include neighbourhood filter if one is selected (not "All")
    if (selectedNeighbourhood && selectedNeighbourhood !== "All") {
      apiUrl += `&neighbourhood=${encodeURIComponent(selectedNeighbourhood)}`;
    }

    console.log("Fetching listings with URL:", apiUrl);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listings");
        return res.json();
      })
      .then((data) => {
        // If neighbourhood changed, only use the new data
        if (neighbourhoodChanged) {
          setListings(data.slice(0, 300));
          setLoading(false);
          return;
        }
        
        // // Otherwise deduplicate listings by ID (normal case)
        // const merged = [...survivors, ...data];
        // const uniq = [];
        // const seen = new Set();
        // for (const row of merged) {
        //   const id = row.id;
        //   if (!seen.has(id)) {
        //     seen.add(id);
        //     uniq.push(row);
        //   }
        //   if (uniq.length === 300) break;
        // }
        setNeighbourhoodChanged(false); // Reset the flag after fetching
        setListings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching listings:", err);
        setError("Failed to load listings. Please try again later."); // handle errors gracefully
        setLoading(false);
      });
  }, [selectedNeighbourhood, mapBounds, isWithinBounds]);

  // Fetch neighbourhood options for the filter dropdown on mount
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/neighbourhoods`)
      .then((res) => res.json())
      .then((data) => setNeighbourhoods(data))
      .catch((err) => console.error("Error fetching neighbourhoods:", err));
  }, []);

  // When a map marker is clicked, show details
  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
  };
  // Close the listing details pane
  const handleCloseDetails = () => {
    setSelectedListing(null);
  };
  // Toggle filter panel visibility
  const toggleFilters = () => {
    setFilterVisible(!filterVisible);
  };

  return (
    neighbourhoods.length > 0 && (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          London Airbnb Explorer
        </Typography>
        <Typography variant="body1" paragraph>
          Explore Airbnb listings across London. Drag or zoom the map to load
          listings in that area.
        </Typography>

        {/* Filter bar */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/** Neighbourhood filter */}
          <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
            <InputLabel>Neighbourhood</InputLabel>
            <Select
              label="Neighbourhood"
              value={selectedNeighbourhood}
              onChange={(e) => {
                setNeighbourhoodChanged(true);
                setSelectedNeighbourhood(e.target.value);
              }}
            >
              <MenuItem value="All">All Neighbourhoods</MenuItem>
              {neighbourhoods.map((n) => (
                <MenuItem key={n.neighbourhood} value={n.neighbourhood}>
                  {n.neighbourhood}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip
            label={`${listings.length} listings`}
            color="primary"
            variant="outlined"
            sx={{ ml: "auto" }}
          />
        </Paper>

        {/* Map view and listing details */}
        <Grid container spacing={3}>
          {/* Map Area */}
          <Grid item size={{ xs: 12, md: selectedListing ? 8 : 12 }}>
            <Paper
              sx={{
                height: "70vh",
                overflow: "hidden",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <GoogleMapComponent
                listings={listings}
                selectedListing={selectedListing}
                onMarkerClick={handleMarkerClick}
                onBoundsChanged={(newBounds) => {
                  // Update mapBounds state when the map's view (bounds) changes significantly
                  if (
                    !mapBounds ||
                    Math.abs(newBounds.lat_min - mapBounds.lat_min) > 0.001 ||
                    Math.abs(newBounds.lat_max - mapBounds.lat_max) > 0.001 ||
                    Math.abs(newBounds.lng_min - mapBounds.lng_min) > 0.001 ||
                    Math.abs(newBounds.lng_max - mapBounds.lng_max) > 0.001
                  ) {
                    setMapBounds(newBounds);
                  }
                }}
              />
            </Paper>
          </Grid>

          {/* Details pane for selected listing (appears when a marker is clicked) */}
          {selectedListing && (
            <Grid item size={{ xs: 12, md: 4 }}>
              <ListingDetailsPane
                listing={selectedListing}
                onClose={handleCloseDetails}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    )
  );
}