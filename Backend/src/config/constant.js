import "dotenv/config";

export default {
  PORT: process.env.PORT || 3000,
  DB_LOCAL: process.env.DB_LOCAL,
  DB_URL: process.env.DB_URL,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};
