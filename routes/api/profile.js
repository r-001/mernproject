const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/profile');
// @route get api/profile/me
// @desc  get current user profile
//@access public
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name, avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'thereis no profile for this user' })
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;