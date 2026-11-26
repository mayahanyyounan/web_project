const router = require('express').Router();
const auth = require('../middleware/fakeAuth'); // swap for the real one later
const isModerator = require('../middleware/isModerator');
const {
  createCommunity, searchCommunities, getMyCommunities, getCommunity,
  joinCommunity, leaveCommunity, updateCommunity, removePost, removeComment
} = require('../controllers/communityController');

router.post('/', auth, createCommunity);
router.get('/', auth, searchCommunities);
router.get('/mine', auth, getMyCommunities);   // must come before '/:name'
router.get('/:name', auth, getCommunity);
router.post('/:id/join', auth, joinCommunity);
router.delete('/:id/join', auth, leaveCommunity);
router.patch('/:id', auth, isModerator, updateCommunity);
router.delete('/:id/posts/:postId', auth, isModerator, removePost);
router.delete('/:id/comments/:commentId', auth, isModerator, removeComment);

module.exports = router;