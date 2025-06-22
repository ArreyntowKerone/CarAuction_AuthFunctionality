const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'gmail', //I will use this for now since it allows 500 emails sending per day
    auth: {
		user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
		pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
	},
});

module.exports = transport;

