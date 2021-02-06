const { Console } = require('console');

const logger = new Console({
  stdout: process.stdout, // eslint-disable-line
  stderr: process.stderr, // eslint-disable-line
});

module.exports = logger;
