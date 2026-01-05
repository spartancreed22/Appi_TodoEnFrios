const express = require('express');
const router = express.Router();
const PublicacionesController = require('../controllers/publicaciones.controller');

router.get('/', PublicacionesController.getInfo);

module.exports = router;