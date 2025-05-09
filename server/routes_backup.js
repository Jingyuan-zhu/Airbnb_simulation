const { Pool, types } = require("pg");
const config = require("./config.json");

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, (val) => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));

// Route: GET /home
const home = async function (req, res) {
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

// Route: GET /listings
const listings = async function (req, res) {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
  const offset = (page - 1) * pageSize;

  // Get paginated listings
  connection.query(
    `
    SELECT 
      id,
      name,
      neighbourhood_cleansed AS neighbourhood,
      room_type,
      price,
      number_of_reviews
    FROM listings
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

// Route: GET /listing/:listing_id
const listing = async function (req, res) {
  const listing_id = req.params.listing_id;

  // Get detailed information about a specific listing
  connection.query(
    `
    SELECT *
    FROM listings
    WHERE id = '${listing_id}'
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

// Route: GET /hosts
const hosts = async function (req, res) {
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

// Route: GET /reviews/:listing_id
const reviews = async function (req, res) {
  const listing_id = req.params.listing_id;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
  const offset = (page - 1) * pageSize;

  // Get reviews for a specific listing
  connection.query(
    `
    SELECT r.*
    FROM reviews r
    JOIN review_info ri ON r.id = ri.id
    WHERE ri.listing_id = '${listing_id}'
    ORDER BY r.date DESC
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

// Route: GET /neighbourhoods
const neighbourhoods = async function (req, res) {
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

// Route 0: GET /search_listings
const search_listings = async function (req, res) {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.page_size ? parseInt(req.query.page_size) : 10;
  const offset = (page - 1) * pageSize;

  const name = req.query.name ?? "";
  const neighbourhood = req.query.neighbourhood_cleansed ?? "";
  const roomType = req.query.room_type_simple ?? "";
  const description = req.query.description ?? "";
  const pictureUrl = req.query.picture_url ?? "";
  const latitudeLow = req.query.latitude_low ?? -90;
  const latitudeHigh = req.query.latitude_high ?? 90;
  const longitudeLow = req.query.longitude_low ?? -180;
  const longitudeHigh = req.query.longitude_high ?? 180;
  const accommodatesLow = req.query.accommodates_low ?? 1;
  const accommodatesHigh = req.query.accommodates_high ?? 100;
  const bathroomsLow = req.query.bathrooms_low ?? 0;
  const bathroomsHigh = req.query.bathrooms_high ?? 50;
  const bedroomsLow = req.query.bedrooms_low ?? 0;
  const bedroomsHigh = req.query.bedrooms_high ?? 50;
  const bedsLow = req.query.beds_low ?? 0;
  const bedsHigh = req.query.beds_high ?? 100;
  const priceLow = req.query.price_low ?? 0;
  const priceHigh = req.query.price_high ?? 100000;
  const hostIdLow = req.query.host_id_low ?? 0;
  const hostIdHigh = req.query.host_id_high ?? 999999999999;
  const idLow = req.query.id_low ?? 0;
  const idHigh = req.query.id_high ?? 999999999999;

  const query = `
    SELECT *
    FROM listings
    WHERE 
      name ILIKE $1
      AND description ILIKE $2
      AND picture_url ILIKE $3
      AND neighbourhood_cleansed ILIKE $4
      AND room_type_simple ILIKE $5
      AND latitude >= $6
      AND latitude <= $7
      AND longitude >= $8
      AND longitude <= $9
      AND accommodates >= $10
      AND accommodates <= $11
      AND bathrooms >= $12
      AND bathrooms <= $13
      AND bedrooms >= $14
      AND bedrooms <= $15
      AND beds >= $16
      AND beds <= $17
      AND price >= $18
      AND price <= $19
      AND host_id >= $20
      AND host_id <= $21
      AND id >= $22
      AND id <= $23
    ORDER BY name ASC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `;

  const params = [
    `%${name}%`,
    `%${description}%`,
    `%${pictureUrl}%`,
    `%${neighbourhood}%`,
    `%${roomType}%`,
    latitudeLow,
    latitudeHigh,
    longitudeLow,
    longitudeHigh,
    accommodatesLow,
    accommodatesHigh,
    bathroomsLow,
    bathroomsHigh,
    bedroomsLow,
    bedroomsHigh,
    bedsLow,
    bedsHigh,
    priceLow,
    priceHigh,
    hostIdLow,
    hostIdHigh,
    idLow,
    idHigh,
  ];

  connection.query(query, params, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.json(data.rows);
    }
  });
};

// Route 1: GET /overview
// Shows the average cost and density of listings across different
// London neighborhoods. Useful for the market overview and map page.
const overview = async function (req, res) {
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

// Route 2: GET /experienced
// Shows the hosts with the longest presence on the platform within the dataset.
// Could correlate with reliability or listing quality.
const experienced = async function (req, res) {
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

// Route 3: GET /types
// Provides a basic understanding of the types of accommodations available
// (e.g., Entire home/apt, Private room), for the initial homepage statistics.
const room_types = async function (req, res) {
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

// Route 4: GET /host_types
// Compares key performance metrics between listings managed by Superhosts and
// non-Superhosts within each neighborhood that has both types of hosts.
const host_types = async function (req, res) {
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

// Route 5: GET /host_interactions
// Identify listings from hosts who frequently receive positive comments mentioning
// specific interaction keywords (like 'communication', 'responsive', 'check-in', 'helpful') and
// compare their average rating and price against the neighborhood average for the same number of bedrooms.
const host_interactions = async function (req, res) {
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

// Route 6
// Shows the number and percentage of hosts based on whether their identity is verified.
const host_verified = async function (req, res) {
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

// Route 7
// Summarizes the proportion of listings by room type that typically receive positive feedback.
const room_type_sentiment = async function (req, res) {
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

// Route 8
// Provides an estimated trend of average listing prices over time, grouped by the month and year reviews were left.
const monthly_price = async function (req, res) {
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

//Route 9
// Find highly rated, high-value listings with relatively few reviews and low price compared to neighbourhood norms.
const hidden_gems = async function (req, res) {
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

// Route 10:
// Finds hosts who consistently deliver high-quality experiences across their entire portfolio
const high_performer_hosts = async function (req, res) {
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
  overview,
  experienced,
  room_types,
  host_types,
  host_interactions,
  search_listings,
  home,
  listings,
  listing,
  hosts,
  reviews,
  neighbourhoods,
  host_verified,
  room_type_sentiment,
  monthly_price,
  hidden_gems,
  high_performer_hosts,
};
