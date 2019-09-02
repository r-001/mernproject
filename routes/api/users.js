const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
var jwt = require('jsonwebtoken');
const router = express.Router();
const { check, validationResult } = require('express-validator/')
const User = require('../../models/User')
// @route get api/users
// @desc  test route
//@access public
router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'please include a valid email')
        .isEmail(),
    check('password', 'plese enter a password 6 or more  charecters ')
        .isLength({ min: 6 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
    }
    const { name, email, password } = req.body
    try {
        // see if user exists
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ errors: [{ msg: 'user already exists' }] })
        }
        // get users gravator 
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'

        })
        user = new User({
            name,
            email,
            avatar,
            password
        })
        // encrypt users
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt);
        user = await user.save();
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



})

module.exports = router;