const express = require('express');
const router = express.Router();
const PublicacionesController = require('../controllers/publicaciones.controller');
const { strictLimiter } = require('../middlewares/rateLimiter');
const { validate, validators } = require('../middlewares/validator');

// Rutas específicas
router.get('/vigentes', PublicacionesController.getVigentes);
router.get('/proximas', PublicacionesController.getProximas);
router.get('/vencidas', PublicacionesController.getVencidas);
router.get('/search', strictLimiter, validators.search, validate, PublicacionesController.search);

// Rutas generales
router.get('/', PublicacionesController.getAll);
router.get('/:id', validators.id, validate, PublicacionesController.getById);

module.exports = router;