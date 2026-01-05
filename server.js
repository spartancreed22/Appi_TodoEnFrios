const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas
const empleadosRoutes = require('./src/routes/empleados.routes');
const productosRoutes = require('./src/routes/productos.routes');
const publicacionesRoutes = require('./src/routes/publicaciones.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES
// ========================================
app.use(cors({
    origin: '*', // En producción, especifica dominios permitidos
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log de peticiones con colores
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString('es-CO');
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
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
            publicaciones: '/api/publicaciones'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
app.use('/api/empleados', empleadosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/publicaciones', publicacionesRoutes);

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
    console.log('\n📋 Endpoints disponibles:');
    console.log(`   GET  /api/empleados`);
    console.log(`   GET  /api/productos`);
    console.log(`   GET  /api/publicaciones`);
    console.log(`   GET  /health (estado del servidor)`);
    console.log('═════════════════════════════════════════\n');
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n⚠️  Cerrando servidor...');
    process.exit(0);
});