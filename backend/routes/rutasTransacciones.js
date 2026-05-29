const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');
const verificarToken = require('../middlewares/verificarToken');

router.use(verificarToken);
router.post('/venta', transaccionController.crearVenta);
router.post('/trueque', transaccionController.crearTrueque);
router.put('/:id/aceptar', transaccionController.aceptarTransaccion);
router.put('/:id/cancelar', transaccionController.cancelarTransaccion);
router.get('/mis-transacciones', transaccionController.listarMisTransacciones);

module.exports = router;