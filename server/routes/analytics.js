const { connection, validateParam, wrapAsync } = require('./db');

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Get neighborhood overview statistics
 *     description: Shows the average cost and density of listings across different London neighborhoods
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: List of neighborhoods with listing count and average price
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   neighbourhood_cleansed:
 *                     type: string
 *                     description: Neighborhood name
 *                   number_of_listings:
 *                     type: integer
 *                     description: Number of listings in this neighborhood
 *                   average_price:
 *                     type: number
 *                     format: float
 *                     description: Average price of listings in this neighborhood
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
// Query 1
// Route: GET /analytics/overview
// Shows the average cost and density of listings across different
// London neighborhoods. Useful for the market overview and map page.
const getOverview = wrapAsync(async function (req, res) {
  connection.query(
    `
    SELECT
        l.neighbourhood_cleansed,
        COUNT(l.id) AS number_of_listings,
        ROUND(AVG(l.price)) AS average_price
    FROM
        listings l
    GROUP BY
        l.neighbourhood_cleansed
    ORDER BY
        number_of_listings DESC, average_price DESC;
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

/**
 * @swagger
 * /analytics/room_types:
 *   get:
 *     summary: Get room type distribution
 *     description: Provides a breakdown of the types of accommodations available
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Distribution of listings by room type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   room_type_simple:
 *                     type: string
 *                     description: Type of room (e.g., Entire home/apt, Private room)
 *                   number_of_listings:
 *                     type: integer
 *                     description: Number of listings with this room type
 *                   percentage_of_total:
 *                     type: number
 *                     format: float
 *                     description: Percentage of total listings with this room type
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
// Query 3
// Route: GET /analytics/room_types
// Provides a basic understanding of the types of accommodations available
// (e.g., Entire home/apt, Private room), for the initial homepage statistics.
const getRoomTypes = wrapAsync(async function (req, res) {
  connection.query(
    `
    SELECT
        room_type_simple,
        COUNT(id) AS number_of_listings,
        CAST(COUNT(id) * 100.0 / (SELECT COUNT(*) FROM listings) AS DECIMAL(5,2)) AS percentage_of_total
    FROM
        listings
    GROUP BY
        room_type_simple
    ORDER BY
        number_of_listings DESC;
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

/**
 * @swagger
 * /analytics/room_type_sentiment:
 *   get:
 *     summary: Get sentiment analysis by room type
 *     description: Summarizes the proportion of listings by room type that typically receive positive feedback
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: room_type
 *         schema:
 *           type: string
 *         description: Filter results by specific room type
 *     responses:
 *       200:
 *         description: Sentiment analysis by room type
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   room_type:
 *                     type: string
 *                     description: Type of room
 *                   percent_positive_reviews:
 *                     type: number
 *                     format: float
 *                     description: Percentage of positive reviews for this room type
 *                   number_of_listings:
 *                     type: integer
 *                     description: Number of listings with this room type
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
// Query 7
// Route: GET /analytics/room_type_sentiment
// Summarizes the proportion of listings by room type that typically receive positive feedback.
const getRoomTypeSentiment = wrapAsync(async function (req, res) {
  // Validate room_type parameter (if provided)
  if (req.query.room_type) {
    const roomTypeValidation = validateParam(req.query.room_type, 'string');
    if (!roomTypeValidation.isValid) {
      return res.status(400).json({ error: `Room type parameter invalid: ${roomTypeValidation.message}` });
    }
  }
  
  const room_type = req.query.room_type;
  
  let query = `
    SELECT
        l.room_type_simple AS room_type,
        ROUND(AVG(CASE r.sentiment WHEN 'Positive' THEN 1 ELSE 0 END) * 100, 2) AS percent_positive_reviews,
        COUNT(DISTINCT l.id) AS number_of_listings
    FROM listings l
             JOIN reviews r ON l.id = r.listing_id
    GROUP BY l.room_type_simple
    ${room_type ? 'HAVING l.room_type_simple = $1' : ''}
    ORDER BY percent_positive_reviews DESC;
  `;
  
  const params = room_type ? [room_type] : [];
  
  connection.query(query, params, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Database error. Please try again later." });
    } else {
      res.json(data.rows || []);
    }
  });
});

/**
 * @swagger
 * /analytics/monthly_price:
 *   get:
 *     summary: Get monthly price trends
 *     description: Provides an estimated trend of average listing prices over time, grouped by month
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter results after this date (YYYY-MM-DD format, defaults to 1900-01-01)
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter results before this date (YYYY-MM-DD format, defaults to 2100-01-01)
 *     responses:
 *       200:
 *         description: Monthly price trends over time
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   review_month:
 *                     type: string
 *                     description: Month in YYYY-MM format
 *                   listings_reviewed_count:
 *                     type: integer
 *                     description: Number of listings reviewed in this month
 *                   average_price_of_reviewed_listings:
 *                     type: number
 *                     format: float
 *                     description: Average price of listings reviewed in this month
 *       400:
 *         description: Invalid date parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
// Query 8
// Route: GET /analytics/monthly_price
// Provides an estimated trend of average listing prices over time, grouped by the month and year reviews were left.
const getMonthlyPrice = wrapAsync(async function (req, res) {
  // Validate date parameters (if provided)
  if (req.query.after) {
    const afterValidation = validateParam(req.query.after, 'date');
    if (!afterValidation.isValid) {
      return res.status(400).json({ error: `After date parameter invalid: ${afterValidation.message}` });
    }
  }
  
  if (req.query.before) {
    const beforeValidation = validateParam(req.query.before, 'date');
    if (!beforeValidation.isValid) {
      return res.status(400).json({ error: `Before date parameter invalid: ${beforeValidation.message}` });
    }
  }
  
  const after = req.query.after || "1900-01-01";
  const before = req.query.before || "2100-01-01";

  connection.query(
    `
    SELECT
    TO_CHAR(r.date, 'YYYY-MM') AS review_month,
    COUNT(DISTINCT l.id) AS listings_reviewed_count,
    ROUND(AVG(l.price)::NUMERIC, 2) AS average_price_of_reviewed_listings
FROM
    reviews r
        JOIN
    listings l ON r.listing_id = l.id
WHERE
    l.price IS NOT NULL
GROUP BY
    review_month
    HAVING review_month BETWEEN $1 AND $2
ORDER BY
    review_month;
`,
    [after, before],
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

/**
 * @swagger
 * /analytics/hidden_gems:
 *   get:
 *     summary: Find hidden gem listings
 *     description: Finds highly rated, high-value listings with relatively few reviews and low price compared to neighbourhood norms
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: min_rating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating threshold for hidden gems (default is 4.8)
 *     responses:
 *       200:
 *         description: List of hidden gem listings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   listing_id:
 *                     type: integer
 *                     description: Unique identifier of the listing
 *                   listing_name:
 *                     type: string
 *                     description: Name of the listing
 *                   neighbourhood_cleansed:
 *                     type: string
 *                     description: Neighborhood where the listing is located
 *                   room_type_simple:
 *                     type: string
 *                     description: Type of room
 *                   scores_rating:
 *                     type: number
 *                     format: float
 *                     description: Overall rating score
 *                   scores_value:
 *                     type: number
 *                     format: float
 *                     description: Value for money rating
 *                   number_of_reviews:
 *                     type: integer
 *                     description: Number of reviews for this listing
 *                   price:
 *                     type: number
 *                     format: float
 *                     description: Price per night
 *                   avg_neighbourhood_reviews:
 *                     type: number
 *                     format: float
 *                     description: Average number of reviews for listings in this neighborhood
 *                   avg_neighbourhood_price_for_room_type:
 *                     type: number
 *                     format: float
 *                     description: Average price for this room type in this neighborhood
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
// Query 9
// Route: GET /analytics/hidden_gems
// Find highly rated, high-value listings with relatively few reviews and low price compared to neighbourhood norms.
const getHiddenGems = wrapAsync(async function (req, res) {
  // Validate min_rating parameter (if provided)
  if (req.query.min_rating) {
    const minRatingValidation = validateParam(req.query.min_rating, 'number', { min: 1, max: 5 });
    if (!minRatingValidation.isValid) {
      return res.status(400).json({ error: `Minimum rating parameter invalid: ${minRatingValidation.message}` });
    }
  }
  
  const min_rating = req.query.min_rating ? parseFloat(req.query.min_rating) : 4.8;

  connection.query(
    `
WITH NeighbourhoodAverages AS (
    SELECT
        neighbourhood_cleansed,
        room_type_simple,
        AVG(price) AS avg_price_for_room_type
    FROM listings
    WHERE price IS NOT NULL
    GROUP BY neighbourhood_cleansed, room_type_simple
),
     NeighbourhoodReviewAvg AS (
         SELECT
             l_inner.neighbourhood_cleansed,
             AVG(ri_inner.number_of_reviews) as avg_reviews
         FROM review_info ri_inner
                  JOIN listings l_inner ON ri_inner.id = l_inner.id
         WHERE ri_inner.number_of_reviews IS NOT NULL
         GROUP BY l_inner.neighbourhood_cleansed
     )
SELECT
    l.id AS listing_id,
    l.name AS listing_name,
    l.neighbourhood_cleansed,
    l.room_type_simple,
    ri.scores_rating,
    ri.scores_value,
    ri.number_of_reviews,
    l.price,
    ROUND(nra.avg_reviews::NUMERIC, 2) AS avg_neighbourhood_reviews,
    ROUND(na.avg_price_for_room_type::NUMERIC, 2) AS avg_neighbourhood_price_for_room_type
FROM
    listings l
        JOIN
    review_info ri ON l.id = ri.id
        JOIN
        NeighbourhoodAverages na ON l.neighbourhood_cleansed = na.neighbourhood_cleansed AND l.room_type_simple = na.room_type_simple
        JOIN
    NeighbourhoodReviewAvg nra ON l.neighbourhood_cleansed = nra.neighbourhood_cleansed
WHERE
    ri.scores_rating > $1
  AND ri.scores_value > $2
  AND ri.number_of_reviews IS NOT NULL
  AND l.price IS NOT NULL
  AND ri.number_of_reviews < nra.avg_reviews
  AND l.price < na.avg_price_for_room_type
ORDER BY
    l.neighbourhood_cleansed, l.room_type_simple, ri.scores_rating DESC;
`,
    [min_rating, min_rating],
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
  getOverview,
  getRoomTypes,
  getRoomTypeSentiment,
  getMonthlyPrice,
  getHiddenGems
};