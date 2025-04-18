const connection = require('./db');

// Route: GET /listings
const getListings = async function (req, res) {
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
const getListing = async function (req, res) {
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

// Route: GET /search_listings
const searchListings = async function (req, res) {
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

// Route: GET /reviews/:listing_id
const getReviews = async function (req, res) {
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

module.exports = {
  getListings,
  getListing,
  searchListings,
  getReviews
};