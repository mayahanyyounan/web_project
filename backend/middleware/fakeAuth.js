// TEMPORARY: replace with Member 1's real auth middleware later
const mongoose = require('mongoose');

// One fixed fake user id, so every request acts as the same person
const FAKE_USER_ID = '650000000000000000000001';

module.exports = (req, res, next) => {
  req.user = { id: new mongoose.Types.ObjectId(FAKE_USER_ID) };
  next();
};