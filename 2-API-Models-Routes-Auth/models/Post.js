const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
	// we want posts to be connected to an user, so we need to make a reference to user
	user: {
		type: Schema.Types.ObjectId,
		ref: 'users',
	},
	text: {
		type: String,
		required: true,
	},
	// we're including name and avatar, because we want to have an option, to keep posts even if user decides to delete their account
	name: {
		type: String,
	},
	avatar: {
		type: String,
	},
	likes: [
		{
			// reference user, so we know which user liked which post
			user: {
				type: Schema.Types.ObjectId,
				ref: 'users',
			},
		},
	],
	comments: [
		{
			user: {
				type: Schema.Types.ObjectId,
				ref: 'users',
			},
			text: {
				type: String,
				required: true,
			},
			name: {
				type: String,
			},
			avatar: {
				type: String,
			},
			date: {
				type: Date,
				default: Date.now,
			},
		},
	],
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = Post = mongoose.model('post', PostSchema);
