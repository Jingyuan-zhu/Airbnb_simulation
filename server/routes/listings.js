const { connection, validateParam, validatePagination, wrapAsync } = require("./db");

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Get paginated listings
 *     description: Returns a paginated list of Airbnb listings with basic information
 *     tags:
 *       - Listings
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
 *         description: A list of Airbnb listings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Unique identifier of the listing
 *                   name:
 *                     type: string
 *                     description: Name of the listing
 *                   neighbourhood:
 *                     type: string
 *                     description: Neighbourhood where the listing is located
 *                   room_type_simple:
 *                     type: string
 *                     description: Type of room (e.g., Entire home/apt, Private room)
 *                   price:
 *                     type: number
 *                     format: float
 *                     description: Price per night
 *                   number_of_reviews:
 *                     type: integer
 *                     description: Number of reviews for the listing
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
// Route: GET /listings
const getListings = wrapAsync(async function (req, res) {
  // Validate pagination parameters
  const pagination = validatePagination(req.query, res);
  if (!pagination) return; // Validation failed, response already sent

  const { page, pageSize, offset } = pagination;

  // Get paginated listings
  connection.query(
    `
    SELECT *
    FROM listings
    ORDER BY id
    LIMIT $1
    OFFSET $2
  `,
    [pageSize, offset],
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
 * /listings/{listing_id}:
 *   get:
 *     summary: Get a specific listing by ID
 *     description: Returns detailed information about a specific Airbnb listing
 *     tags:
 *       - Listings
 *     parameters:
 *       - in: path
 *         name: listing_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the listing
 *     responses:
 *       200:
 *         description: Detailed information about a listing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 host_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 picture_url:
 *                   type: string
 *                 neighbourhood_cleansed:
 *                   type: string
 *                 latitude:
 *                   type: number
 *                   format: float
 *                 longitude:
 *                   type: number
 *                   format: float
 *                 accommodates:
 *                   type: integer
 *                 bathrooms:
 *                   type: number
 *                   format: float
 *                 bedrooms:
 *                   type: number
 *                   format: float
 *                 beds:
 *                   type: number
 *                   format: float
 *                 price:
 *                   type: number
 *                   format: float
 *                 room_type_simple:
 *                   type: string
 *       400:
 *         description: Invalid listing ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Listing not found
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
// Route: GET /listings/:listing_id
const getListing = wrapAsync(async function (req, res) {
  const listingIdValidation = validateParam(req.params.listing_id, 'number', { required: true, min: 1 });
  if (!listingIdValidation.isValid) {
    return res.status(400).json({ error: `Listing ID invalid: ${listingIdValidation.message}` });
  }

  const listing_id = parseInt(req.params.listing_id);

  // Get detailed information about a specific listing using parameterized query
  connection.query(
    `
    SELECT *
    FROM listings
    WHERE id = $1
  `,
    [listing_id],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error. Please try again later." });
      } else if (!data.rows || data.rows.length === 0) {
        return res.status(404).json({ error: "Listing not found" });
      } else {
        res.json(data.rows[0]);
      }
    }
  );
});

/**
 * @swagger
 * /listings/search:
 *   get:
 *     summary: Search for listings with filters
 *     description: Returns listings matching the specified filters with pagination
 *     tags:
 *       - Listings
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
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by listing name (case-insensitive)
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filter by listing description (case-insensitive)
 *       - in: query
 *         name: picture_url
 *         schema:
 *           type: string
 *         description: Filter by picture URL (case-insensitive)
 *       - in: query
 *         name: neighbourhood_cleansed
 *         schema:
 *           type: string
 *         description: Filter by neighbourhood name (case-insensitive)
 *       - in: query
 *         name: room_type_simple
 *         schema:
 *           type: string
 *         description: Filter by room type (case-insensitive)
 *       - in: query
 *         name: latitude_low
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum latitude
 *       - in: query
 *         name: latitude_high
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum latitude
 *       - in: query
 *         name: longitude_low
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum longitude
 *       - in: query
 *         name: longitude_high
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum longitude
 *       - in: query
 *         name: accommodates_low
 *         schema:
 *           type: integer
 *         description: Minimum accommodates count
 *       - in: query
 *         name: accommodates_high
 *         schema:
 *           type: integer
 *         description: Maximum accommodates count
 *       - in: query
 *         name: bathrooms_low
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum bathrooms
 *       - in: query
 *         name: bathrooms_high
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum bathrooms
 *       - in: query
 *         name: bedrooms_low
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum bedrooms
 *       - in: query
 *         name: bedrooms_high
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum bedrooms
 *       - in: query
 *         name: beds_low
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum beds
 *       - in: query
 *         name: beds_high
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum beds
 *       - in: query
 *         name: price_low
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum price
 *       - in: query
 *         name: price_high
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: A list of listings matching the specified filters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   host_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   picture_url:
 *                     type: string
 *                   neighbourhood_cleansed:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                     format: float
 *                   longitude:
 *                     type: number
 *                     format: float
 *                   accommodates:
 *                     type: integer
 *                   bathrooms:
 *                     type: number
 *                     format: float
 *                   bedrooms:
 *                     type: number
 *                     format: float
 *                   beds:
 *                     type: number
 *                     format: float
 *                   price:
 *                     type: number
 *                     format: float
 *                   room_type_simple:
 *                     type: string
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
const searchListings = wrapAsync(async function (req, res) {
  // Validate pagination parameters
  const pagination = validatePagination(req.query, res);
  if (!pagination) return; // Validation failed, response already sent

  // Validate range parameters
  const rangeParams = [
    'latitude_low', 'latitude_high', 'longitude_low', 'longitude_high',
    'accommodates_low', 'accommodates_high', 'bathrooms_low', 'bathrooms_high',
    'bedrooms_low', 'bedrooms_high', 'beds_low', 'beds_high',
    'price_low', 'price_high',
  ];

  for (const param of rangeParams) {
    if (req.query[param]) {
      const validation = validateParam(req.query[param], 'number');
      if (!validation.isValid) {
        return res.status(400).json({ error: `Parameter ${param} invalid: ${validation.message}` });
      }
    }
  }

  // Extract pagination parameters
  const { page, pageSize, offset } = pagination;

  // Build dynamic WHERE clause and parameters
  let whereClause = [];
  let params = [];

  // Text search filters
  const textFilters = {
    name: req.query.name,
    description: req.query.description,
    picture_url: req.query.picture_url,
    neighbourhood_cleansed: req.query.neighbourhood_cleansed,
    room_type_simple: req.query.room_type_simple,
  };

  // Add text filters (ILIKE) if provided
  for (const [field, value] of Object.entries(textFilters)) {
    if (value) {
      whereClause.push(`${field} ILIKE $${params.length + 1}`);
      params.push(`%${value}%`);
    }
  }

  // Range filters
  const rangeFilters = {
    latitude: [req.query.latitude_low, req.query.latitude_high],
    longitude: [req.query.longitude_low, req.query.longitude_high],
    accommodates: [req.query.accommodates_low, req.query.accommodates_high],
    bathrooms: [req.query.bathrooms_low, req.query.bathrooms_high],
    bedrooms: [req.query.bedrooms_low, req.query.bedrooms_high],
    beds: [req.query.beds_low, req.query.beds_high],
    price: [req.query.price_low, req.query.price_high],
    host_id: [req.query.host_id_low, req.query.host_id_high],
    id: [req.query.id_low, req.query.id_high],
  };

  // Add range filters if exists
  for (const [field, [min, max]] of Object.entries(rangeFilters)) {
    if (min) {
      whereClause.push(`${field} >= $${params.length + 1}`);
      params.push(min);
    }

    if (max) {
      whereClause.push(`${field} <= $${params.length + 1}`);
      params.push(max);
    }
  }

  // Build the final query
  const whereString =
    whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

  const query = `
    SELECT *
    FROM listings
    ${whereString}
    ORDER BY name ASC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  // Add pagination parameters
  params.push(pageSize, offset);

  // Execute main query
  connection.query(query, params, (err, data) => {
    if (err) {
      console.error("Error searching listings:", err);
      return res.status(500).json({ error: "Database error. Please try again later." });
    }

    // Return results with pagination metadata
    res.json(data.rows || []);
  });
});

/**
 * @swagger
 * /listings/{listing_id}/reviews:
 *   get:
 *     summary: Get reviews for a specific listing
 *     description: Returns paginated reviews for a specific Airbnb listing
 *     tags:
 *       - Listings
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: listing_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier of the listing
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
 *         description: A list of reviews for the specified listing
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Unique identifier of the review
 *                   listing_id:
 *                     type: integer
 *                     description: ID of the listing this review belongs to
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Date the review was posted
 *                   reviewer_id:
 *                     type: integer
 *                     description: ID of the reviewer
 *                   reviewer_name:
 *                     type: string
 *                     description: Name of the reviewer
 *                   comments:
 *                     type: string
 *                     description: Review text
 *                   sentiment:
 *                     type: string
 *                     enum: [Positive, Neutral, Negative]
 *                     description: Sentiment analysis of the review
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
// Route: GET /listings/:listing_id/reviews
const getReviews = wrapAsync(async function (req, res) {
  // Validate listing_id parameter
  const listingIdValidation = validateParam(req.params.listing_id, 'number', { required: true, min: 1 });
  if (!listingIdValidation.isValid) {
    return res.status(400).json({ error: `Listing ID invalid: ${listingIdValidation.message}` });
  }

  // Validate pagination parameters
  const pagination = validatePagination(req.query, res);
  if (!pagination) return; // Validation failed, response already sent

  const listing_id = parseInt(req.params.listing_id);
  const { page, pageSize, offset } = pagination;

  // Get reviews for a specific listing
  connection.query(
    `
    SELECT r.*
    FROM reviews r
    JOIN review_info ri ON r.id = ri.id
    WHERE ri.listing_id = $1
    ORDER BY r.date DESC
    LIMIT $2
    OFFSET $3
  `,
    [listing_id, pageSize, offset],
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
 * /listings/map:
 *   get:
 *     summary: Get listings for map display
 *     description: Returns listings with coordinates and essential information for map display
 *     tags:
 *       - Listings
 *     parameters:
 *       - in: query
 *         name: lat_min
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum latitude for bounding box
 *       - in: query
 *         name: lat_max
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum latitude for bounding box
 *       - in: query
 *         name: lng_min
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum longitude for bounding box
 *       - in: query
 *         name: lng_max
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum longitude for bounding box
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Maximum number of listings to return (default is 500, max 1000)
 *     responses:
 *       200:
 *         description: A list of listings for map display
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                     format: float
 *                   longitude:
 *                     type: number
 *                     format: float
 *                   price:
 *                     type: number
 *                     format: float
 *                   room_type_simple:
 *                     type: string
 *                   picture_url:
 *                     type: string
 *                   neighbourhood_cleansed:
 *                     type: string
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Database error
 */
const getMapListings = wrapAsync(async function (req, res) {
  // Parse and validate query parameters
  const latMin = req.query.lat_min ? parseFloat(req.query.lat_min) : null;
  const latMax = req.query.lat_max ? parseFloat(req.query.lat_max) : null;
  const lngMin = req.query.lng_min ? parseFloat(req.query.lng_min) : null;
  const lngMax = req.query.lng_max ? parseFloat(req.query.lng_max) : null;
  const priceLow = req.query.price_low ? parseFloat(req.query.price_low) : null;
  const priceHigh = req.query.price_high ? parseFloat(req.query.price_high) : null;
  const neightbourhood = req.query.neighbourhood || null;
  const limit = req.query.limit ? parseInt(req.query.limit) : 500;
  
  // Validate limit
  if (isNaN(limit) || limit < 1 || limit > 1000) {
    return res.status(400).json({ error: "Invalid limit parameter. Must be between 1 and 1000." });
  }
  
  // Validate coordinates if provided
  if ((latMin !== null && isNaN(latMin)) || 
      (latMax !== null && isNaN(latMax)) ||
      (lngMin !== null && isNaN(lngMin)) ||
      (lngMax !== null && isNaN(lngMax))) {
    return res.status(400).json({ error: "Invalid coordinate parameters." });
  }
  
  // Build WHERE clause for bounding box, if coordinates are provided
  let whereClause = '';
  const params = [];
  
  if (latMin !== null && latMax !== null && lngMin !== null && lngMax !== null) {
    whereClause = 'WHERE latitude >= $1 AND latitude <= $2 AND longitude >= $3 AND longitude <= $4';
    params.push(latMin, latMax, lngMin, lngMax);
  }
  
  // Build query
  const query = `
    SELECT 
      l.id, 
      l.name, 
      l.latitude, 
      l.longitude, 
      l.price, 
      l.room_type_simple,
      l.picture_url,
      l.neighbourhood_cleansed,
      l.accommodates,
      l.bedrooms,
      l.beds,
      ri.scores_rating
    FROM 
      listings l
    LEFT JOIN 
      review_info ri ON l.id = ri.id
    ${whereClause}
    ORDER BY 
      ri.scores_rating DESC NULLS LAST
    LIMIT $${params.length + 1}
  `;
  
  params.push(limit);
  
  // Execute query
  connection.query(query, params, (err, data) => {
    if (err) {
      console.error("Error fetching map listings:", err);
      return res.status(500).json({ error: "Database error. Please try again later." });
    }
    
    res.json(data.rows || []);
  });
});

module.exports = {
  getListings,
  getListing,
  searchListings,
  getReviews,
  getMapListings
};