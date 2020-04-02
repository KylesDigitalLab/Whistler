const moment = require('moment');
const winston = require("winston")
const chalk = require("chalk");

module.exports = class Logger {
    constructor() {
        this.tsFormat = () =>  `[${chalk.grey(moment().format("YYYY-MM-DD / HH:mm:ss"))}]`
        this.winstonLogger = new winston.Logger({
            transports: [
                new winston.transports.Console({
                    timestamp: this.tsFormat,
                    level: 'silly',
                    colorize: true
                })
            ]
        })
        return this.winstonLogger
    }
}