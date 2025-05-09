import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";

import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import MapPage from "./pages/MapPage";
import StatsPage from "./pages/StatsPage";
import Login from "./components/Login";
import HighPerformerHostsPage from "./pages/HighPerformerHostsPage";


import AppTheme from "./theme/AppTheme";
import { AuthProvider } from "./context/AuthContext";


// App is the root component of our application with our page routes
export default function App() {
  return (
    <AuthProvider>
      <AppTheme>
        <CssBaseline enableColorScheme />
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/neighbourhood" element={<StatsPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:listing_id" element={<ListingDetailPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/high-performer-hosts" element={<HighPerformerHostsPage />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </AppTheme>
    </AuthProvider>
  );
}
