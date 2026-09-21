import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import educationRouter from './routes/education';
import profileRouter from './routes/profile';
import dashboardRouter from './routes/dashboard';
import assessmentRouter from './routes/assessments';
import aiRouter from './routes/ai';
import resumeRouter from './routes/resume';
import opportunityRouter from './routes/opportunity';
import settingsRouter from './routes/settings';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS
const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientURL,
    credentials: true,
  })
);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (generous for development)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/education', educationRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/assessments', assessmentRouter);
app.use('/api/v1/recommendations', aiRouter);
app.use('/api/v1/resumes', resumeRouter);
app.use('/api/v1/opportunities', opportunityRouter);
app.use('/api/v1/settings', settingsRouter);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
