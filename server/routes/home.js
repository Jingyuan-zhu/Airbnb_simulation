const connection = require('./db');

// Route: GET /home
const getHome = async function (req, res) {
  // Get basic statistics about listings
  connection.query(
    `
    SELECT 
      COUNT(*) AS total_listings,
      AVG(CAST(price AS FLOAT)) AS avg_price,
      COUNT(DISTINCT neighbourhood_cleansed) AS total_neighborhoods
    FROM listings
  `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows[0]);
      }
    }
  );
};

module.exports = {
  getHome
};