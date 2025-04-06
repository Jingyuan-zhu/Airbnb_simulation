import { AppBar, Container, Toolbar, Typography, Box, Button } from '@mui/material'
import { NavLink } from 'react-router-dom';

// The hyperlinks in the NavBar contain a lot of repeated styling code so a higher-order
// component is used here to simplify the code. The href is the page to navigate to and children
// is the text to display for the link.
const NavText = ({ href, children }) => {
  return (
    <Typography
      variant='button'
      component={NavLink}
      to={href}
      sx={{
        color: 'white',
        textDecoration: 'none',
        marginX: 2,
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
    >
      {children}
    </Typography>
  );
};

// The NavBar component uses MUI's AppBar component as the foundation.
// The component will be displayed on the top of the page.
// NavBar contains links to navigate to all pages in the application.
export default function NavBar() {
  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <Typography
            variant='h6'
            component={NavLink}
            to='/'
            sx={{
              color: 'white',
              textDecoration: 'none',
              marginRight: 3,
              fontWeight: 'bold',
              fontSize: 24,
            }}
          >
            Airbnb Explorer
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <NavText href='/'>Home</NavText>
            <NavText href='/listings'>Listings</NavText>
            <NavText href='/map'>Map</NavText>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
