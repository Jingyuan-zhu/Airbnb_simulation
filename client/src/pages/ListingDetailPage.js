import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  Box,
  Chip,
} from "@mui/material";
import LazyTable from "../components/LazyTable";

const config = require("../config.json");

export default function ListingDetailPage() {
  const { listing_id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    // Fetch the listing details
    fetch(
      `http://${config.server_host}:${config.server_port}/listings/${listing_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        // Format the listing data
        const formattedData = {
          ...data,
          response_rate: data.response_rate
            ? `${data.response_rate * 100}%`
            : "N/A",
          acceptance_rate: data.acceptance_rate
            ? `${data.acceptance_rate * 100}%`
            : "N/A",
        };
        return formattedData;
      })
      .then((data) => setListing(data));
  }, [listing_id]);

  // Define the columns for the reviews table
  const reviewColumns = [
    {
      field: "date",
      headerName: "Date",
      renderCell: (row) => {
        // Format the date nicely
        const dateObj = new Date(Date.parse(row.date));
        return dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      },
    },
    {
      field: "reviewer_name",
      headerName: "Reviewer",
    },
    {
      field: "comments",
      headerName: "Review",
      renderCell: (row) => {
        return <Typography maxWidth={"40vw"}>{row.comments}</Typography>;
      },
    },
    {
      field: "sentiment",
      headerName: "Review Sentiment",
      renderCell: (row) => {
        // Display sentiment with appropriate color
        const sentimentStyles = {
          Positive: { color: "#4caf50", fontWeight: "bold" },
          Neutral: { color: "#ff9800", fontWeight: "bold" },
          Negative: { color: "#f44336", fontWeight: "bold" },
        };

        return (
          <Typography style={sentimentStyles[row.sentiment] || {}}>
            {row.sentiment || "Unknown"}
          </Typography>
        );
      },
    },
  ];

  // If listing is still loading, display a loading message
  if (!listing) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5">Loading listing details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {listing.name}
      </Typography>

      <Grid container spacing={3}>
        {/* Main Image */}
        <Grid item size={{ xs: 12, md: 12 }}>
          <Box
            component="img"
            src={listing.picture_url}
            alt={listing.name}
            sx={{
              width: "100%", // fill the width of the grid column
              maxHeight: "40vh",  
              objectFit: "cover", // crop instead of squeeze
              borderRadius: 2, // subtle rounded corners
            }}
          />
        </Grid>

        {/* About this listing */}
        <Grid item size={{ xs: 12, md: 8.5 }}>
          <Paper sx={{ p: 3, mb: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              About this listing
            </Typography>
            <Typography variant="body1">
              {listing.description || "No description available."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Neighborhood
                </Typography>
                <Typography variant="body1">
                  {listing.neighbourhood_cleansed}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Room Type
                </Typography>
                <Typography variant="body1">
                  {listing.room_type_simple}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Accommodates
                </Typography>
                <Typography variant="body1">
                  {listing.accommodates} guests
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Bathrooms
                </Typography>
                <Typography variant="body1">
                  {listing.bathrooms || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Bedrooms
                </Typography>
                <Typography variant="body1">
                  {listing.bedrooms || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Beds
                </Typography>
                <Typography variant="body1">{listing.beds || "N/A"}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        {/* Price and Host Information */}
        <Grid item size={{ xs: 12, md: 3.5 }}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderLeft: "4px solid #1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                color="primary"
                fontWeight="bold"
                gutterBottom
              >
                £{listing.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                per night
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              p: 3,
              borderLeft: listing.is_superhost ? "4px solid #ff9800" : "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {listing.host_name || "Unknown Host"}
              </Typography>
              {listing.is_superhost && (
                <Chip
                  label="Superhost"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Response Rate
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.response_rate || "Unknown"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Acceptance Rate
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {listing.acceptance_rate || "Unknown"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reviews
            </Typography>
            <LazyTable
              route={`http://${config.server_host}:${config.server_port}/listings/${listing_id}/reviews`}
              columns={reviewColumns}
              defaultPageSize={5}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
