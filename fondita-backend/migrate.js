require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    // Conectar al servidor MySQL (sin seleccionar DB aún)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Crear la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Base de datos '${process.env.DB_NAME}' lista.`);

    // Seleccionar la base de datos
    await connection.changeUser({ database: process.env.DB_NAME });

    // Crear la tabla de platos con la columna 'categoria'
    await connection.query(`
      CREATE TABLE IF NOT EXISTS platos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        descripcion TEXT,
        categoria VARCHAR(100) DEFAULT '',
        disponible BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('✅ Tabla "platos" creada o ya existente.');

    // Insertar datos iniciales si la tabla está vacía
    const [rows] = await connection.query('SELECT COUNT(*) AS count FROM platos');
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO platos (nombre, precio, descripcion, categoria)
        VALUES
          ('Enchiladas Verdes', 120, 'Enchiladas con salsa verde', 'Comida Mexicana'),
          ('Empanadas', 15, 'Empanadas de carne, pollo o queso', 'Botana'),
          ('Chiles Rellenos', 130, 'Chiles poblanos rellenos de queso y capeados', 'Comida Mexicana')
      `);
      console.log('✅ Datos iniciales insertados.');
    } else {
      console.log('ℹ️ Ya hay datos en la tabla, no se insertaron duplicados.');
    }

    await connection.end();
    console.log('🏁 Migración completada correctamente.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
})();
