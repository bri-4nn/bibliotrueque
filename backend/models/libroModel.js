const pool = require('../config/db');

// Crear un nuevo libro (publicar)
async function crearLibro(libroData) {
    const {
        isbn, condicion, precio_ofertado, tipo_transaccion,
        id_vendedor, materia, carrera, semestre, titulo, autor, editorial, edicion
    } = libroData;

    // 1. Verificar si el ISBN ya existe en referencias_libros; si no, insertarlo
    const [ref] = await pool.query('SELECT isbn FROM referencias_libros WHERE isbn = ?', [isbn]);
    if (ref.length === 0 && isbn) {
        await pool.query(
            'INSERT INTO referencias_libros (isbn, titulo, autor, editorial, edicion) VALUES (?, ?, ?, ?, ?)',
            [isbn, titulo, autor, editorial, edicion]
        );
    } else if (!isbn) {
        // Si no hay ISBN, no se puede guardar la referencia; en este caso, se podría permitir NULL? 
        // Según nuestro esquema, isbn en libros es NOT NULL y FK a referencias_libros.
        // Para simplificar, exigimos ISBN. O podríamos crear una referencia temporal con ISBN null? No permitido.
        // Mejor lanzar error.
        throw new Error('El ISBN es obligatorio para publicar un libro.');
    }

    // 2. Insertar el ejemplar en tabla libros
    const [result] = await pool.query(
        `INSERT INTO libros 
         (isbn, condicion, precio_ofertado, tipo_transaccion, id_vendedor, 
          estado_pub, materia, carrera, semestre)
         VALUES (?, ?, ?, ?, ?, 'disponible', ?, ?, ?)`,
        [isbn, condicion, precio_ofertado, tipo_transaccion, id_vendedor, materia, carrera, semestre]
    );
    return result.insertId;
}

// Obtener libros con filtros opcionales (carrera, semestre, materia, búsqueda por título/autor)
async function listarLibros(filtros = {}) {
    let sql = `
        SELECT l.*, r.titulo, r.autor, r.editorial, r.edicion,
               u.nombre as vendedor_nombre, u.email as vendedor_email
        FROM libros l
        JOIN referencias_libros r ON l.isbn = r.isbn
        JOIN usuarios u ON l.id_vendedor = u.id
        WHERE l.estado_pub = 'disponible'
    `;
    const values = [];
    if (filtros.carrera) {
        sql += ' AND l.carrera = ?';
        values.push(filtros.carrera);
    }
    if (filtros.semestre) {
        sql += ' AND l.semestre = ?';
        values.push(filtros.semestre);
    }
    if (filtros.materia) {
        sql += ' AND l.materia LIKE ?';
        values.push(`%${filtros.materia}%`);
    }
    if (filtros.titulo) {
        sql += ' AND r.titulo LIKE ?';
        values.push(`%${filtros.titulo}%`);
    }
    if (filtros.autor) {
        sql += ' AND r.autor LIKE ?';
        values.push(`%${filtros.autor}%`);
    }
    sql += ' ORDER BY l.fecha_publicacion DESC';
    const [rows] = await pool.query(sql, values);
    return rows;
}

// Obtener un libro por ID
async function obtenerLibroPorId(id) {
    const [rows] = await pool.query(
        `SELECT l.*, r.titulo, r.autor, r.editorial, r.edicion,
                u.nombre as vendedor_nombre, u.email as vendedor_email
         FROM libros l
         JOIN referencias_libros r ON l.isbn = r.isbn
         JOIN usuarios u ON l.id_vendedor = u.id
         WHERE l.id = ?`,
        [id]
    );
    return rows[0];
}

// Actualizar estado del libro (vendido, intercambiado, reservado)
async function actualizarEstadoLibro(id, nuevoEstado) {
    const [result] = await pool.query(
        'UPDATE libros SET estado_pub = ? WHERE id = ?',
        [nuevoEstado, id]
    );
    return result.affectedRows > 0;
}

// Listar libros publicados por un usuario
async function listarLibrosPorVendedor(idVendedor) {
    const [rows] = await pool.query(
        `SELECT l.*, r.titulo, r.autor
         FROM libros l
         JOIN referencias_libros r ON l.isbn = r.isbn
         WHERE l.id_vendedor = ?`,
        [idVendedor]
    );
    return rows;
}

module.exports = {
    crearLibro,
    listarLibros,
    obtenerLibroPorId,
    actualizarEstadoLibro,
    listarLibrosPorVendedor
};