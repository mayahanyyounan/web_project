const Community = require('../models/Community');

module.exports = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.moderatorId.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only the moderator can do this' });
    }

    // Pass the community on so the controller doesn't load it again
    req.community = community;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};