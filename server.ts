import { Server } from 'next';
import app from './server/app';

const server = new Server(app);
server.start();
