import {
  AppBar,
  Container,
  Stack,
  Typography,
  Box,
  Button,
  ButtonBase,
} from "@mui/material";
import MenuContent from "./MenuContent";

// The NavBar component uses MUI's AppBar component as the foundation.
// The component will be displayed on the top of the page.
// NavBar contains links to navigate to all pages in the application.
export default function NavBar() {
  return (
    <AppBar position="static" sx={{ bgcolor: "info.light", p: 0, m: 0 }}>
      <Container maxWidth="xl">
        <Stack direction={"row"} sx={{ alignItems: "center" }}>
          <ButtonBase href="/">
            <Box pr={0.5}>
              <img src="/Airbnb-Logo.png" alt="Logo" height="60px" />
            </Box>
            <Typography
              variant="h6"
              to="/"
              sx={{ color: "text.primary", py: 2, pr: 1 }}
            >
              Explorer
            </Typography>
          </ButtonBase>
          <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
            <MenuContent />
          </Box>
        </Stack>
      </Container>
    </AppBar>
  );
}
