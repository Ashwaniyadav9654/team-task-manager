const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUsers, updateProfile, uploadAvatar, changePassword } = require('../controllers/userController');

router.use(protect);

router.get('/', getUsers);
router.put('/profile', updateProfile);
router.post('/avatar', uploadAvatar);
router.put('/password', changePassword);

module.exports = router;
