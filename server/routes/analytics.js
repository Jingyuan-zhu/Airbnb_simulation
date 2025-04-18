const connection = require('./db');

// Query 1
// Route: GET /analytics/overview
// Shows the average cost and density of listings across different
// London neighborhoods. Useful for the market overview and map page.
const getOverview = async function (req, res) {
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
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Query 3
// Route: GET /analytics/room_types
// Provides a basic understanding of the types of accommodations available
// (e.g., Entire home/apt, Private room), for the initial homepage statistics.
const getRoomTypes = async function (req, res) {
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
        res.json({});
      } else {
        res.json(data.rows);
      }
    }
  );
};

// Query 7
// Route: GET /analytics/room_type_sentiment
// Summarizes the proportion of listings by room type that typically receive positive feedback.
const getRoomTypeSentiment = async function (req, res) {
  const room_type = req.query.room_type;

  connection.query(
    `
SELECT
    l.room_type_simple AS room_type,
    ROUND(AVG(CASE r.sentiment WHEN 'Positive' THEN 1 ELSE 0 END) * 100, 2) AS percent_positive_reviews,
    COUNT(DISTINCT l.id) AS number_of_listings
FROM listings l
         JOIN reviews r ON l.id = r.listing_id
GROUP BY l.room_type_simple
${room_type ? `HAVING l.room_type_simple = '${room_type}'` : ""}
ORDER BY percent_positive_reviews DESC;
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

// Query 8
// Route: GET /analytics/monthly_price
// Provides an estimated trend of average listing prices over time, grouped by the month and year reviews were left.
const getMonthlyPrice = async function (req, res) {
  const after = req.query.after ?? "1900-01-01";
  const before = req.query.before ?? "2100-01-01";

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
    HAVING review_month BETWEEN '${after}' AND '${before}'
ORDER BY
    review_month;
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

// Query 9
// Route: GET /analytics/hidden_gems
// Find highly rated, high-value listings with relatively few reviews and low price compared to neighbourhood norms.
const getHiddenGems = async function (req, res) {
  const min_rating = req.query.min_rating ?? 4.8;
  // const max_reviews = req.query.max_reviews;

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
    ri.scores_rating > ${min_rating}
  AND ri.scores_value > ${min_rating}
  AND ri.number_of_reviews IS NOT NULL
  AND l.price IS NOT NULL
  AND ri.number_of_reviews < nra.avg_reviews
  AND l.price < na.avg_price_for_room_type
ORDER BY
    l.neighbourhood_cleansed, l.room_type_simple, ri.scores_rating DESC;
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
  getOverview,
  getRoomTypes,
  getRoomTypeSentiment,
  getMonthlyPrice,
  getHiddenGems
};