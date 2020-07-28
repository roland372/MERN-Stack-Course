const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
	'/',
	[auth, [check('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		try {
			const user = await User.findById(req.user.id).select('-password');

			// create new post object
			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			// save post to database
			const post = await newPost.save();
			// return post in a response
			res.json(post);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find()
			// sort by most recent posts first
			.sort({ date: -1 });
		res.json(posts);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		// check if there is a post with that id
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		res.json(post);
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// if post doesn't exist
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// make sure that user that is deleting a post is a user that created a post
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		// remove post from database
		await post.remove();

		res.json({ msg: 'Post removed' });
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
	try {
		// fetch a post
		const post = await Post.findById(req.params.id);

		// check if the post already has been liked by that user, we want user to be able to like single post only once
		if (
			// length > 0 if post was already liked
			post.likes.filter(like => like.user.toString() === req.user.id).length > 0
		) {
			return res.status(400).json({ msg: 'Post already liked' });
		}

		// else add user that liked this post
		post.likes.unshift({ user: req.user.id });

		await post.save();

		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   PUT api/posts/unlike/:id
// @desc    Like a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
	try {
		// fetch a post
		const post = await Post.findById(req.params.id);

		// check if the post already has been liked by that user
		if (
			// length === 0 if post wasn't liked yet
			post.likes.filter(like => like.user.toString() === req.user.id).length ===
			0
		) {
			return res.status(400).json({ msg: 'Post has not yet been liked' });
		}

		// get remove index
		// get correct like to remove
		const removeIndex = post.likes
			.map(like => like.user.toString())
			.indexOf(req.user.id);

		// remove like from an array
		post.likes.splice(removeIndex, 1);

		await post.save();

		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post(
	'/comment/:id',
	[auth, [check('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
			});
		}

		try {
			const user = await User.findById(req.user.id).select('-password');
			const post = await Post.findById(req.params.id);

			// create a new comment object
			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			// add new comment into comments array
			post.comments.unshift(newComment);

			// save post to database
			await post.save();
			// return comments in a response
			res.json(post.comments);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// get comment from a post by it's id
		const comment = post.comments.find(
			comment => comment.id === req.params.comment_id
		);

		// make sure comment exists
		if (!comment) {
			return res.status(404).json({ msg: 'Comment does not exist' });
		}

		// make sure that user that is deleting a comment is a user that created it
		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		// get remove index
		// get correct comment to remove
		const removeIndex = post.comments
			.map(comment => comment.user.toString())
			.indexOf(req.user.id);

		// remove comment from an array
		post.comments.splice(removeIndex, 1);
		await post.save();
		res.json(post.comments);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
