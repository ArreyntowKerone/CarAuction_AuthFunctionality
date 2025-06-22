const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    customerID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Name is required'
        },
        notEmpty: {
          msg: 'Name cannot be empty'
        }
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: {
        msg: 'Email must be unique'
      },
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Email is required'
        },
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required'
        },
        notEmpty: {
          msg: 'Password cannot be empty'
        }
      }
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        is: {
          args: /^\/images\/profiles\/.+$/i, // Optional: Validate that it starts with /images/profiles/
          msg: 'Profile image must be a valid URL path (e.g., /images/profiles/filename.jpg)'
        }
      }
    },
    verified: {
			type: Boolean,
			default: false,
		},
    verificationCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    verificationCodeValidation: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    forgotPasswordCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    forgotPasswordCodeValidation: {
      type: DataTypes.BIGINT,
      allowNull: true,
    }
  }, {
    tableName: 'Customer',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password', 'verificationCode', 'forgotPasswordCode', 'verificationCodeValidation', 'forgotPasswordCodeValidation'] }
    }
  });

  return Customer;
};