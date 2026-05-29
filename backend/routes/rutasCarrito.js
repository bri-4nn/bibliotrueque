const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const verificarToken = require('../middlewares/verificarToken');

router.use(verificarToken); // todas las rutas de carrito requieren auth
router.get('/', carritoController.obtenerCarrito);
router.post('/agregar', carritoController.agregarAlCarrito);
router.delete('/:id', carritoController.eliminarDelCarrito);
router.delete('/', carritoController.vaciarCarrito);

module.exports = router;