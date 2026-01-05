const express = require('express');
const router = express.Router();
const NegocioController = require('../controllers/negocio.controller');

router.get('/', NegocioController.getInfo);
router.get('/exists', NegocioController.checkExists);

module.exports = router;