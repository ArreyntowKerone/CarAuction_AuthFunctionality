const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Post = sequelize.define(
    'Post',
    {
      postID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Title is required',
          },
          notEmpty: {
            msg: 'Title cannot be empty',
          },
        },
        trim: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Description is required',
          },
          notEmpty: {
            msg: 'Description cannot be empty',
          },
        },
        trim: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Customer', // References the Customer table
          key: 'customerID',
        },
        validate: {
          notNull: {
            msg: 'User ID is required',
          },
        },
      },
    },
    {
      tableName: 'Post',
      timestamps: true,
    }
  );

  // Define association (optional, but recommended for clarity)
  Post.associate = (models) => {
    Post.belongsTo(models.Customer, {
      foreignKey: 'userId',
      as: 'customer',
    });
  };

  return Post;
};