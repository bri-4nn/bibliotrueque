const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());                 // Permite peticiones desde el frontend
app.use(express.json());        // Para parsear cuerpos en JSON
app.use(morgan('dev'));         // Logs de peticiones (útil para depurar)

// Ruta de prueba para saber si el servidor funciona
app.get('/api/health', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date() });
});

// Más adelante añadiremos aquí las rutas de usuarios, libros, etc.

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Endpoint de prueba: http://localhost:${PORT}/api/health`);
});