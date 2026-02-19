const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
  // keep test output clean
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
});

const httpLogger = pinoHttp({
  logger,
  // only log what we care about, default pino-http dumps all headers
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        host: req.headers?.host,
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort,
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});

module.exports = { logger, httpLogger };
