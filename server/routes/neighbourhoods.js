const { connection, wrapAsync } = require('./db');

/**
 * @swagger
 * /neighbourhoods:
 *   get:
 *     summary: Get all unique neighbourhoods
 *     description: Returns a list of all unique neighbourhood names from the listings
 *     tags:
 *       - Neighbourhoods
 *     responses:
 *       200:
 *         description: A list of unique neighbourhoods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   neighbourhood:
 *                     type: string
 *                     description: Name of the neighbourhood
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
// Route: GET /neighbourhoods
const getNeighbourhoods = wrapAsync(async function (req, res) {
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
        return res.status(500).json({ error: "Database error. Please try again later." });
      } else {
        res.json(data.rows || []);
      }
    }
  );
});

module.exports = {
  getNeighbourhoods
};