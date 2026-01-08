const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/productos.controller');
const { strictLimiter } = require('../middlewares/rateLimiter');
const { validate, validators } = require('../middlewares/validator');

// Ruta de búsqueda con rate limit estricto y validación
router.get('/search', 
    strictLimiter, 
    validators.search, 
    validate, 
    ProductosController.search
);

// Rutas con validación
router.get('/con-imagenes', ProductosController.getConImagenes);
router.get('/codigo/:codigo', validators.codigo, validate, ProductosController.getByCodigo);
router.get('/:id', validators.id, validate, ProductosController.getById);
router.get('/', ProductosController.getAll);

module.exports = router;