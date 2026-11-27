const express = require ("express");
const router = express.Router();

const protect = require ("../middleware/authMiddleware");

const {
     getMyProfile,
    getUserProfile,
    updateProfile,
    searchUsers
} = require("../controllers/userController");
//protect only when accessing my own profile
router.get("/me", protect, getMyProfile);

router.put("/me", protect, updateProfile);

router.get("/search", searchUsers);

router.get("/:id", getUserProfile);

module.exports = router;