const NodeCache = require('node-cache');

// Cache con TTL de 5 minutos
const cache = new NodeCache({ 
    stdTTL: 300, // 5 minutos
    checkperiod: 60, // Limpia cache cada 60 segundos
    useClones: false // Mejora performance
});

// Middleware de cache
const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Solo cachear peticiones GET
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache_${req.originalUrl}`;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            console.log(`✅ Cache HIT: ${req.originalUrl}`);
            return res.status(200).json({
                ...cachedResponse,
                cached: true,
                cacheTimestamp: new Date().toISOString()
            });
        }

        console.log(`❌ Cache MISS: ${req.originalUrl}`);

        // Sobrescribir res.json para guardar en cache
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode === 200 && body.success) {
                cache.set(key, body, duration);
            }
            return originalJson(body);
        };

        next();
    };
};

// Limpiar cache manualmente
const clearCache = (pattern) => {
    if (pattern) {
        const keys = cache.keys();
        keys.forEach(key => {
            if (key.includes(pattern)) {
                cache.del(key);
            }
        });
        console.log(`🗑️ Cache limpiado: ${pattern}`);
    } else {
        cache.flushAll();
        console.log('🗑️ Todo el cache limpiado');
    }
};

module.exports = {
    cacheMiddleware,
    clearCache,
    cache
};