const carritoModel = require('../models/carritoModel');

async function obtenerCarrito(req, res) {
    try {
        const items = await carritoModel.obtenerCarrito(req.usuario.id);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener carrito' });
    }
}

async function agregarAlCarrito(req, res) {
    try {
        const { id_libro, cantidad } = req.body;
        if (!id_libro) return res.status(400).json({ error: 'id_libro requerido' });
        await carritoModel.agregarAlCarrito(req.usuario.id, id_libro, cantidad || 1);
        const items = await carritoModel.obtenerCarrito(req.usuario.id);
        res.status(201).json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar al carrito' });
    }
}

async function eliminarDelCarrito(req, res) {
    try {
        const { id } = req.params; // id del registro en carrito
        const ok = await carritoModel.eliminarDelCarrito(id, req.usuario.id);
        if (!ok) return res.status(404).json({ error: 'Ítem no encontrado' });
        const items = await carritoModel.obtenerCarrito(req.usuario.id);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
}

async function vaciarCarrito(req, res) {
    try {
        await carritoModel.vaciarCarrito(req.usuario.id);
        res.json({ mensaje: 'Carrito vaciado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al vaciar carrito' });
    }
}

module.exports = { obtenerCarrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito };