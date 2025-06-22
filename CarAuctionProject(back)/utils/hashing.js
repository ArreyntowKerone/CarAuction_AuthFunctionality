const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const doHash = async (password, saltRounds) => {
  return bcrypt.hash(password, saltRounds);
};

const compareHash = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const hmacProcess = (data, secret) => {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  };

module.exports = { doHash, compareHash, hmacProcess };