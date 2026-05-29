const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Importar rutas
const usuariosRoutes = require('./routes/rutasUsuarios');
const librosRoutes = require('./routes/rutasLibros');
const carritoRoutes = require('./routes/rutasCarrito');
const transaccionesRoutes = require('./routes/rutasTransacciones');
const puntosEntregaRoutes = require('./routes/rutasPuntosEntrega');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos estáticos del frontend
app.use(express.static('../frontend')); 

// Rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/libros', librosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/puntos-entrega', puntosEntregaRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date() });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 Endpoint de prueba: http://localhost:${PORT}/api/health`);
});