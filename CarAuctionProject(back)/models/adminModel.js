const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    adminID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      required : [true, 'Name is required'], // Validation for required field
    },
    email: {
      type: DataTypes.STRING(100),
      unique: [true, 'Email must be unique'], 
      required : [true, 'Email is required'], // Validation for required field
      trim : true,
      lowercase : true
    },
    role: {
      type: DataTypes.STRING(50),
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        select : false, // Exclude from queries by default
    },
  }, {
    tableName: 'Admin', // Explicit table name
    timestamps: false,  // Disable createdAt/updatedAt if not needed
  });

  return Admin;
};