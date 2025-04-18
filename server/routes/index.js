const listingsRoutes = require('./listings');
const hostsRoutes = require('./hosts');
const neighbourhoodsRoutes = require('./neighbourhoods');
const analyticsRoutes = require('./analytics');
const homeRoutes = require('./home');

module.exports = {
  // Home routes
  home: homeRoutes.getHome,
  
  // Listings routes
  listings: listingsRoutes.getListings,
  listing: listingsRoutes.getListing,
  search_listings: listingsRoutes.searchListings,
  reviews: listingsRoutes.getReviews,
  
  // Hosts routes
  hosts: hostsRoutes.getHosts,
  experienced: hostsRoutes.getExperiencedHosts,
  host_types: hostsRoutes.getHostTypes,
  host_interactions: hostsRoutes.getHostInteractions,
  host_verified: hostsRoutes.getHostVerified,
  high_performer_hosts: hostsRoutes.getHighPerformerHosts,
  
  // Neighbourhoods routes
  neighbourhoods: neighbourhoodsRoutes.getNeighbourhoods,
  
  // Analytics routes
  overview: analyticsRoutes.getOverview,
  room_types: analyticsRoutes.getRoomTypes,
  room_type_sentiment: analyticsRoutes.getRoomTypeSentiment,
  monthly_price: analyticsRoutes.getMonthlyPrice,
  hidden_gems: analyticsRoutes.getHiddenGems
};