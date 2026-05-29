const express = require('express');
const router = express.Router();
const libroController = require('../controllers/libroController');
const verificarToken = require('../middlewares/verificarToken');

router.get('/', libroController.listarLibros);                     // público
router.get('/:id', libroController.obtenerLibro);                  // público
router.post('/', verificarToken, libroController.publicarLibro);   // requiere auth
router.put('/:id/estado', verificarToken, libroController.actualizarEstadoLibro);
router.get('/usuario/mis-libros', verificarToken, libroController.misLibros);

module.exports = router;