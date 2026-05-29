const pool = require('../config/db');

// Agregar libro al carrito (o incrementar cantidad)
async function agregarAlCarrito(idUsuario, idLibro, cantidad = 1) {
    // Verificar si ya existe
    const [existe] = await pool.query(
        'SELECT id, cantidad FROM carrito WHERE id_usuario = ? AND id_libro = ?',
        [idUsuario, idLibro]
    );
    if (existe.length > 0) {
        // Actualizar cantidad
        const nuevaCantidad = existe[0].cantidad + cantidad;
        await pool.query(
            'UPDATE carrito SET cantidad = ? WHERE id = ?',
            [nuevaCantidad, existe[0].id]
        );
        return existe[0].id;
    } else {
        // Insertar nuevo
        const [result] = await pool.query(
            'INSERT INTO carrito (id_usuario, id_libro, cantidad) VALUES (?, ?, ?)',
            [idUsuario, idLibro, cantidad]
        );
        return result.insertId;
    }
}

// Obtener carrito completo de un usuario (con datos del libro)
async function obtenerCarrito(idUsuario) {
    const [rows] = await pool.query(
        `SELECT c.id as carrito_id, c.cantidad, c.fecha_agregado,
                l.id as libro_id, l.precio_ofertado, l.condicion, l.tipo_transaccion,
                r.titulo, r.autor, u.nombre as vendedor_nombre
         FROM carrito c
         JOIN libros l ON c.id_libro = l.id
         JOIN referencias_libros r ON l.isbn = r.isbn
         JOIN usuarios u ON l.id_vendedor = u.id
         WHERE c.id_usuario = ? AND l.estado_pub = 'disponible'`,
        [idUsuario]
    );
    return rows;
}

// Eliminar un ítem del carrito
async function eliminarDelCarrito(idCarrito, idUsuario) {
    const [result] = await pool.query(
        'DELETE FROM carrito WHERE id = ? AND id_usuario = ?',
        [idCarrito, idUsuario]
    );
    return result.affectedRows > 0;
}

// Vaciar carrito completo de un usuario
async function vaciarCarrito(idUsuario) {
    const [result] = await pool.query('DELETE FROM carrito WHERE id_usuario = ?', [idUsuario]);
    return result.affectedRows;
}

module.exports = {
    agregarAlCarrito,
    obtenerCarrito,
    eliminarDelCarrito,
    vaciarCarrito
};