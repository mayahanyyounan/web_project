const Community = require('../models/Community');
const Membership = require('../models/Membership');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// POST /api/communities
exports.createCommunity = async (req, res) => {
  try {
    // 1. read name, description, image from req.body
    const { name, description, image } = req.body;
      // 2. create the community in the database (the moderator is the logged-in user)
    const community = await Community.create({name,description,image,moderatorId: req.user.id});
     // 3. make the creator join it automatically (create a Membership)
    await Membership.create({userId: req.user.id,communityId: community._id});

    res.status(201).json(community); //created ba3ato lel frontend
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

// GET /api/communities/:name  gets one community
exports.getCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name }).collation({ locale: 'en', strength: 2 });

    if (!community) {return res.status(404).json({ message: 'Community not found' }); }

    const isMember = !!(await Membership.exists({userId: req.user.id,communityId: community._id}));

    res.json({ ...community.toObject(), isMember });
  } 
  catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
   
// POST /api/communities/:id/join
exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {return res.status(404).json({ message: 'Community not found' });}

    try {
      await Membership.create({userId: req.user.id,communityId: community._id});
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
    if (!community) {return res.status(404).json({ message: 'Community not found' });}

    // The moderator can't leave, or the community would have no moderator
    if (community.moderatorId.equals(req.user.id)) {
      return res.status(400).json({ message: 'The moderator cannot leave their own community' });
    }

    const result = await Membership.deleteOne({userId: req.user.id,communityId: community._id});

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
// PATCH /api/communities/:id  (moderator only)
exports.updateCommunity = async (req, res) => {
  try {
    const { description, image } = req.body;

    // Only these two fields can be edited (the name stays fixed)
    if (description !== undefined) req.community.description = description;
    if (image !== undefined) req.community.image = image;

    await req.community.save();
    res.json(req.community);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
// GET /api/communities?q=cat
exports.searchCommunities = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = {};

    if (q) {
      // Escape special characters so the search text is treated as plain text
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: safe, $options: 'i' }; // 'i' = ignore capitals
    }

    const communities = await Community
      .find(filter)
      .sort({ memberCount: -1 }) // biggest communities first
      .limit(20);

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/communities/mine
exports.getMyCommunities = async (req, res) => {
  try {
    const memberships = await Membership
      .find({ userId: req.user.id })
      .populate('communityId');

    // Skip any membership whose community no longer exists
    const communities = memberships
      .map((m) => m.communityId)
      .filter(Boolean);

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// DELETE /api/communities/:id/posts/:postId  (moderator only)
exports.removePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.postId,
      communityId: req.params.id
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found in this community' });
    }

    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/communities/:id/comments/:commentId  (moderator only)
exports.removeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // A comment has no communityId, so check through its post
    const post = await Post.findOne({ _id: comment.postId, communityId: req.params.id });
    if (!post) {
      return res.status(404).json({ message: 'Comment not found in this community' });
    }

    // Collect the comment and all its replies (replies of replies too)
    let ids = [comment._id];
    let frontier = [comment._id];
    while (frontier.length) {
      const children = await Comment.find({ parentCommentId: { $in: frontier } }).select('_id');
      frontier = children.map((c) => c._id);
      ids = ids.concat(frontier);
    }

    const result = await Comment.deleteMany({ _id: { $in: ids } });
    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: -result.deletedCount } });

    res.json({ message: 'Comment removed', removed: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};