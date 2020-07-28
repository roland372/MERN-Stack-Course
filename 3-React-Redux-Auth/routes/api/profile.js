const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
	try {
		// search for user's profile
		const profile = await Profile.findOne({
			// find by id - this will point to
			// user: {
			//   type: mongoose.Schema.Types.ObjectId,
			//   ref: 'user',
			// },
			user: req.user.id,
		})
			// populate(from where, what we want to bring)
			.populate('user', ['name', 'avatar']);

		// check if there's no profile
		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		// if there is a profile - send a profile in response
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
	'/',
	[
		auth,
		// add validation
		[
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills are required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		// if there are any errors
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// destructure
		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		// build profile object
		const profileFields = {};
		// set user
		profileFields.user = req.user.id;
		// add fields
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills
				// turn skills into an array and separate items by ,
				.split(',')
				.map(skill =>
					skill
						// get rid of any extra whitespace
						.trim()
				);
		}
		// console.log(profileFields.skills);
		// res.send('Hello');

		// build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			// find profile by the user
			let profile = await Profile.findOne({ user: req.user.id });

			// if profile already exists
			if (profile) {
				// update it
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);

				// return entire profile
				return res.json(profile);
			}

			// if profile is not found, we want to create a new one
			profile = new Profile(profileFields);
			// save profile to database
			await profile.save();
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
	try {
		// search for a profile, and populate name and avatar from user
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
	try {
		// search for a profile, and populate name and avatar from user
		const profile = await Profile.findOne({
			user:
				// we can access user's id from url
				req.params.user_id,
		}).populate('user', ['name', 'avatar']);

		// if profile does not exist
		if (!profile) return res.status(400).json({ msg: 'Profile not found' });

		// else send a profile
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		// check for a certain type of message
		if (err.kind === 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route   DETETE api/profile
// @desc    Delete profile , user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
	try {
		// remove profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// remove user
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
	'/experience',
	[
		auth,
		// add validation
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// destructuring
		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		} = req.body;

		// define experiences object
		const newExp = {
			title: title,
			company: company,
			location: location,
			from: from,
			to: to,
			current: current,
			description: description,
		};

		try {
			// find profile
			const profile = await Profile.findOne({ user: req.user.id });

			// push new experience object into an array
			profile.experience.unshift(newExp);

			// update/save profile to database
			await profile.save();

			// return whole profile with experience added
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// get remove index - remove correct experience
		const removeIndex = profile.experience
			.map(item => item.id)
			// match exp_id, that's going to be in an url
			.indexOf(req.params.exp_id);

		// remove experience from profile
		profile.experience.splice(removeIndex, 1);

		// resave to database
		await profile.save();

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
	'/education',
	[
		auth,
		// add validation
		[
			check('school', 'School is required').not().isEmpty(),
			check('degree', 'Degree is required').not().isEmpty(),
			check('fieldofstudy', 'Field of study is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		} = req.body;

		// define education object
		const newEdu = {
			school: school,
			degree: degree,
			fieldofstudy: fieldofstudy,
			from: from,
			to: to,
			current: current,
			description: description,
		};

		try {
			// find profile
			const profile = await Profile.findOne({ user: req.user.id });

			// push new education object into an array
			profile.education.unshift(newEdu);

			// update/save profile to database
			await profile.save();

			// return whole profile with education added
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// get remove index - remove correct education
		const removeIndex = profile.education
			.map(item => item.id)
			// match exp_id, that's going to be in an url
			.indexOf(req.params.edu_id);

		// remove education from profile
		profile.education.splice(removeIndex, 1);

		// resave to database
		await profile.save();

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				'githubClientId'
			)}&client_secret=${config.get('githubSecret')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' },
		};

		// make a request
		request(options, (error, response, body) => {
			if (error) console.error(error);

			// if we get bad response
			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: 'No Github profile found' });
			}

			// if profile is found return it in a response
			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
