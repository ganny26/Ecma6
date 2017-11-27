const express = require('express');
const bodyParser = require('body-parser');

const app = express();



app.use(express.static('public'));


const server = app.listen(process.env.PORT || 7000, () => {
    console.log(`App running on port, ${server.address().port}`);
});
