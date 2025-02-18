// const winston = require('winston');

// // Create Winston logger
// const logger = winston.createLogger({
//     level: 'info',
//     format: winston.format.combine(
//         winston.format.timestamp(),
//         winston.format.json()
//     ),
//     transports: [
//         new winston.transports.File({ 
//             filename: 'logs/error.log', 
//             level: 'error',
//             maxsize: 5242880, // 5MB
//             maxFiles: 5
//         }),
//         new winston.transports.File({ 
//             filename: 'logs/security.log',
//             maxsize: 5242880,
//             maxFiles: 5
//         }),
//         new winston.transports.File({ 
//             filename: 'logs/combined.log',
//             maxsize: 5242880,
//             maxFiles: 5
//         })
//     ]
// });

// if (process.env.NODE_ENV !== 'production') {
//     logger.add(new winston.transports.Console({
//         format: winston.format.simple()
//     }));
// }

// // Enhanced security monitoring middleware
// const securityMonitoring = (req, res, next) => {
//     // Log rate limit hits
//     if (req.rateLimit && req.rateLimit.remaining === 0) {
//         logger.warn({
//             type: 'RATE_LIMIT_EXCEEDED',
//             ip: req.ip,
//             path: req.path,
//             remainingTime: req.rateLimit.resetTime - Date.now()
//         });
//     }

//     // Log authentication attempts
//     if (req.path.includes('/api/user/login')) {
//         logger.info({
//             type: 'AUTH_ATTEMPT',
//             ip: req.ip,
//             userAgent: req.headers['user-agent']
//         });
//     }

//     // Log potential security threats
//     const suspicious = {
//         largePayload: req.headers['content-length'] > 1000000, // 1MB
//         suspiciousHeaders: req.headers['x-forwarded-for'] !== undefined,
//         malformedJson: req.body === undefined && req.headers['content-type']?.includes('application/json')
//     };

//     if (Object.values(suspicious).some(Boolean)) {
//         logger.warn({
//             type: 'SECURITY_THREAT',
//             ip: req.ip,
//             path: req.path,
//             threats: suspicious,
//             headers: req.headers
//         });
//     }

//     next();
// };

// module.exports = { logger, securityMonitoring };