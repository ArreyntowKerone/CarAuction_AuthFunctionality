const Joi = require('joi');

const signupSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Must be a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required',
    }),
  phoneNumber: Joi.string()
    .max(20)
    .allow(null, '')
    .messages({
      'string.max': 'Phone number must not exceed 20 characters',
    }),
  address: Joi.string()
    .allow(null, '')
    .messages({
      'string.base': 'Address must be a string',
    }),
  profileImage: Joi.string()
    .max(255)
    .allow(null, '')
    .pattern(/^\/images\/profiles\/.+$/)
    .messages({
      'string.max': 'Profile image URL must not exceed 255 characters',
      'string.pattern.base': 'Profile image must be a valid URL path (e.g., /images/profiles/filename.jpg)',
    }),
});

const adminloginSchema = Joi.object({
    name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({ 'any.required': 'Email is required' }),
    password: Joi.string().required().messages({ 'any.required': 'Password is required' }),
  });

  const signinSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Must be a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
      }),
    /*name: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required',
      }),
    phoneNumber: Joi.string()
      .max(20)
      .allow(null, '')
      .messages({
        'string.max': 'Phone number must not exceed 20 characters',
      }),
    address: Joi.string()
      .allow(null, '')
      .messages({
        'string.base': 'Address must be a string',
      }),
    profileImage: Joi.string()
      .max(255)
      .allow(null, '')
      .pattern(/^\/images\/profiles\/.+$/)
      .messages({
        'string.max': 'Profile image URL must not exceed 255 characters',
        'string.pattern.base': 'Profile image must be a valid URL path (e.g., /images/profiles/filename.jpg)',
      }),*/
  });
  const verificationSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'any.required': 'Email is required' }),
  });

  const acceptCodeSchema = Joi.object({
	email: Joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net'] },
		}),
	providedCode: Joi.number().required(),
});

const changePasswordSchema = Joi.object({
	newPassword: Joi.string()
		.required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
	oldPassword: Joi.string().required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});

const acceptFPCodeSchema = Joi.object({
	email: Joi.string()
		.min(6)
		.max(60)
		.required()
		.email({
			tlds: { allow: ['com', 'net'] },
		}),
	providedCode: Joi.number().required(),
	newPassword: Joi.string().required()
		.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{8,}$')),
});


module.exports = {acceptFPCodeSchema, changePasswordSchema, signupSchema, adminloginSchema, signinSchema, verificationSchema, acceptCodeSchema };