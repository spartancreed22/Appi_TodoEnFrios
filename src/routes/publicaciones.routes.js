const express = require('express');
const router = express.Router();
const PublicacionesController = require('../controllers/publicaciones.controller');

// Rutas específicas primero (antes de /:id)
router.get('/vigentes', PublicacionesController.getVigentes);
router.get('/proximas', PublicacionesController.getProximas);
router.get('/vencidas', PublicacionesController.getVencidas);
router.get('/search', PublicacionesController.search);

// Rutas generales
router.get('/', PublicacionesController.getAll);
router.get('/:id', PublicacionesController.getById);

module.exports = router;