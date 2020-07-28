const mongoose = require('mongoose');
const config = require('config');
// get values from default.json file
const db = config.get('mongoURI');

// connect to db
const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			// add configuration
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		});
		console.log('MongoDB Connected');
	} catch (err) {
		console.error(err.message);
		// quit application with failure
		process.exit(1);
	}
};

module.exports = connectDB;
