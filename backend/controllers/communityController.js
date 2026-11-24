const Community = require('../models/Community');
const Membership = require('../models/Membership');

// POST /api/communities
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const community = await Community.create({
      name,
      description,
      image,
      moderatorId: req.user.id
    });

    // The creator automatically joins
    await Membership.create({
      userId: req.user.id,
      communityId: community._id
    });

    res.status(201).json(community);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Community name already taken' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/communities/:name
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community
      .findOne({ name: req.params.name })
      .collation({ locale: 'en', strength: 2 });

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = !!(await Membership.exists({
      userId: req.user.id,
      communityId: community._id
    }));

    res.json({ ...community.toObject(), isMember });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// POST /api/communities/:id/join
exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    try {
      await Membership.create({
        userId: req.user.id,
        communityId: community._id
      });
    } catch (err) {
      if (err.code === 11000) {
        // Already a member: succeed without changing the count
        return res.json({ joined: true, memberCount: community.memberCount });
      }
      throw err;
    }

    // Only reached if the insert really happened
    const updated = await Community.findByIdAndUpdate(
      community._id,
      { $inc: { memberCount: 1 } },
      { new: true }
    );

    res.status(201).json({ joined: true, memberCount: updated.memberCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/communities/:id/join
exports.leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // The moderator can't leave, or the community would have no moderator
    if (community.moderatorId.equals(req.user.id)) {
      return res.status(400).json({ message: 'The moderator cannot leave their own community' });
    }

    const result = await Membership.deleteOne({
      userId: req.user.id,
      communityId: community._id
    });

    // Only decrease the count if a row was really deleted
    if (result.deletedCount === 1) {
      const updated = await Community.findByIdAndUpdate(
        community._id,
        { $inc: { memberCount: -1 } },
        { new: true }
      );
      return res.json({ joined: false, memberCount: updated.memberCount });
    }

    res.json({ joined: false, memberCount: community.memberCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
