const router = require('express').Router();
const auth = require('../middleware/fakeAuth'); // swap for the real one later
const isModerator = require('../middleware/isModerator');
const {
  createCommunity,
  searchCommunities,
  getMyCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  updateCommunity
} = require('../controllers/communityController');

router.post('/', auth, createCommunity);
router.get('/', auth, searchCommunities);
router.get('/mine', auth, getMyCommunities);   // must come before '/:name'
router.get('/:name', auth, getCommunity);
router.post('/:id/join', auth, joinCommunity);
router.delete('/:id/join', auth, leaveCommunity);
router.patch('/:id', auth, isModerator, updateCommunity);

module.exports = router;