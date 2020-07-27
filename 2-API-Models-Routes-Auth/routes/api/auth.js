const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get(
	'/',
	// adding this will make route protected
	auth,
	async (req, res) => {
		try {
			// get user data
			const user = await User.findById(req.user.id)
				// exclude password
				.select('-password');
			res.json(user);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
	'/',
	// validation
	[
		// check(filed to check, custom error message)
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req, res) => {
		// req.body - access data that is being sent
		// console.log(req.body);

		const errors = validationResult(req);
		// if there are any errors
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// destructure
		const { email, password } = req.body;

		try {
			// check if user exists
			// search user in database
			let user = await User.findOne({
				// search by email
				email: email,
			});

			// if there's no user
			if (!user) {
				return res.status(400).json({
					errors: [{ msg: 'Invalid Credentials' }],
				});
			}

			// make sure that passwords match
			// compare(plain text password that user entered, encrypted password)
			const isMatch = await bcrypt.compare(password, user.password);

			// if passwords don't match
			if (!isMatch) {
				return res.status(400).json({
					errors: [{ msg: 'Invalid Credentials' }],
				});
			}

			// payload - contains data about user
			const payload = {
				user: {
					id: user.id,
				},
			};

			// create token
			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					// send token in response
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
