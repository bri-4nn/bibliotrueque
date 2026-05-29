const pool = require('../config/db');

// Crear una transacción de venta
async function crearVenta(idComprador, idVendedor, idLibro, monto, puntoEncuentroId) {
    const [result] = await pool.query(
        `INSERT INTO transacciones 
         (id_usuario_ofertante, id_usuario_contraparte, id_libro_ofertado, tipo, monto, punto_encuentro_id, estado)
         VALUES (?, ?, ?, 'venta', ?, ?, 'pendiente')`,
        [idComprador, idVendedor, idLibro, monto, puntoEncuentroId]
    );
    return result.insertId;
}

// Crear una propuesta de trueque
async function crearTrueque(idOfertante, idContraparte, idLibroOfertado, idLibroSolicitado, puntoEncuentroId) {
    const [result] = await pool.query(
        `INSERT INTO transacciones 
         (id_usuario_ofertante, id_usuario_contraparte, id_libro_ofertado, id_libro_solicitado, tipo, punto_encuentro_id, estado)
         VALUES (?, ?, ?, ?, 'trueque', ?, 'pendiente')`,
        [idOfertante, idContraparte, idLibroOfertado, idLibroSolicitado, puntoEncuentroId]
    );
    return result.insertId;
}

// Aceptar una transacción pendiente (cambia estado a 'completado' y actualiza estados de libros)
async function aceptarTransaccion(idTransaccion) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Obtener la transacción
        const [transaccion] = await connection.query(
            'SELECT tipo, id_libro_ofertado, id_libro_solicitado FROM transacciones WHERE id = ? AND estado = "pendiente"',
            [idTransaccion]
        );
        if (transaccion.length === 0) throw new Error('Transacción no encontrada o ya procesada');
        const t = transaccion[0];

        // Marcar libro(s) como vendido/intercambiado
        await connection.query('UPDATE libros SET estado_pub = ? WHERE id = ?', 
            [t.tipo === 'venta' ? 'vendido' : 'intercambiado', t.id_libro_ofertado]);
        if (t.tipo === 'trueque' && t.id_libro_solicitado) {
            await connection.query('UPDATE libros SET estado_pub = "intercambiado" WHERE id = ?', [t.id_libro_solicitado]);
        }

        // Actualizar estado de la transacción
        await connection.query('UPDATE transacciones SET estado = "completado" WHERE id = ?', [idTransaccion]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Cancelar transacción pendiente
async function cancelarTransaccion(idTransaccion) {
    const [result] = await pool.query(
        'UPDATE transacciones SET estado = "cancelado" WHERE id = ? AND estado = "pendiente"',
        [idTransaccion]
    );
    return result.affectedRows > 0;
}

// Listar transacciones de un usuario (como ofertante o contraparte)
async function listarTransaccionesPorUsuario(idUsuario) {
    const [rows] = await pool.query(
        `SELECT t.*, 
                l_o.titulo as libro_ofertado_titulo, l_s.titulo as libro_solicitado_titulo,
                u_o.nombre as ofertante_nombre, u_c.nombre as contraparte_nombre
         FROM transacciones t
         LEFT JOIN libros l_o ON t.id_libro_ofertado = l_o.id
         LEFT JOIN referencias_libros r_o ON l_o.isbn = r_o.isbn
         LEFT JOIN libros l_s ON t.id_libro_solicitado = l_s.id
         LEFT JOIN referencias_libros r_s ON l_s.isbn = r_s.isbn
         LEFT JOIN usuarios u_o ON t.id_usuario_ofertante = u_o.id
         LEFT JOIN usuarios u_c ON t.id_usuario_contraparte = u_c.id
         WHERE t.id_usuario_ofertante = ? OR t.id_usuario_contraparte = ?
         ORDER BY t.fecha DESC`,
        [idUsuario, idUsuario]
    );
    // Formatear títulos
    return rows.map(row => ({
        ...row,
        libro_ofertado_titulo: row.libro_ofertado_titulo,
        libro_solicitado_titulo: row.libro_solicitado_titulo
    }));
}

module.exports = {
    crearVenta,
    crearTrueque,
    aceptarTransaccion,
    cancelarTransaccion,
    listarTransaccionesPorUsuario
};