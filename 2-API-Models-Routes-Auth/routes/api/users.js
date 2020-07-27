const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
	'/',
	// validation
	[
		// check(filed to check, custom error message)
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({
			min: 6,
		}),
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
		const { name, email, password } = req.body;

		try {
			// check if user exists
			// search user in database
			let user = await User.findOne({
				// search by email
				email: email,
			});

			// if user already exists
			if (user) {
				return res.status(400).json({
					errors: [{ msg: 'User already exists' }],
				});
			}

			// get users avatar based on email
			const avatar = gravatar.url(email, {
				// size
				s: '200',
				// rating
				r: 'pg',
				// default icon
				d: 'mm',
			});

			// create new user based on model
			user = new User({
				name: name,
				email: email,
				avatar: avatar,
				password: password,
			});

			// encrypt password
			// hash password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			// save user to database
			await user.save();

			// return jsonwebtoken
			// res.send('User registered');

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
