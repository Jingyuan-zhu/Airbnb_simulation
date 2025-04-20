const express = require("express");
const cors = require("cors");
const config = require("./config.json");
const routes = require("./routes");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

// Import swagger specification from separate file
const swaggerSpec = require("./swagger");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

// Define API endpoints for Airbnb data
app.get("/home", routes.home);

// Listings routes
app.get("/listings", routes.listings);
app.get("/listings/search", routes.search_listings);
app.get("/listings/:listing_id", routes.listing);
app.get("/listings/:listing_id/reviews", routes.reviews);

// Hosts routes
app.get("/hosts", routes.hosts);
app.get("/hosts/experienced", routes.experienced);
app.get("/hosts/types", routes.host_types);
app.get("/hosts/interactions", routes.host_interactions);
app.get("/hosts/verified", routes.host_verified);
app.get("/hosts/high-performers", routes.high_performer_hosts);

// Neighbourhoods routes
app.get("/neighbourhoods", routes.neighbourhoods);

// Analytics routes
app.get("/analytics/overview", routes.overview);
app.get("/analytics/room_types", routes.room_types);
app.get("/analytics/room_type_sentiment", routes.room_type_sentiment);
app.get("/analytics/monthly_price", routes.monthly_price);
app.get("/analytics/hidden_gems", routes.hidden_gems);

// Serve API documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, // Hide schemas section by default
    },
    customCss: ".swagger-ui .topbar { display: none }", // Hide the top bar
    customSiteTitle: "Airbnb Simulation API Documentation",
  })
);

// Serve the OpenAPI spec as JSON
app.get("/openapi.json", (req, res) => {
  res.sendFile(path.join(__dirname, "openapi.json"));
});

app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
  console.log(`API documentation options:`);
  console.log(
    `- Swagger UI: http://${config.server_host}:${config.server_port}/api-docs`
  );
  console.log(
    `- Raw OpenAPI: http://${config.server_host}:${config.server_port}/openapi.json`
  );
});

module.exports = app;
