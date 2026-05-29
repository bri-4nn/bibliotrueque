const express = require('express');
const router = express.Router();
const puntoEntregaController = require('../controllers/puntoEntregaController');
const verificarToken = require('../middlewares/verificarToken');

router.get('/', verificarToken, puntoEntregaController.listarPuntosEntrega); // solo autenticados

module.exports = router;