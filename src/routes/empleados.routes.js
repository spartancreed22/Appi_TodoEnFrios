const express = require('express');
const router = express.Router();
const EmpleadosController = require('../controllers/empleados.controller');
const { validate, validators } = require('../middlewares/validator');

router.get('/', EmpleadosController.getAll);
router.get('/activos', EmpleadosController.getActivos);
router.get('/:documento', validators.documento, validate, EmpleadosController.getById);

module.exports = router;