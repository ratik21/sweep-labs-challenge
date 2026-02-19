require('dotenv').config();
const app = require('./app');
const { logger } = require('./middleware/logger');

const port = process.env.PORT || 3001;
app.listen(port, () => logger.info(`Server listening on http://localhost:${port}`));
