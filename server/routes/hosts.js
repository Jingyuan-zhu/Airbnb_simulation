const connection = require('./db');

// Route: GET /hosts
const getHosts = async function (req, res) {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
  const offset = (page - 1) * pageSize;

  // Get paginated host information
  connection.query(
    `
    SELECT *
    FROM host
    ORDER BY id
    LIMIT ${pageSize}
    OFFSET ${offset}
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

// Query 2
// Route: GET /hosts/experienced
// Shows the hosts with the longest presence on the platform within the dataset.
// Could correlate with reliability or listing quality.
const getExperiencedHosts = async function (req, res) {
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
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Query 4
// Route: GET /hosts/types
// Compares key performance metrics between listings managed by Superhosts and
// non-Superhosts within each neighborhood that has both types of hosts.
const getHostTypes = async function (req, res) {
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
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Query 5
// Route: GET /hosts/interactions
// Identify listings from hosts who frequently receive positive comments mentioning
// specific interaction keywords (like 'communication', 'responsive', 'check-in', 'helpful') and
// compare their average rating and price against the neighborhood average for the same number of bedrooms.
const getHostInteractions = async function (req, res) {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
  const offset = (page - 1) * pageSize;
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
LIMIT ${pageSize}
OFFSET ${offset};
  `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Query 6
// Route: GET /hosts/verified
// Shows the number and percentage of hosts based on whether their identity is verified.
const getHostVerified = async function (req, res) {
  const only_verfied = req.query.only_verified ?? false;
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
${only_verfied ? `HAVING identity_verified = 't'` : ""}
ORDER BY
    number_of_hosts DESC;
`,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Query 10
// Route: GET /analytics/high-performers
// Finds hosts who consistently deliver high-quality experiences across their entire portfolio
const getHighPerformerHosts = async function (req, res) {
  const min_listings = req.query.min_listings ?? 3;
  const min_rating = req.query.min_rating ?? 4.7;
  const order_by = req.query.order_by;

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
    h.total_listings_count > ${min_listings}
  AND hmr.min_listing_rating > ${min_rating}
  AND hav.avg_value_score > ${min_rating}
${(() => {
  switch (order_by) {
    case "host_name":
      return "ORDER BY h.host_name";
    case "total_listings_count":
      return "ORDER BY h.total_listings_count DESC";
    case "average_value_score_across_listings":
      return "ORDER BY average_value_score_across_listings DESC";
    case "min_listing_rating":
      return "ORDER BY min_listing_rating DESC";
    default:
      return "ORDER BY h.host_id";
  }
})()};
`,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

module.exports = {
  getHosts,
  getExperiencedHosts,
  getHostTypes,
  getHostInteractions,
  getHostVerified,
  getHighPerformerHosts
};