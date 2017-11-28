import express from 'express';
import bodyparse from 'body-parser';
import config from '../config';
import approute from '../routes/approute';
const app = express();

app.use(express.static('public'));

/**
 * route for commands
 */
app.use('/api', approute);

/**
 * node server to listen port
 */
const server = app.listen(config.port, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
});
