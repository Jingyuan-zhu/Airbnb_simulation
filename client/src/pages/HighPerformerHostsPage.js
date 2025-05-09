import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Box,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import LazyTable from "../components/LazyTable";
import { formatCurrency } from "../helpers/formatter";

const config = require("../config.json");

export default function HighPerformerHostsPage() {
  const [minListings, setMinListings] = useState(3);
  const [minRating, setMinRating] = useState(4.7);
  const [orderBy, setOrderBy] = useState("total_listings_count");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const columns = [
    { field: "host_id", headerName: "Host ID" },
    { field: "host_name", headerName: "Host Name" },
    { 
      field: "total_listings_count", 
      headerName: "Total Listings",
      renderCell: (row) => row.total_listings_count
    },
    { 
      field: "average_value_score_across_listings", 
      headerName: "Avg Review Score",
      renderCell: (row) => Number(row.average_value_score_across_listings).toFixed(2)
    },
    { 
      field: "min_listing_rating", 
      headerName: "Min Listing Rating",
      renderCell: (row) => Number(row.min_listing_rating).toFixed(2)
    }
  ];

  const orderByOptions = [
    { value: "host_name", label: "Host Name" },
    { value: "total_listings_count", label: "Total Listings" },
    { value: "average_value_score_across_listings", label: "Average Review Score" },
    { value: "min_listing_rating", label: "Minimum Listing Rating" }
  ];


  // Effect to reset loading state when parameters change
  useEffect(() => {
    setIsLoading(false);
    setError(null);
  }, [minListings, minRating, orderBy]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        High Performer Hosts
      </Typography>
      <Typography variant="body1" paragraph>
        Explore hosts who consistently deliver high-quality experiences across their listings. These hosts maintain excellent ratings across their entire portfolio.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filter Options
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mb: 2 }}>
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <Typography gutterBottom>Minimum Listings: {minListings}</Typography>
            <Slider
              value={minListings}
              onChange={(e, newValue) => setMinListings(newValue)}
              step={1}
              marks
              min={1}
              max={10}
              valueLabelDisplay="auto"
            />
          </Box>
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <Typography gutterBottom>Minimum Rating: {minRating.toFixed(1)}</Typography>
            <Slider
              value={minRating}
              onChange={(e, newValue) => setMinRating(newValue)}
              step={0.1}
              marks
              min={4.0}
              max={5.0}
              valueLabelDisplay="auto"
            />
          </Box>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={orderBy}
              label="Sort By"
              onChange={(e) => setOrderBy(e.target.value)}
            >
              {orderByOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <LazyTable
          route={`http://${config.server_host}:${config.server_port}/hosts/high-performers?min_listings=${minListings}&min_rating=${minRating}&order_by=${orderBy}`}
          columns={columns}
          defaultPageSize={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Container>
  );
}