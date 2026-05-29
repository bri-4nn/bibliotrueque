// backend/models/puntoEntregaModel.js
const pool = require('../config/db');

async function listarPuntosEntrega() {
    const [rows] = await pool.query('SELECT * FROM puntos_entrega ORDER BY nombre');
    return rows;
}

async function obtenerPuntoEntregaPorId(id) {
    const [rows] = await pool.query('SELECT * FROM puntos_entrega WHERE id = ?', [id]);
    return rows[0];
}

module.exports = {
    listarPuntosEntrega,
    obtenerPuntoEntregaPorId
};