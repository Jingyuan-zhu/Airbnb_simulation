import * as React from "react";

import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { NavLink } from "react-router-dom";
import Typography from "@mui/material/Typography";

const mainListItems = [
  { text: "Home", icon: <HomeRoundedIcon />, route: "/" },
  { text: "Neighbourhoods", icon: <AnalyticsRoundedIcon />, route: "/neighbourhood" },
  { text: "Listings", icon: <AnalyticsRoundedIcon />, route: "/listings" },
  { text: "Map", icon: <PeopleRoundedIcon />, route: "/map" },
];

const secondaryListItems = [
  // { text: "Settings", icon: <SettingsRoundedIcon /> },
  // { text: 'About', icon: <InfoRoundedIcon /> },
  // { text: 'Feedback', icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
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
      <Stack direction={"row"}>
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
      </Stack>
    </Stack>
  );
}
