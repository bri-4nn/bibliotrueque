const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/verificarToken');
const { validarRegistro, validarLogin } = require('../middlewares/validarRegistro');

router.post('/registro', validarRegistro, usuarioController.registrar);
router.post('/login', validarLogin, usuarioController.login);
router.get('/perfil', verificarToken, usuarioController.obtenerPerfil);
router.put('/perfil', verificarToken, usuarioController.actualizarPerfil);

module.exports = router;