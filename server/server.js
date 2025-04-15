const express = require('express');
const cors = require('cors');
const config = require('./config.json');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// Define API endpoints for Airbnb data
app.get('/home', routes.home);
app.get('/listings', routes.listings);
app.get('/listing/:listing_id', routes.listing);
app.get('/hosts', routes.hosts);
app.get('/reviews/:listing_id', routes.reviews);
app.get('/neighbourhoods', routes.neighbourhoods);
app.get('/search_listings', routes.search_listings);
app.get('/overview', routes.overview);
app.get('/experienced', routes.experienced);
app.get('/room_types', routes.room_types);
app.get('/host_types', routes.host_types);
app.get('/host_interactions', routes.host_interactions);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
