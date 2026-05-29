const usuarioModel = require('../models/usuarioModel');
const jwt = require('jsonwebtoken');

// Genera token JWT
function generarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Registro
async function registrar(req, res) {
    try {
        const { email, nombre, carrera, semestre, password } = req.body;
        // Verificar si el email ya existe
        const existente = await usuarioModel.buscarPorEmail(email);
        if (existente) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        const nuevoId = await usuarioModel.crearUsuario({ email, nombre, carrera, semestre, password });
        const usuario = await usuarioModel.buscarPorId(nuevoId);
        const token = generarToken(usuario);
        res.status(201).json({ token, usuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

// Login
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const usuario = await usuarioModel.verificarPassword(email, password);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        const token = generarToken(usuario);
        res.json({ token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, carrera: usuario.carrera, semestre: usuario.semestre, rol: usuario.rol } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

// Obtener perfil (requiere autenticación)
async function obtenerPerfil(req, res) {
    try {
        const usuario = await usuarioModel.buscarPorId(req.usuario.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

// Actualizar perfil
async function actualizarPerfil(req, res) {
    try {
        const { nombre, carrera, semestre } = req.body;
        const actualizado = await usuarioModel.actualizarPerfil(req.usuario.id, { nombre, carrera, semestre });
        if (!actualizado) return res.status(400).json({ error: 'No se pudo actualizar' });
        const usuario = await usuarioModel.buscarPorId(req.usuario.id);
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
}

module.exports = { registrar, login, obtenerPerfil, actualizarPerfil };