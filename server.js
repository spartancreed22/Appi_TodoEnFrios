const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

// Importar middlewares de seguridad
const { generalLimiter } = require('./src/middlewares/rateLimiter');
const { cacheMiddleware } = require('./src/middlewares/cache');

// Importar rutas
const empleadosRoutes = require('./src/routes/empleados.routes');
const productosRoutes = require('./src/routes/productos.routes');
const publicacionesRoutes = require('./src/routes/publicaciones.routes');
const negocioRoutes = require('./src/routes/negocio.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES DE SEGURIDAD
// ========================================

// Helmet - Protección de cabeceras HTTP
app.use(helmet({
    contentSecurityPolicy: false, // Desactivar CSP para APIs
    crossOriginEmbedderPolicy: false
}));

// Compresión Gzip
app.use(compression());

// CORS restrictivo
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : ['http://localhost', 'http://127.0.0.1'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser con límite de tamaño
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter global
app.use('/api/', generalLimiter);

// Log de peticiones con timestamp
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString('es-CO');
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
    next();
});

// ========================================
// RUTAS
// ========================================

// Ruta raíz - Estado de la API
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 API TodoEnFrios - Sistema de Gestión',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
            empleados: '/api/empleados',
            productos: '/api/productos',
            publicaciones: '/api/publicaciones',
            negocio: '/api/negocio'
        },
        security: {
            rateLimit: '100 peticiones / 15 minutos',
            cache: 'Activo (5 minutos)',
            compression: 'Gzip habilitado'
        }
    });
});

// Health check endpoint (sin cache, sin rate limit)
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API con cache
app.use('/api/empleados', cacheMiddleware(300), empleadosRoutes);
app.use('/api/productos', cacheMiddleware(300), productosRoutes);
app.use('/api/publicaciones', cacheMiddleware(180), publicacionesRoutes); // 3 min
app.use('/api/negocio', cacheMiddleware(600), negocioRoutes); // 10 min

// ========================================
// MANEJO DE ERRORES
// ========================================

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// 500 - Error interno del servidor
app.use((err, req, res, next) => {
    console.error('❌ Error interno:', err.stack);
    
    res.status(err.status || 500).json({ 
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error',
        timestamp: new Date().toISOString()
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🚀 API TodoEnFrios INICIADA         ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`📡 Servidor: http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-CO')}`);
    console.log('\n🛡️  Seguridad:');
    console.log(`   ✅ Rate Limit: 100 req/15min por IP`);
    console.log(`   ✅ Cache: Activo (5 minutos)`);
    console.log(`   ✅ Compresión: Gzip habilitado`);
    console.log(`   ✅ Helmet: Headers seguros`);
    console.log(`   ✅ CORS: Dominios restringidos`);
    console.log('\n📋 Endpoints disponibles:');
    console.log(`   GET  /api/empleados`);
    console.log(`   GET  /api/productos`);
    console.log(`   GET  /api/publicaciones`);
    console.log(`   GET  /api/negocio`);
    console.log(`   GET  /health`);
    console.log('═════════════════════════════════════════\n');
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n⚠️  Cerrando servidor...');
    process.exit(0);
});