const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Crear un nuevo usuario (registro)
async function crearUsuario({ email, nombre, carrera, semestre, password }) {
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        `INSERT INTO usuarios (email, nombre, carrera, semestre, password_hash, rol)
         VALUES (?, ?, ?, ?, ?, 'alumno')`,
        [email, nombre, carrera, semestre, hashedPassword]
    );
    return result.insertId; // retorna el id del usuario creado
}

// Buscar usuario por email
async function buscarPorEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
}

// Buscar usuario por ID
async function buscarPorId(id) {
    const [rows] = await pool.query('SELECT id, email, nombre, carrera, semestre, rol, fecha_registro FROM usuarios WHERE id = ?', [id]);
    return rows[0];
}

// Actualizar perfil (nombre, carrera, semestre)
async function actualizarPerfil(id, datos) {
    const { nombre, carrera, semestre } = datos;
    const [result] = await pool.query(
        'UPDATE usuarios SET nombre = ?, carrera = ?, semestre = ? WHERE id = ?',
        [nombre, carrera, semestre, id]
    );
    return result.affectedRows > 0;
}

// Verificar contraseña (para login)
async function verificarPassword(email, password) {
    const usuario = await buscarPorEmail(email);
    if (!usuario) return null;
    const match = await bcrypt.compare(password, usuario.password_hash);
    if (!match) return null;
    return usuario;
}

module.exports = {
    crearUsuario,
    buscarPorEmail,
    buscarPorId,
    actualizarPerfil,
    verificarPassword
};