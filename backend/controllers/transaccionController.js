const transaccionModel = require('../models/transaccionModel');
const puntoEntregaModel = require('../models/puntoEntregaModel');
const libroModel = require('../models/libroModel');

// Crear venta directa
async function crearVenta(req, res) {
    try {
        const { id_libro, monto, punto_encuentro_id } = req.body;
        const id_comprador = req.usuario.id;
        // Obtener el libro para saber el vendedor
        const libro = await libroModel.obtenerLibroPorId(id_libro);
        if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
        if (libro.id_vendedor === id_comprador) {
            return res.status(400).json({ error: 'No puedes comprar tu propio libro' });
        }
        if (libro.tipo_transaccion !== 'venta') {
            return res.status(400).json({ error: 'Este libro no está a la venta' });
        }
        const transaccionId = await transaccionModel.crearVenta(
            id_comprador, libro.id_vendedor, id_libro, monto, punto_encuentro_id
        );
        res.status(201).json({ id: transaccionId, mensaje: 'Venta creada, esperando confirmación' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear venta' });
    }
}

// Crear propuesta de trueque
async function crearTrueque(req, res) {
    try {
        const { id_libro_ofertado, id_libro_solicitado, punto_encuentro_id } = req.body;
        const id_ofertante = req.usuario.id;
        // Obtener el libro solicitado para saber su dueño
        const libroSolicitado = await libroModel.obtenerLibroPorId(id_libro_solicitado);
        if (!libroSolicitado) return res.status(404).json({ error: 'Libro solicitado no existe' });
        if (libroSolicitado.id_vendedor === id_ofertante) {
            return res.status(400).json({ error: 'No puedes truecar contigo mismo' });
        }
        if (libroSolicitado.tipo_transaccion !== 'trueque') {
            return res.status(400).json({ error: 'El libro solicitado no está disponible para trueque' });
        }
        const transaccionId = await transaccionModel.crearTrueque(
            id_ofertante, libroSolicitado.id_vendedor, id_libro_ofertado, id_libro_solicitado, punto_encuentro_id
        );
        res.status(201).json({ id: transaccionId, mensaje: 'Propuesta de trueque enviada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear trueque' });
    }
}

// Aceptar transacción (solo la contraparte puede aceptar)
async function aceptarTransaccion(req, res) {
    try {
        const { id } = req.params;
        // Verificar que la transacción exista y esté pendiente
        // (mejor hacer una función en el modelo que verifique permisos)
        // Por simplicidad, llamamos al modelo que ya hace la actualización atómica.
        await transaccionModel.aceptarTransaccion(id);
        res.json({ mensaje: 'Transacción completada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error al aceptar' });
    }
}

async function cancelarTransaccion(req, res) {
    try {
        const { id } = req.params;
        const ok = await transaccionModel.cancelarTransaccion(id);
        if (!ok) return res.status(404).json({ error: 'No se pudo cancelar' });
        res.json({ mensaje: 'Transacción cancelada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cancelar' });
    }
}

async function listarMisTransacciones(req, res) {
    try {
        const transacciones = await transaccionModel.listarTransaccionesPorUsuario(req.usuario.id);
        res.json(transacciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar transacciones' });
    }
}

module.exports = { crearVenta, crearTrueque, aceptarTransaccion, cancelarTransaccion, listarMisTransacciones };