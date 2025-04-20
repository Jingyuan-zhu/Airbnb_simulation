const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

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
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://${config.server_host}:${config.server_port}`,
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Home",
        description: "Basic statistics about the dataset",
      },
      {
        name: "Listings",
        description: "Operations related to Airbnb listings",
      },
      {
        name: "Hosts",
        description: "Operations related to Airbnb hosts",
      },
      {
        name: "Neighbourhoods",
        description: "Operations related to neighborhoods",
      },
      {
        name: "Analytics",
        description: "Advanced analytics and data insights",
      },
      {
        name: "Reviews",
        description: "Listing reviews",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Write the OpenAPI specification to a file
fs.writeFileSync(
  path.join(__dirname, "openapi.json"),
  JSON.stringify(swaggerSpec, null, 2)
);

console.log("OpenAPI specification generated: openapi.json");

// Export the swagger spec for use in server.js
module.exports = swaggerSpec;