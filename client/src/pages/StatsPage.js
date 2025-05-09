import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import NeighbourhoodVisualization from "../components/map/NeighbourhoodVisualization";

const config = require("../config.json");

export default function StatsPage() {
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState("");
  const [interactionData, setInteractionData] = useState(null);
  const [interactionLoading, setInteractionLoading] = useState(true);
  const [interactionError, setInteractionError] = useState(null);
  const [selectedBedrooms, setSelectedBedrooms] = useState("");

  // Fetch neighbourhoods and set the first one as default
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/neighbourhoods`)
      .then((res) => res.json())
      .then((data) => {
        setNeighbourhoods(data);
        if (data.length > 0) {
          setSelectedNeighbourhood(data[0].neighbourhood); // Default to first neighbourhood
        }
      })
      .catch((err) => console.error("Error fetching neighbourhoods:", err));
  }, []);

  // Fetch interaction data
  useEffect(() => {
    setInteractionLoading(true);
    fetch(`http://${config.server_host}:${config.server_port}/hosts/interactions`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch interaction data");
        }
        return res.json();
      })
      .then((data) => {
        setInteractionData(data);
        setInteractionLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching interaction data:", err);
        setInteractionError("Failed to load interaction data. Please try again later.");
        setInteractionLoading(false);
      });
  }, []);

  // Compute available bedrooms based on selected neighbourhood
  const availableBedrooms = useMemo(() => {
    if (!interactionData || !selectedNeighbourhood) return [];
    return [
      ...new Set(
        interactionData
          .filter((d) => d.neighbourhood_cleansed === selectedNeighbourhood)
          .map((d) => d.bedrooms)
      ),
    ].sort((a, b) => a - b);
  }, [interactionData, selectedNeighbourhood]);

  // Set the first bedroom as default when availableBedrooms updates
  useEffect(() => {
    if (availableBedrooms.length > 0) {
      setSelectedBedrooms(String(availableBedrooms[0])); // Default to first bedroom
    } else {
      setSelectedBedrooms(""); // Reset if no bedrooms are available
    }
  }, [availableBedrooms]);

  return (
    neighbourhoods.length > 0 && (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          London Airbnb Neighbourhood Analysis
        </Typography>
        <Typography variant="body1" paragraph>
          Analyze host performance across London neighbourhoods. Compare Superhosts vs Non-Superhosts.
        </Typography>

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
          <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
            <InputLabel>Neighbourhood</InputLabel>
            <Select
              label="Neighbourhood"
              onChange={(e) => setSelectedNeighbourhood(e.target.value)}
              value={selectedNeighbourhood}
            >
              {neighbourhoods.map((n) => (
                <MenuItem key={n.neighbourhood} value={n.neighbourhood}>
                  {n.neighbourhood}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
            <InputLabel>Bedrooms</InputLabel>
            <Select
              label="Bedrooms"
              onChange={(e) => setSelectedBedrooms(e.target.value)}
              value={selectedBedrooms}
            >
              {availableBedrooms.map((b) => (
                <MenuItem key={b} value={String(b)}>
                  {b}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <NeighbourhoodVisualization selectedNeighbourhood={selectedNeighbourhood} selectedBedrooms={selectedBedrooms} />

      </Container>
    )
  );
}