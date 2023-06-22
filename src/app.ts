// libraries
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import session, { MemoryStore } from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';


// swagger
import swaggerUI from 'swagger-ui-express';

// routers
import path from 'path';
import rootRouter from './api/routes';
import AppConfig from './configs/app.config';
import { HttpStatusCode } from './configs/statusCode.config';
// resolve path
const ROOT_FOLDER = path.join(__dirname, '..');
const SRC_FOLDER = path.join(ROOT_FOLDER, 'src');

// Initialize Express app
const app = express();

// for parsing application / json
app.use(express.json());

// set security HTTP headers
app.use(
	helmet({
		contentSecurityPolicy: {
			useDefaults: false,
			directives: {
				...helmet.contentSecurityPolicy.getDefaultDirectives(),
				'style-src': ["'self'", "'unsafe-inline'", AppConfig.BOOTSTRAP_ICONS_CDN],
				'script-src': ["'self'", "'unsafe-inline'", AppConfig.TAILWIND_CDN]
			}
		}
	})
);

// logging request/response
app.use(morgan('tiny'));

// use session - cookie
app.use(cookieParser());
app.use(
	session({
		saveUninitialized: false,
		secret: AppConfig.KEY_SESSION,
		store: new MemoryStore(),
		resave: true
	})
);

// enable cors
app.use(
	cors({
		origin: AppConfig.CLIENT_URL,
		credentials: true,
		methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
	})
);

app.use(passport.initialize());
app.use(passport.session());

// Use routers
app.use('/api', rootRouter);

// Swagger


app.get('/', (req, res) => res.json({ message: 'Server now is running.', status: HttpStatusCode.OK }));

export default app;
