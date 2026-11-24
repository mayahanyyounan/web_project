const router = require('express').Router();
const auth = require('../middleware/fakeAuth'); // swap for the real one later
const { createCommunity, getCommunity } = require('../controllers/communityController');

router.post('/', auth, createCommunity);
router.get('/:name', auth, getCommunity);

module.exports = router;