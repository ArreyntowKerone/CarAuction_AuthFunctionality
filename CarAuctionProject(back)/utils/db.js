const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log queries in development
    pool: {
      max: 5, // Max connections
      min: 0, // Min connections
      acquire: 30000, // Max time to acquire connection (ms)
      idle: 10000, // Max idle time (ms)
    },
  }
);

// Initialize models
const models = {
  Customer: require('../models/customerModel')(sequelize), // Adjust path to your customerModel.js
  Admin: require('../models/adminModel')(sequelize),
};

// Set up associations between models
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Debug: Verify Sequelize instance creation
console.log('Sequelize instance created?', !!sequelize); // Should log "true"

// Verify connection on startup
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ MySQL connection established!');
    // Sync database in development (optional)
    if (process.env.NODE_ENV === 'development') {
      sequelize
        .sync({ force: false }) // force: false ensures existing tables aren't dropped
        .then(() => {
          console.log('✅ Database & tables synced!');
        })
        .catch((err) => {
          console.error('❌ Error syncing database:', err.message);
        });
    }
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
    // Optionally exit process or handle failure gracefully
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1); // Exit in production if connection fails
    }
  });

// Export Sequelize instance and models
module.exports = {
  sequelize,
  models,
};