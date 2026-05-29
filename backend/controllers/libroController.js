const libroModel = require('../models/libroModel');

// Listar libros con filtros
async function listarLibros(req, res) {
    try {
        const { carrera, semestre, materia, titulo, autor } = req.query;
        const filtros = { carrera, semestre, materia, titulo, autor };
        // Eliminar filtros vacíos
        Object.keys(filtros).forEach(key => filtros[key] === undefined && delete filtros[key]);
        const libros = await libroModel.listarLibros(filtros);
        res.json(libros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener libros' });
    }
}

// Obtener un libro por ID
async function obtenerLibro(req, res) {
    try {
        const { id } = req.params;
        const libro = await libroModel.obtenerLibroPorId(id);
        if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
        res.json(libro);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

// Publicar libro
async function publicarLibro(req, res) {
    try {
        const id_vendedor = req.usuario.id;
        const { isbn, condicion, precio_ofertado, tipo_transaccion, materia, carrera, semestre, titulo, autor, editorial, edicion } = req.body;
        // Validaciones básicas
        if (!isbn || !condicion || !materia || !carrera || !semestre || !titulo || !autor) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        const nuevoId = await libroModel.crearLibro({
            isbn, condicion, precio_ofertado, tipo_transaccion, id_vendedor,
            materia, carrera, semestre, titulo, autor, editorial, edicion
        });
        const libro = await libroModel.obtenerLibroPorId(nuevoId);
        res.status(201).json(libro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error al publicar libro' });
    }
}

// Actualizar estado del libro (ej. marcar como vendido)
async function actualizarEstadoLibro(req, res) {
    try {
        const { id } = req.params;
        const { estado_pub } = req.body;
        const libro = await libroModel.obtenerLibroPorId(id);
        if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
        // Solo el vendedor puede cambiar estado
        if (libro.id_vendedor !== req.usuario.id) {
            return res.status(403).json({ error: 'No autorizado' });
        }
        const ok = await libroModel.actualizarEstadoLibro(id, estado_pub);
        if (!ok) return res.status(400).json({ error: 'No se pudo actualizar' });
        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

// Listar libros publicados por el usuario autenticado
async function misLibros(req, res) {
    try {
        const libros = await libroModel.listarLibrosPorVendedor(req.usuario.id);
        res.json(libros);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

module.exports = { listarLibros, obtenerLibro, publicarLibro, actualizarEstadoLibro, misLibros };