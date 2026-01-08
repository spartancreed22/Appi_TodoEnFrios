const rateLimit = require('express-rate-limit');

// Limiter general para toda la API
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 peticiones por IP
    message: {
        success: false,
        error: 'Demasiadas peticiones',
        message: 'Has excedido el límite de 100 peticiones por 15 minutos. Intenta más tarde.',
        retryAfter: '15 minutos',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true, // Incluye headers RateLimit-*
    legacyHeaders: false, // Desactiva headers X-RateLimit-*
    // Opcional: guardar en Redis en producción
    // store: new RedisStore({ client: redisClient })
});

// Limiter estricto para endpoints sensibles (búsquedas, etc.)
const strictLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 20, // Máximo 20 peticiones
    message: {
        success: false,
        error: 'Demasiadas búsquedas',
        message: 'Has excedido el límite de 20 búsquedas por 5 minutos.',
        retryAfter: '5 minutos',
        timestamp: new Date().toISOString()
    }
});

// Limiter muy estricto para autenticación (prevenir brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Solo 5 intentos de login
    skipSuccessfulRequests: true, // No cuenta peticiones exitosas
    message: {
        success: false,
        error: 'Demasiados intentos de login',
        message: 'Has excedido el límite de 5 intentos. Cuenta bloqueada por 15 minutos.',
        retryAfter: '15 minutos',
        timestamp: new Date().toISOString()
    }
});

module.exports = {
    generalLimiter,
    strictLimiter,
    authLimiter
};