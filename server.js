import express from 'express';
import 'dotenv/config';
import ApiRoutes from './routes/api.js';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import cors from 'cors';
import { limiter } from './config/rateLimiter.js';
import logger from './config/logger.js';

const app = express();
const PORT = process.env.PORT || 8000;

// using Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Serving static directory
app.use(express.static('public'));
app.use(fileUpload());
app.use(helmet());
app.use(cors()); // allows all the Public APIs
app.use(limiter);

// using Routes
app.use('/api', ApiRoutes);

// Importing Jobs
import './jobs/index.js';

// logger.info('Testing logger ');
// logger.error('Testing Error log');

app.listen(PORT, () => {
  console.log(`Server is up and running on PORT ${PORT}`);
});
