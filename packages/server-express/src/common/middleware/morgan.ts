/**
 * https://betterstack.com/community/guides/logging/node-js/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/#logging-in-an-express-application-using-winston-and-morgan
 */
import morgan from 'morgan';
import logger from '../utils/logger';

export default morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: message => {
        logger.info(message.trim());
      },
    },
  }
);
