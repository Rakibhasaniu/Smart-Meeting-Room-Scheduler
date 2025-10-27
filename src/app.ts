/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import { setupSwagger } from './swagger';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));

// Setup Swagger documentation
setupSwagger(app);

// application routes
app.use('/api', router);

app.get('/', (_req: Request, res: Response) => {
  res.send('Smart Meeting Room Scheduler API is running! Visit /api-docs for documentation.');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
