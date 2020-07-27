const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
	// get token from header
	const token = req.header('x-auth-token');

	// check if no token found
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	// if token found - verify it
	try {
		// decode token
		const decoded = jwt.verify(token, config.get('jwtSecret'));

		// assign token to user
		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(401).json({ msg: 'Token is not valid' });
	}
};
