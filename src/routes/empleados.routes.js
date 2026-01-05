const express = require('express');
const router = express.Router();
const EmpleadosController = require('../controllers/empleados.controller');

router.get('/', EmpleadosController.getAll);
router.get('/activos', EmpleadosController.getActivos);
router.get('/:documento', EmpleadosController.getById);

module.exports = router;