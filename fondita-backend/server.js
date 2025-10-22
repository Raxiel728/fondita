require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'fondita_db',
  APP_PORT = 5000
} = process.env;

let pool;

async function initDb() {
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log('Conectado a MySQL:', DB_HOST, DB_NAME);
}

function toBool(val) {
  return !!+val;
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuario (solo para crear cuentas nuevas)
app.post('/api/register', async (req, res) => {
  try {
    const { nombre, email, password, rol = 'cliente' } = req.body;
    if (!email || !password || !nombre)
      return res.status(400).json({ error: 'Faltan datos' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol]
    );

    res.json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('POST /api/register error:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Inicio de sesión
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const usuario = rows[0];
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // Crear token
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'clave_secreta',
      { expiresIn: '2h' }
    );

    res.json({ token, rol: usuario.rol, nombre: usuario.nombre });
  } catch (err) {
    console.error('POST /api/login error:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

function autenticarToken(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta', (err, usuario) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.usuario = usuario;
    next();
  });
}

/* RUTAS PÚBLICAS */
// Los clientes solo pueden ver los platos
app.get('/api/platos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM platos WHERE disponible = 1 ORDER BY id ASC;');
    const platos = rows.map(r => ({ ...r, disponible: toBool(r.disponible), precio: parseFloat(r.precio) }));
    res.json(platos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener platos' });
  }
});

/* RUTAS DE ADMIN */
const ADMIN_TOKEN = 'clave-super-secreta'; // <-- cámbiala por algo más seguro

// Middleware para verificar si es admin
function verificarAdmin(req, res, next) {
  const token = req.headers['authorization'];
  if (token === `Bearer ${ADMIN_TOKEN}`) {
    next(); // acceso permitido
  } else {
    res.status(403).json({ error: 'Acceso denegado' });
  }
}

// Crear nuevo plato
app.post('/api/admin/platos', verificarAdmin, async (req, res) => {
  try {
    const { nombre, precio, descripcion = '', categoria = '', disponible = true } = req.body;
    if (!nombre || precio === undefined || precio === null)
      return res.status(400).json({ error: 'Nombre y precio requeridos' });

    const [result] = await pool.query(
      'INSERT INTO platos (nombre, precio, descripcion, categoria, disponible) VALUES (?, ?, ?, ?, ?)',
      [nombre, precio, descripcion, categoria, disponible ? 1 : 0]
    );

    const [rows] = await pool.query('SELECT * FROM platos WHERE id = ? LIMIT 1', [result.insertId]);
    const plato = rows[0];
    plato.disponible = toBool(plato.disponible);
    plato.precio = parseFloat(plato.precio);
    res.status(201).json(plato);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear plato' });
  }
});

// Actualizar
app.put('/api/admin/platos/:id', verificarAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, precio, descripcion, categoria, disponible } = req.body;
    
    const [exist] = await pool.query('SELECT id FROM platos WHERE id = ? LIMIT 1', [id]);
    if (exist.length === 0) return res.status(404).json({ error: 'Plato no encontrado' });

    const updates = [];
    const params = [];
    if (nombre !== undefined) { updates.push('nombre = ?'); params.push(nombre); }
    if (precio !== undefined) { updates.push('precio = ?'); params.push(precio); }
    if (descripcion !== undefined) { updates.push('descripcion = ?'); params.push(descripcion); }
    if (categoria !== undefined) { updates.push('categoria = ?'); params.push(categoria); }
    if (disponible !== undefined) { updates.push('disponible = ?'); params.push(disponible ? 1 : 0); }

    if (updates.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' });

    await pool.query(`UPDATE platos SET ${updates.join(', ')} WHERE id = ?`, [...params, id]);

    const [rows] = await pool.query('SELECT * FROM platos WHERE id = ? LIMIT 1', [id]);
    const updated = rows[0];
    updated.disponible = toBool(updated.disponible);
    updated.precio = parseFloat(updated.precio);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar plato' });
  }
});

// Eliminar
app.delete('/api/admin/platos/:id', verificarAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM platos WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Plato no encontrado' });

    await pool.query('DELETE FROM platos WHERE id = ?', [id]);
    res.json({ mensaje: 'Plato eliminado', eliminado: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar plato' });
  }
});


app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

(async () => {
  try {
    await initDb();
    const port = process.env.APP_PORT || APP_PORT || 5000;
    app.listen(port, () => {
      console.log('Servidor corriendo en http://localhost:' + port);
    });
  } catch (err) {
    console.error('No se pudo iniciar la aplicación:', err);
    process.exit(1);
  }
})();
