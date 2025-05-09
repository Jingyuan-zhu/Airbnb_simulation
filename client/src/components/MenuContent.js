import * as React from "react";

import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { NavLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { useAuth } from "../context/AuthContext";
import { Box, Menu, MenuItem, Button, Avatar } from "@mui/material";

const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon />, route: "/" },
  { text: "Neighbourhoods", icon: <AnalyticsRoundedIcon />, route: "/stats" },
  { text: "Listings", icon: <AnalyticsRoundedIcon />, route: "/listings" },
  { text: "Map", icon: <PeopleRoundedIcon />, route: "/map" },
];

const secondaryListItems = [
  // { text: "Settings", icon: <SettingsRoundedIcon /> },
  // { text: 'About', icon: <InfoRoundedIcon /> },
  // { text: 'Feedback', icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  return (
    <Stack
      direction={"row"}
      sx={{ flexGrow: 1, pl: 2, justifyContent: "space-between" }}
    >
      <Stack direction={"row"} sx={{ flexGrow: 1 }} spacing={2}>
        {mainListItems.map((item, index) => (
          <ButtonBase
            key={index}
            href={item.route}
            sx={{
              color: "primary.dark",
              p: 2,
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              {item.text}
            </Typography>
          </ButtonBase>
        ))}
      </Stack>
      <Stack direction={"row"} alignItems="center">
        {secondaryListItems.map((item, index) => (
          <ButtonBase
            key={index}
            href={item.route}
            sx={{ color: "primary.dark", p: 2 }}
          >
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              {item.text}
            </Typography>
          </ButtonBase>
        ))}
        
        {isAuthenticated ? (
          <>
            <Box 
              onClick={handleClick}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 1, 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderRadius: 1
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  mr: 1
                }}
              >
                {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="body1" sx={{ color: "text.primary" }}>
                {user?.displayName || user?.username}
              </Typography>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={handleLogout} dense>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button 
            href="/login"
            startIcon={<LoginIcon />}
            variant="contained"
            color="primary"
            sx={{ my: 1, mx: 1 }}
          >
            Login
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
