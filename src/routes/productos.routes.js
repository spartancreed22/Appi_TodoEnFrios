const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/productos.controller');

router.get('/', ProductosController.getAll);
router.get('/con-imagenes', ProductosController.getConImagenes);
router.get('/codigo/:codigo', ProductosController.getByCodigo);
router.get('/:id', ProductosController.getById);

module.exports = router;