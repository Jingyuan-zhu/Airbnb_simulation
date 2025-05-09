const { connection, wrapAsync } = require('./db');

/**
 * @swagger
 * /home:
 *   get:
 *     summary: Get basic statistics about the Airbnb listings
 *     description: Returns aggregate information including total listings count, average price, and total neighborhoods
 *     tags:
 *       - Home
 *     responses:
 *       200:
 *         description: Basic statistics about listings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_listings:
 *                   type: integer
 *                   description: Total number of listings in the database
 *                   example: 23456
 *                 avg_price:
 *                   type: number
 *                   format: float
 *                   description: Average price of all listings
 *                   example: 125.75
 *                 total_neighborhoods:
 *                   type: integer
 *                   description: Total number of unique neighborhoods
 *                   example: 34
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Database error. Please try again later.
 */
// Route: GET /home
const getHome = wrapAsync(async function (req, res) {
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
        return res.status(500).json({ error: "Database error. Please try again later." });
      } else {
        res.json(data.rows[0] || {});
      }
    }
  );
});

module.exports = {
  getHome
};