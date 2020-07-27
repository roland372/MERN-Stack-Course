const express = require('express');

const app = express();

app.get('/', (req, res) =>
	res
		// send data to browser
		.send('API Running')
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
