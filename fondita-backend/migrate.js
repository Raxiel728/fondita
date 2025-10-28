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
            ('Picada Sencilla', 14, 'Salsa, queso fresco, cebolla y frijoles. Salsas disponibles: ranchera, verde con aguacate, tomate, chipotle o habanera.', 'Picadas y Gordas'),
            ('Gorda Blanca', 14, 'Salsa y queso fresco. Salsas disponibles: ranchera, verde con aguacate, tomate, chipotle o habanera.', 'Picadas y Gordas'),
            ('Gorda Dulce', 14, 'Salsa, queso fresco y crema. Salsas disponibles: ranchera, verde con aguacate, tomate, chipotle o habanera.', 'Picadas y Gordas'),
            ('Gorda Negra', 14, 'Salsa, queso fresco y crema. Salsas disponibles: ranchera, verde con aguacate, tomate, chipotle o habanera.', 'Picadas y Gordas'),
            ('Picada preparada', 22, 'Preparada con picadillo, pollo, longaniza o huevo. Incluye salsa, queso fresco y cebolla.', 'Picadas y Gordas'),
            ('Gorda preparada', 22, 'Preparada con picadillo, pollo, longaniza o huevo. Incluye salsa y queso fresco.', 'Picadas y Gordas'),
            ('Empanada', 18, 'Rellena de queso de hebra, picadillo, pollo o longaniza. Se sirve con salsa, crema y queso fresco.', 'Empanadas'),
            ('Empanada Negra', 22, 'Rellena de queso de hebra, picadillo, pollo o longaniza. Se sirve con salsa, crema y queso fresco.', 'Empanadas'),
            ('Empanada Dulce', 22, 'Rellena de queso de hebra, picadillo, pollo o longaniza. Se sirve con salsa, crema y queso fresco.', 'Empanadas'),
            ('Quesadilla Chica', 18, 'Queso de hebra como base, con picadillo, pollo o longaniza. Acompañada de salsa, crema y queso fresco.', 'Quesadillas'),
            ('Quesadilla Grande', 55, 'Queso de hebra como base, con picadillo, pollo o longaniza. Acompañada de salsa, crema y queso fresco.', 'Quesadillas'),
            ('Salsa Extra', 5, 'Porción adicional de salsa.', 'Complementos'),
            ('Chilaquiles Sencillos', 50, 'Totopos con salsa, crema y queso fresco.', 'Desayunos'),
            ('Chilaquiles preparados', 65, 'Chilaquiles con huevo estrellado o revuelto, o longaniza.', 'Desayunos'),
            ('Huevos al Gusto', 60, 'Dos huevos con jamón, longaniza o a la mexicana, acompañados con frijol de bola, queso fresco, salsa y tres tortillas hechas a mano.', 'Desayunos'),
            ('Torta de Pibil', 50.00, 'Torta con mayonesa, cebolla y habanero', 'Tortas'),
            ('Taco de Pibil', 11.00, 'Taco de cochinita pibil', 'Tacos'),
            ('Promo 5 Tacos de Pibil', 50.00, 'Promoción de 5 tacos de pibil', 'Promociones'),
            ('Agua de Horchata 1 lt', 30.00, 'Agua fresca de horchata', 'Bebidas'),
            ('Agua de Jamaica 1 lt', 30.00, 'Agua fresca de jamaica', 'Bebidas'),
            ('Coca Cola 600 ml', 25.00, 'Refresco Coca Cola de 600 ml', 'Bebidas'),
            ('Café con leche', 20.00, 'Café con leche caliente', 'Bebidas'),
            ('Agua para café', 15.00, 'Agua caliente para preparar café', 'Bebidas'),
            ('Refresco', 25.00, 'Refrescos varios', 'Bebidas'),
            ('Licuado de Fresa 500 ml', 40.00, 'Licuado de fresa 500 ml', 'Licuados'),
            ('Licuado de Fresa 1 lt', 70.00, 'Licuado de fresa 1 litro', 'Licuados'),
            ('Licuado de Plátano o Chocomilk 500 ml', 35.00, 'Licuado de plátano o chocomilk 500 ml', 'Licuados'),
            ('Licuado de Plátano o Chocomilk 1 lt', 50.00, 'Licuado de plátano o chocomilk 1 litro', 'Licuados'),
            ('Hielito', 20.00, 'Hielito sabor a fruta', 'Postres'),
            ('Chamoyada', 35.00, 'Chamoyada con frutas y chamoy', 'Postres');
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
