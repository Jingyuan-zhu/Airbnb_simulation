const connection = require('./db');

// Route: GET /neighbourhoods
const getNeighbourhoods = async function (req, res) {
  // Get all unique neighbourhoods
  connection.query(
    `
    SELECT DISTINCT neighbourhood_cleansed AS neighbourhood
    FROM listings
    ORDER BY neighbourhood_cleansed
  `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    }
  );
};

module.exports = {
  getNeighbourhoods
};