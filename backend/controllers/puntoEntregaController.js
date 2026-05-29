const puntoEntregaModel = require('../models/puntoEntregaModel');

async function listarPuntosEntrega(req, res) {
    try {
        const puntos = await puntoEntregaModel.listarPuntosEntrega();
        res.json(puntos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener puntos de entrega' });
    }
}

module.exports = { listarPuntosEntrega };