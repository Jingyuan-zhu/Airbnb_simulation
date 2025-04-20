const express = require("express");
const cors = require("cors");
const config = require("./config.json");
const routes = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");
const path = require("path");

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb Visualisation API",
      description: "API for accessing and analyzing Airbnb listing data",
      version: "1.0.0",
      contact: {
        name: "Support",
        email: "support@example.com"
      }
    },
    servers: [
      {
        url: `http://${config.server_host}:${config.server_port}`,
        description: "Development server"
      }
    ],
    tags: [
      {
        name: "Home",
        description: "Basic statistics about the dataset"
      },
      {
        name: "Listings",
        description: "Operations related to Airbnb listings"
      },
      {
        name: "Hosts",
        description: "Operations related to Airbnb hosts"
      },
      {
        name: "Neighbourhoods",
        description: "Operations related to neighborhoods"
      },
      {
        name: "Analytics",
        description: "Advanced analytics and data insights"
      },
      {
        name: "Reviews",
        description: "Listing reviews"
      }
    ]
  },
  apis: ["./routes/*.js"] // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// // Write the OpenAPI specification to a file
// fs.writeFileSync(
//   path.join(__dirname, "openapi.json"),
//   JSON.stringify(swaggerSpec, null, 2)
// );

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
app.get("/listings/:id", routes.listing);
app.get("/listings/:id/reviews", routes.reviews);

// Hosts routes
app.get("/hosts", routes.hosts);
app.get("/hosts/experienced", routes.experienced);
app.get("/hosts/types", routes.host_types);
app.get("/hosts/interactions", routes.host_interactions);
app.get("/hosts/verified", routes.host_verified);

// Neighbourhoods routes
app.get("/neighbourhoods", routes.neighbourhoods);

// Analytics routes
app.get("/analytics/overview", routes.overview);
app.get("/analytics/room_types", routes.room_types);
app.get("/analytics/room_type_sentiment", routes.room_type_sentiment);
app.get("/analytics/monthly_price", routes.monthly_price);
app.get("/analytics/hidden_gems", routes.hidden_gems);
app.get("/analytics/high-performers", routes.high_performer_hosts);

// Serve API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    defaultModelsExpandDepth: -1, // Hide schemas section by default
  },
  customCss: '.swagger-ui .topbar { display: none }', // Hide the top bar
  customSiteTitle: "Airbnb Simulation API Documentation"
}));

// Serve the OpenAPI spec as JSON
app.get('/openapi.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi.json'));
});


app.listen(config.server_port, () => {
  console.log(
    `Server running at http://${config.server_host}:${config.server_port}/`
  );
  console.log(
    `API documentation options:`
  );
  console.log(
    `- Swagger UI: http://${config.server_host}:${config.server_port}/api-docs`
  );
  console.log(
    `- Raw OpenAPI: http://${config.server_host}:${config.server_port}/openapi.json`
  );
});

module.exports = app;