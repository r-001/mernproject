const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth')
const config = require('config');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/')
const User = require('../../models/User')
// @route get api/auth
// @desc  test route
//@access public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.send(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('server error')

    }

})

// @route get api/auth
// @desc  authenticate user & get token
//@access public
router.post('/', [
    check('email', 'please include a valid email')
        .isEmail(),
    check('password', ' password is required  ').exists()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body
    try {
        // see if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ errors: [{ msg: 'invalid email ' }] })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.
                status(400).
                json({ errors: [{ msg: 'invalid password' }] })
        }


        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            });


        //return json webtoken 

    } catch (err) {
        console.log(err.massege)
        res.status(500).send('Server error')
    }



});


module.exports = router;