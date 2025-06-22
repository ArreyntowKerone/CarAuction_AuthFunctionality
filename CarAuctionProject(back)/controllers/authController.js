const { changePasswordSchema, acceptFPCodeSchema, signupSchema, signinSchema, adminloginSchema,verificationSchema, acceptCodeSchema } = require('../middlewares/validator');
const { sequelize, models } = require('../utils/db');
const { Customer, Admin } = models;
const { doHash, compareHash, hmacProcess } = require('../utils/hashing');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const transport = require('../middlewares/sendMail');


// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/profiles/'); // Store files in this folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // e.g., .jpg, .png
    cb(null, `user-${uniqueSuffix}${ext}`); // e.g., user-1625234567890-123456789.jpg
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
  }
};

// Multer middleware for single file upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
}).single('profileImage'); // Field name in the form

exports.signup = async (req, res) => {
  // Handle file upload
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const { email, password, name, phoneNumber, address } = req.body;
    try {
      // Validate input using Joi
      const { error, value } = signupSchema.validate({
        email,
        password,
        name,
        phoneNumber,
        address,
        profileImage: req.file ? `/images/profiles/${req.file.filename}` : null // Use file path if uploaded
      });
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      // Check for existing customer
      const existingCustomer = await Customer.findOne({
        where: { email: value.email },
      });
      if (existingCustomer) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await doHash(value.password, 12);

      // Create new customer
      const newCustomer = await Customer.create({
        email: value.email,
        password: hashedPassword,
        name: value.name,
        phoneNumber: value.phoneNumber,
        address: value.address,
        profileImage: req.file ? `/images/profiles/${req.file.filename}` : null, // Store URL path
      });

      // Exclude password from response
      const { password: _, ...result } = newCustomer.toJSON();

      return res.status(201).json({ success: true, message: 'Account created successfully', user: result });
    } catch (error) {
      console.error('Error in signup:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { error, value } = adminloginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const admin = await Admin.scope(null).findOne({ where: { email: value.email } }); // Bypass defaultScope to include password
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isValidPassword = await compareHash(value.password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { password: _, ...result } = admin.toJSON();
    return res.status(200).json({ success: true, message: 'Admin login successful', admin: result });
  } catch (error) {
    console.error('Error in admin login:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

//User login
exports.customerLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const{ error, value } = signinSchema.validate({ email, password });
    if(error){
      return res.status(400).json({ success: false, message: error.message });
    }
    const existingCustomer = await Customer.scope(null).findOne({ where: { email: value.email } }); 
    if (!existingCustomer) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isValidPassword = await compareHash(value.password, existingCustomer.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials'});
    }
    const token = jwt.sign({
      userId: existingCustomer._id,
      email: existingCustomer.email,
      verified: existingCustomer.verified
    }, 
    process.env.TOKEN_SECRET, {
      expiresIn: '8h',
    }
  );

  res.cookie('Authorization', 'Bearer ' + token, {expires: new Date(Date.now() + 8 * 3600000),
     httpOnly: process.env.NODE_ENV == 'production',
      secure: process.env.NODE_ENV == 'production'}).json({
        success: true,
        token,
        message: 'logged in succesfully'
      });
  } catch (error) {
    console.error('Error in customer login:', error);
  }
}

//User signout
exports.customerSignout = async (req, res) => {
  res.clearCookie('Authorization')
  .status(200)
  .json({
    success: true,
    message: "Logged out successfuly"
  });
};

//Send Verification Code
exports.sendVerificationCode = async (req, res) => {
  try {
    const { error, value } = verificationSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    console.log('Sending verification code to:', value.email);
    const existingCustomer = await Customer.scope(null).findOne({ where: { email: value.email } });
    if (!existingCustomer) {
      console.log('Customer not found for email:', value.email);
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (existingCustomer.verified) {
      console.log('Customer already verified:', value.email);
      return res.status(400).json({ success: false, message: 'Customer already verified' });
    }

    // Generate a 6-digit verification code
    const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated code:', codeValue);

    // Send email
    const info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingCustomer.email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #333;">Car Auction Platform</h2>
          <p>Hello ${existingCustomer.name},</p>
          <p>Your verification code is:</p>
          <h1 style="background: #f0f0f0; padding: 10px; display: inline-block;">${codeValue}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn’t request this, please ignore this email.</p>
          <p>Best regards,<br>Car Auction Team</p>
        </div>
      `,
    });

    console.log('Email send info:', info);
    if (!info.accepted.includes(existingCustomer.email)) {
      console.log('Email not accepted:', info);
      return res.status(500).json({ success: false, message: 'Failed to send verification code' });
    }

    // Hash and store the code
    console.log('Hashing code...');
    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
    console.log('Hashed code:', hashedCodeValue);

    console.log('Updating customer...');
    await existingCustomer.update({
      verificationCode: hashedCodeValue,
      verificationCodeValidation: Date.now(),
    });
    console.log('Customer updated successfully');

    console.log('Sending success response');
    return res.status(200).json({ success: true, message: 'Code sent!' });
  } catch (error) {
    console.error('Error in sendVerificationCode:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verifyVerificationCode = async (req, res) => {
  try {
    const { error, value } = acceptCodeSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, providedCode } = value;
    console.log('Verifying code for email:', email);

    const existingCustomer = await Customer.scope(null).findOne({ where: { email } });
    if (!existingCustomer) {
      console.log('Customer not found for email:', email);
      return res.status(404).json({ success: false, message: 'Customer does not exist' });
    }

    if (existingCustomer.verified) {
      console.log('Customer already verified:', email);
      return res.status(400).json({ success: false, message: 'Customer is already verified' });
    }

    if (!existingCustomer.verificationCode || !existingCustomer.verificationCodeValidation) {
      console.log('No verification code found for:', email);
      return res.status(400).json({ success: false, message: 'No valid verification code found' });
    }

    if (Date.now() - existingCustomer.verificationCodeValidation > 10 * 60 * 1000) {
      console.log('Code expired for:', email);
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    const codeValue = providedCode.toString();
    console.log('Hashing provided code...');
    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
    console.log('Hashed provided code:', hashedCodeValue);

    if (hashedCodeValue !== existingCustomer.verificationCode) {
      console.log('Invalid code for:', email);
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    console.log('Updating customer as verified...');
    await existingCustomer.update({
      verified: true,
      verificationCode: null,
      verificationCodeValidation: null,
    });
    console.log('Customer verified successfully:', email);

    return res.status(200).json({ success: true, message: 'Your account has been verified' });
  } catch (error) {
    console.error('Error in verifyVerificationCode:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { userId, verified } = req.user;
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    if (!verified) {
      console.log('Unverified user attempted password change:', userId);
      return res.status(403).json({ success: false, message: 'You must be verified to change your password' });
    }

    console.log('Fetching customer:', userId);
    const existingCustomer = await Customer.scope(null).findOne({ where: { customerID: userId } });
    if (!existingCustomer) {
      console.log('Customer not found:', userId);
      return res.status(404).json({ success: false, message: 'Customer does not exist' });
    }

    console.log('Validating old password...');
    const isValidPassword = await compareHash(value.oldPassword, existingCustomer.password);
    if (!isValidPassword) {
      console.log('Invalid old password for:', userId);
      return res.status(401).json({ success: false, message: 'Invalid old password' });
    }

    console.log('Hashing new password...');
    const hashedPassword = await doHash(value.newPassword, 12);
    console.log('Updating password...');
    await existingCustomer.update({ password: hashedPassword });
    console.log('Password updated for:', userId);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in changePassword:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send Forgot Password Code
exports.sendForgotPasswordCode = async (req, res) => {
  try {
    const { error, value } = verificationSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    console.log('Sending forgot password code to:', value.email);
    const existingCustomer = await Customer.scope(null).findOne({ where: { email: value.email } });
    if (!existingCustomer) {
      console.log('Customer not found:', value.email);
      return res.status(404).json({ success: false, message: 'Customer does not exist' });
    }

    const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated code:', codeValue);

    console.log('Sending email via nodemailer...');
    const info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingCustomer.email,
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #333;">Car Auction Platform</h2>
          <p>Hello ${existingCustomer.name},</p>
          <p>Your password reset code is:</p>
          <h1 style="background: #f0f0f0; padding: 10px; display: inline-block;">${codeValue}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn’t request this, please ignore this email.</p>
          <p>Best regards,<br>Car Auction Team</p>
        </div>
      `,
    });

    console.log('Email send info:', JSON.stringify(info, null, 2));
    if (!info.accepted.includes(existingCustomer.email)) {
      console.log('Email not accepted:', info);
      return res.status(500).json({ success: false, message: 'Failed to send password reset code' });
    }

    console.log('Hashing code...');
    if (!process.env.HMAC_VERIFICATION_CODE_SECRET) {
      console.error('HMAC_VERIFICATION_CODE_SECRET is not set');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }
    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
    console.log('Hashed code:', hashedCodeValue);

    console.log('Updating customer...');
    await existingCustomer.update({
      forgotPasswordCode: hashedCodeValue,
      forgotPasswordCodeValidation: Date.now(),
    });
    console.log(existingCustomer.forgotPasswordCode);
    console.log(existingCustomer.forgotPasswordCodeValidation);
    console.log('Customer updated successfully');

    return res.status(200).json({ success: true, message: 'Password reset code sent' });
  } catch (error) {
    console.error('Error in sendForgotPasswordCode:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Verify Forgot Password Code
exports.verifyForgotPasswordCode = async (req, res) => {
  try {
    const { error, value } = acceptFPCodeSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, providedCode, newPassword } = value;
    console.log('Verifying forgot password code for:', email);

    const existingCustomer = await Customer.scope(null).findOne({ where: { email } });
    if (!existingCustomer) {
      console.log('Customer not found:', email);
      return res.status(404).json({ success: false, message: 'Customer does not exist' });
    }

    if (!existingCustomer.forgotPasswordCode || !existingCustomer.forgotPasswordCodeValidation) {
      console.log('No forgot password code found for:', email);
      return res.status(400).json({ success: false, message: 'No valid password reset code found' });
    }

    if (Date.now() - existingCustomer.forgotPasswordCodeValidation > 10 * 60 * 1000) {
      console.log('Code expired for:', email);
      return res.status(400).json({ success: false, message: 'Password reset code has expired' });
    }

    const codeValue = providedCode.toString();
    console.log('Hashing provided code...');
    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
    console.log('Hashed provided code:', hashedCodeValue);

    if (hashedCodeValue !== existingCustomer.forgotPasswordCode) {
      console.log('Invalid code for:', email);
      return res.status(400).json({ success: false, message: 'Invalid password reset code' });
    }

    console.log('Hashing new password...');
    const hashedPassword = await doHash(newPassword, 12);
    console.log('Updating customer...');
    await existingCustomer.update({
      password: hashedPassword,
      forgotPasswordCode: null,
      forgotPasswordCodeValidation: null,
    });
    console.log('Password reset successfully for:', email);

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in verifyForgotPasswordCode:', error.message, error.stack);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};