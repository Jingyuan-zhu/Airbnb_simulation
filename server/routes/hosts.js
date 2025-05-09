const {
  connection,
  validateParam,
  validatePagination,
  wrapAsync,
} = require("./db");

/**
 * @swagger
 * /hosts:
 *   get:
 *     summary: Get paginated host information
 *     description: Returns a paginated list of Airbnb hosts with their details
 *     tags:
 *       - Hosts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page (default is return all)
 *     responses:
 *       200:
 *         description: A list of hosts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   host_id:
 *                     type: integer
 *                     description: Unique identifier of the host
 *                   host_name:
 *                     type: string
 *                     description: Name of the host
 *                   response_time:
 *                     type: string
 *                     description: Typical response time of the host
 *                   response_rate:
 *                     type: number
 *                     format: float
 *                     description: Host response rate percentage
 *                   acceptance_rate:
 *                     type: number
 *                     format: float
 *                     description: Host acceptance rate percentage
 *                   is_superhost:
 *                     type: boolean
 *                     description: Whether the host is a superhost
 *                   total_listings_count:
 *                     type: number
 *                     format: float
 *                     description: Total number of listings this host has
 *                   identity_verified:
 *                     type: boolean
 *                     description: Whether the host's identity is verified
 *                   listings_count_entire_homes:
 *                     type: integer
 *                     description: Number of entire home/apt listings
 *                   listings_count_private_rooms:
 *                     type: integer
 *                     description: Number of private room listings
 *                   listings_count_shared_rooms:
 *                     type: integer
 *                     description: Number of shared room listings
 *                   years_experience:
 *                     type: number
 *                     format: float
 *                     description: Years of experience as a host
 *       400:
 *         description: Invalid pagination parameters
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
// Route: GET /hosts
const getHosts = wrapAsync(async function (req, res) {
  // Validate pagination parameters
  const pagination = validatePagination(req.query, res);
  if (!pagination) return; // Validation failed, response already sent

  const { page, pageSize, offset } = pagination;

  // Get paginated host information
  connection.query(
    `
    SELECT *
    FROM host
    ORDER BY id
    LIMIT $1
    OFFSET $2
  `,
    [pageSize, offset],
    (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Database error. Please try again later." });
      } else {
        res.json(data.rows || []);
      }
    }
  );
});

/**
 * @swagger
 * /hosts/experienced:
 *   get:
 *     summary: Get experienced hosts
 *     description: Shows the hosts with the longest presence on the platform within the dataset
 *     tags:
 *       - Hosts
 *     responses:
 *       200:
 *         description: List of experienced hosts sorted by years of experience
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   host_id:
 *                     type: integer
 *                     description: Unique identifier of the host
 *                   host_name:
 *                     type: string
 *                     description: Name of the host
 *                   experience:
 *                     type: integer
 *                     description: Years of experience as a host (rounded)
 *                   total_listings_count:
 *                     type: integer
 *                     description: Total number of listings this host has
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
// Query 2
// Route: GET /hosts/experienced
// Shows the hosts with the longest presence on the platform within the dataset.
const getExperiencedHosts = wrapAsync(async function (req, res) {
  connection.query(
    `
    SELECT
        host_id,
        host_name,
        ROUND(years_experience) AS experience,
        total_listings_count
    FROM
        host
    ORDER BY
        years_experience DESC
    LIMIT 10;
  `,
    (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Database error. Please try again later." });
      } else {
        res.json(data.rows || []);
      }
    }
  );
});

/**
 * @swagger
 * /hosts/types:
 *   get:
 *     summary: Compare metrics between Superhosts and non-Superhosts
 *     description: Compares key performance metrics between listings managed by Superhosts and non-Superhosts within each neighborhood
 *     tags:
 *       - Hosts
 *       - Analytics
 *     responses:
 *       200:
 *         description: Comparison of metrics between Superhosts and non-Superhosts by neighborhood
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
 *                   host_type:
 *                     type: string
 *                     enum: [Superhost, Non-Superhost]
 *                     description: Type of host
 *                   avg_rating:
 *                     type: number
 *                     format: float
 *                     description: Average rating for this host type in the neighborhood
 *                   avg_reviews_per_month:
 *                     type: number
 *                     format: float
 *                     description: Average reviews per month for this host type
 *                   avg_price:
 *                     type: number
 *                     format: float
 *                     description: Average price for listings of this host type
 *                   num_listings:
 *                     type: integer
 *                     description: Number of listings for this host type in the neighborhood
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
// Query 4
// Route: GET /hosts/types
// Compares key performance metrics between listings managed by Superhosts and
// non-Superhosts within each neighborhood.
const getHostTypes = wrapAsync(async function (req, res) {
  connection.query(
    `
WITH NeighbourhoodHostStats AS (
    SELECT
        l.neighbourhood_cleansed,
        h.is_superhost,
        ROUND(AVG(ri.scores_rating::NUMERIC), 2) AS avg_rating,
        ROUND(AVG(ri.reviews_per_month::NUMERIC), 2) AS avg_reviews_per_month,
        ROUND(AVG(l.price::NUMERIC), 2) AS avg_price,
        COUNT(DISTINCT l.id) AS num_listings
    FROM
        listings l
            JOIN
        host h ON l.host_id = h.host_id
JOIN
        review_info ri ON l.id = ri.id
    WHERE
        h.is_superhost IS NOT NULL
      AND ri.scores_rating IS NOT NULL
      AND ri.reviews_per_month IS NOT NULL
    GROUP BY
        l.neighbourhood_cleansed,
        h.is_superhost
),
     NeighbourhoodSuperhostCount AS (
         SELECT
             neighbourhood_cleansed,
             COUNT(DISTINCT is_superhost) AS distinct_host_types
         FROM
             NeighbourhoodHostStats
         GROUP BY
             neighbourhood_cleansed
     )
SELECT
    nhs.neighbourhood_cleansed,
    CASE WHEN nhs.is_superhost THEN 'Superhost' ELSE 'Non-Superhost' END AS host_type,
    nhs.avg_rating,
    nhs.avg_reviews_per_month,
    nhs.avg_price,
    nhs.num_listings
FROM
    NeighbourhoodHostStats nhs
        JOIN
    NeighbourhoodSuperhostCount nsc ON nhs.neighbourhood_cleansed = nsc.neighbourhood_cleansed
WHERE
    nsc.distinct_host_types = 2
ORDER BY
    nhs.neighbourhood_cleansed,
    nhs.is_superhost DESC;
  `,
    (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Database error. Please try again later." });
      } else {
        res.json(data.rows || []);
      }
    }
  );
});

/**
 * @swagger
 * /hosts/interactions:
 *   get:
 *     summary: Compare metrics based on host interaction quality
 *     description: Compares listings with hosts known for good interaction versus other hosts by neighborhood and bedroom count
 *     tags:
 *       - Hosts
 *       - Analytics
 *     responses:
 *       200:
 *         description: Comparison of metrics between hosts with good interaction and others
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
 *                   bedrooms:
 *                     type: number
 *                     format: float
 *                     description: Number of bedrooms
 *                   avg_rating_good_interaction_hosts:
 *                     type: number
 *                     format: float
 *                     description: Average rating for hosts with good interaction
 *                   avg_price_good_interaction_hosts:
 *                     type: number
 *                     format: float
 *                     description: Average price for listings with hosts with good interaction
 *                   count_listings_good_interaction_hosts:
 *                     type: integer
 *                     description: Count of listings with hosts with good interaction
 *                   avg_rating_other_hosts:
 *                     type: number
 *                     format: float
 *                     description: Average rating for other hosts
 *                   avg_price_other_hosts:
 *                     type: number
 *                     format: float
 *                     description: Average price for listings with other hosts
 *                   count_listings_other_hosts:
 *                     type: integer
 *                     description: Count of listings with other hosts
 *       400:
 *         description: Invalid pagination parameters
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
// Query 5
// Route: GET /hosts/interactions
const getHostInteractions = wrapAsync(async function (req, res) {

  connection.query(
    `
      WITH HostsWithGoodInteraction AS (
          SELECT DISTINCT
            l_sub.host_id
          FROM
              reviews r_sub
                  JOIN
              listings l_sub ON r_sub.listing_id = l_sub.id
          WHERE
              r_sub.sentiment = 'Positive'
            AND (r_sub.comments ILIKE '%communication%' OR
                r_sub.comments ILIKE '%responsive%' OR
                r_sub.comments ILIKE '%check-in%' OR
                r_sub.comments ILIKE '%helpful%')
          GROUP BY
              l_sub.host_id
          HAVING
              COUNT(r_sub.id) > 5
      )
              
      SELECT
          l.neighbourhood_cleansed,
          l.bedrooms,
          ROUND(AVG(ri.scores_rating::NUMERIC) FILTER (WHERE hgi.host_id IS NOT NULL), 2) AS avg_rating_good_interaction_hosts,
          ROUND(AVG(l.price::NUMERIC) FILTER (WHERE hgi.host_id IS NOT NULL), 2) AS avg_price_good_interaction_hosts,
          COUNT(DISTINCT l.id) FILTER (WHERE hgi.host_id IS NOT NULL) AS count_listings_good_interaction_hosts,

          ROUND(AVG(ri.scores_rating::NUMERIC) FILTER (WHERE hgi.host_id IS NULL), 2) AS avg_rating_other_hosts,
          ROUND(AVG(l.price::NUMERIC) FILTER (WHERE hgi.host_id IS NULL), 2) AS avg_price_other_hosts,
          COUNT(DISTINCT l.id) FILTER (WHERE hgi.host_id IS NULL) AS count_listings_other_hosts
      FROM
          listings l
              JOIN
          review_info ri ON l.id = ri.id
              LEFT JOIN
              HostsWithGoodInteraction hgi ON l.host_id = hgi.host_id
      WHERE
          l.bedrooms IS NOT NULL AND ri.scores_rating IS NOT NULL
      GROUP BY
          l.neighbourhood_cleansed,
          l.bedrooms
      HAVING 
        COUNT(DISTINCT l.id) FILTER (WHERE hgi.host_id IS NOT NULL) > 0
        AND COUNT(DISTINCT l.id) FILTER (WHERE hgi.host_id IS NULL) > 0
      ORDER BY
          l.neighbourhood_cleansed,
          l.bedrooms
  `,
    (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Database error. Please try again later." });
      } else {
        res.json(data.rows || []);
      }
    }
  );
});

/**
 * @swagger
 * /hosts/verified:
 *   get:
 *     summary: Get hosts' identity verification stats
 *     description: Shows statistics about hosts' identity verification status
 *     tags:
 *       - Hosts
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: only_verified
 *         schema:
 *           type: boolean
 *         description: If true, only show stats for verified hosts (default is false)
 *         example: true
 *     responses:
 *       200:
 *         description: Statistics about hosts' identity verification
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   identity_verified:
 *                     type: boolean
 *                     description: Whether the identity is verified
 *                     example: true
 *                   number_of_hosts:
 *                     type: integer
 *                     description: Number of hosts with this verification status
 *                     example: 1256
 *                   percentage_of_total:
 *                     type: number
 *                     format: float
 *                     description: Percentage of total hosts with this verification status
 *                     example: 65.23
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Only verified parameter invalid: Must be a boolean"
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
// Query 6
// Route: GET /hosts/verified
const getHostVerified = wrapAsync(async function (req, res) {
  // Validate only_verified parameter
  const onlyVerifiedValidation = validateParam(
    req.query.only_verified,
    "boolean"
  );
  if (req.query.only_verified && !onlyVerifiedValidation.isValid) {
    return res
      .status(400)
      .json({
        error: `Only verified parameter invalid: ${onlyVerifiedValidation.message}`,
      });
  }

  const only_verified =
    req.query.only_verified === "true" || req.query.only_verified === "1";

  connection.query(
    `
SELECT
    identity_verified,
    COUNT(host_id) AS number_of_hosts,
    ROUND(COUNT(host_id) * 100.0 / (SELECT COUNT(*) FROM host), 2) AS percentage_of_total
FROM
    host
GROUP BY
    identity_verified
${only_verified ? `HAVING identity_verified = 't'` : ""}
ORDER BY
    number_of_hosts DESC;
`,
    (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Database error. Please try again later." });
      } else {
        res.json(data.rows || []);
      }
    }
  );
});

/**
 * @swagger
 * /hosts/high-performers:
 *   get:
 *     summary: Get high-performing hosts
 *     description: Returns hosts with a minimum number of listings and high ratings
 *     tags:
 *       - Hosts
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: min_listings
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Minimum number of listings a host must have (default is 3)
 *         example: 5
 *       - in: query
 *         name: min_rating
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating a host's listings must have (default is 4.7)
 *         example: 4.8
 *       - in: query
 *         name: order_by
 *         schema:
 *           type: string
 *           enum: [host_name, total_listings_count, average_value_score_across_listings, min_listing_rating]
 *         description: Field to order the results by
 *         example: "total_listings_count"
 *     responses:
 *       200:
 *         description: List of high-performing hosts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   host_id:
 *                     type: integer
 *                     description: Unique identifier of the host
 *                     example: 12345
 *                   host_name:
 *                     type: string
 *                     description: Name of the host
 *                     example: "John Smith"
 *                   total_listings_count:
 *                     type: integer
 *                     description: Total number of listings this host has
 *                     example: 8
 *                   average_value_score_across_listings:
 *                     type: number
 *                     format: float
 *                     description: Average value score across all listings for this host
 *                     example: 4.85
 *                   min_listing_rating:
 *                     type: number
 *                     format: float
 *                     description: Minimum rating among all listings for this host
 *                     example: 4.7
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Minimum listings parameter invalid: Must be at least 1"
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
// Query 10
// Route: GET /hosts/high-performers
// Finds hosts who consistently deliver high-quality experiences across their entire portfolio
const getHighPerformerHosts = wrapAsync(async function (req, res) {

  // Validate pagination parameters
  const pagination = validatePagination(req.query, res);
  if (!pagination) return; // Validation failed, response already sent
  const { page, pageSize, offset } = pagination;
  // Validate parameters
  const minListingsValidation = validateParam(
    req.query.min_listings,
    "number",
    { min: 1 }
  );
  if (req.query.min_listings && !minListingsValidation.isValid) {
    return res
      .status(400)
      .json({
        error: `Minimum listings parameter invalid: ${minListingsValidation.message}`,
      });
  }

  const minRatingValidation = validateParam(req.query.min_rating, "number", {
    min: 1,
    max: 5,
  });
  if (req.query.min_rating && !minRatingValidation.isValid) {
    return res
      .status(400)
      .json({
        error: `Minimum rating parameter invalid: ${minRatingValidation.message}`,
      });
  }

  // Validate order_by parameter
  const validOrderByValues = [
    "host_name",
    "total_listings_count",
    "average_value_score_across_listings",
    "min_listing_rating",
  ];
  if (req.query.order_by && !validOrderByValues.includes(req.query.order_by)) {
    return res.status(400).json({
      error: `Order by parameter invalid: must be one of ${validOrderByValues.join(
        ", "
      )}`,
    });
  }

  const min_listings = req.query.min_listings
    ? parseFloat(req.query.min_listings)
    : 3;
  const min_rating = req.query.min_rating
    ? parseFloat(req.query.min_rating)
    : 4.7;
  const order_by = req.query.order_by;

  let orderClause;
  switch (order_by) {
    case "host_name":
      orderClause = "ORDER BY h.host_name";
      break;
    case "total_listings_count":
      orderClause = "ORDER BY h.total_listings_count DESC";
      break;
    case "average_value_score_across_listings":
      orderClause = "ORDER BY average_value_score_across_listings DESC";
      break;
    case "min_listing_rating":
      orderClause = "ORDER BY min_listing_rating DESC";
      break;
    default:
      orderClause = "ORDER BY h.host_id";
  }

  connection.query(
    `
WITH HostMinRating AS (
    SELECT
        l.host_id,
        MIN(ri.scores_rating) AS min_listing_rating
    FROM listings l
             JOIN review_info ri ON l.id = ri.id
    WHERE ri.scores_rating IS NOT NULL
    GROUP BY l.host_id
),
     HostAvgValue AS (
         SELECT
             l.host_id,
             AVG(ri.scores_value) AS avg_value_score
         FROM listings l
                  JOIN review_info ri ON l.id = ri.id
         WHERE ri.scores_value IS NOT NULL
         GROUP BY l.host_id
     )
SELECT
    h.host_id,
    h.host_name,
    h.total_listings_count,
    ROUND(hav.avg_value_score::NUMERIC, 2) AS average_value_score_across_listings,
    hmr.min_listing_rating
FROM
    host h
        JOIN
    HostMinRating hmr ON h.host_id = hmr.host_id
        JOIN
    HostAvgValue hav ON h.host_id = hav.host_id
WHERE
    h.total_listings_count > $1
  AND hmr.min_listing_rating > $2
  AND hav.avg_value_score > $3
${orderClause}
LIMIT $4
OFFSET $5;
`,
    [min_listings, min_rating, min_rating, pageSize, offset],
    (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Database error. Please try again later." });
      } else {
        res.json(data.rows || []);
      }
    }
  );
});

module.exports = {
  getHosts,
  getExperiencedHosts,
  getHostTypes,
  getHostInteractions,
  getHostVerified,
  getHighPerformerHosts,
};
