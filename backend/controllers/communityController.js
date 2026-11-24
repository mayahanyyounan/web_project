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
