const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'tadd';
const JWT_EXPIRATION = '1h';

module.exports = { JWT_SECRET, JWT_EXPIRATION };
