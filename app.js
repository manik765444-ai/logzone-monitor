// logger.js
const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'app' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ],
  exitOnError: false,
  silent: false
});

module.exports = logger;

// error-handler.js
const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  res.status(err.status || 500);
  res.send({ error: err.message });
};

module.exports = errorHandler;

// app.js
const express = require('express');
const app = express();
const logger = require('./logger');
const errorHandler = require('./error-handler');

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} ${req.ip}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorHandler);

const port = 3000;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection at: ${err}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err}`);
  process.exit(1);
});