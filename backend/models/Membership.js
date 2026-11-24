const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true }
}, { timestamps: { createdAt: 'joinedAt', updatedAt: false } });

// A user can join a community only once
membershipSchema.index({ userId: 1, communityId: 1 }, { unique: true });
// Fast lookup of a community's members
membershipSchema.index({ communityId: 1 });

module.exports = mongoose.model('Membership', membershipSchema);