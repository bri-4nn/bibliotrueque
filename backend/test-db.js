const pool = require('./config/db');

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        const [rows] = await connection.query('SELECT 1 + 1 AS resultado');
        console.log('Consulta de prueba:', rows[0].resultado === 2 ? 'OK' : 'Fallo');
        connection.release();
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testConnection();