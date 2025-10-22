import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import imagenFondita from './assets/antojitos_veracruzanos.jpg';

export default function App() {
  const [platos, setPlatos] = useState([]);
  const [modo, setModo] = useState('presentacion');
  const [rol, setRol] = useState('cliente');
  const [claveAdmin, setClaveAdmin] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    categoria: '',
    disponible: true
  });
  const [editandoId, setEditandoId] = useState(null);
  const [buscar, setBuscar] = useState('');

  const API = 'http://localhost:5000/api/platos';

  useEffect(() => {
    cargarPlatos();
  }, []);

  const cargarPlatos = async () => {
    try {
      const res = await fetch(API);
      const datos = await res.json();
      const normalizados = datos.map(p => ({
        id: p.id,
        nombre: p.nombre || '',
        precio: parseFloat(p.precio) || 0,
        descripcion: p.descripcion || '',
        categoria: p.categoria || '',
        disponible: p.disponible === 1 || p.disponible === true
      }));
      setPlatos(normalizados);
    } catch (error) {
      console.error('Error al cargar platos:', error);
    }
  };

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const agregarOActualizar = async (e) => {
    e.preventDefault();
    if (!formData.nombre || formData.precio === '' || formData.precio === null) {
      alert('Nombre y precio son requeridos');
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre,
        precio: Number(formData.precio),
        descripcion: formData.descripcion || '',
        categoria: formData.categoria || '',
        disponible: formData.disponible
      };

      if (editandoId !== null) {
        const res = await fetch(`${API}/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const platoActualizado = await res.json();
        setPlatos(platos.map(p =>
          p.id === Number(editandoId)
            ? { ...platoActualizado, disponible: platoActualizado.disponible === 1 || platoActualizado.disponible === true }
            : p
        ));
        setEditandoId(null);
      } else {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const nuevoPlato = await res.json();
        setPlatos([...platos, { ...nuevoPlato, disponible: nuevoPlato.disponible === 1 || nuevoPlato.disponible === true }]);
      }

      setFormData({ nombre: '', precio: '', descripcion: '', categoria: '', disponible: true });
    } catch (error) {
      console.error('Error al guardar plato:', error);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este plato?')) return;
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      setPlatos(platos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const editar = (plato) => {
    setFormData({
      nombre: plato.nombre || '',
      precio: plato.precio,
      descripcion: plato.descripcion || '',
      categoria: plato.categoria || '',
      disponible: plato.disponible
    });
    setEditandoId(Number(plato.id));
  };

  const platosFiltrados = platos.filter(p =>
    (p.nombre || '').toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="app">
      {/* HEADER */}
      <motion.header
        className="header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 style={{ marginBottom: '15px', fontFamily: "'Poppins', sans-serif" }}>🌸 Mi Fondita Veracruzana 🌸</h1>
        <nav>
          <button className={modo === 'presentacion' ? 'activo' : ''} onClick={() => setModo('presentacion')}>
            Inicio
          </button>
          <button className={modo === 'ver' ? 'activo' : ''} onClick={() => setModo('ver')}>
            Menú
          </button>
          <button className={modo === 'admin' ? 'activo' : ''} onClick={() => setModo('admin')}>
            Administración
          </button>
        </nav>
      </motion.header>

      {/* PRESENTACIÓN */}
      {modo === 'presentacion' && (
        <motion.div
          className="presentacion"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1>🍲 Bienvenidos a Mi Fondita Veracruzana 🌿</h1>
          <p>
            Donde los sabores del Golfo se mezclan con la calidez de casa.  
            Prueba nuestras <strong>picadas, garnachas, empanadas y tamales</strong> elaborados con amor,  
            ingredientes frescos y tradición veracruzana.
          </p>
          <motion.img
            src={imagenFondita}
            alt="Antojitos veracruzanos"
            className="imagen-presentacion"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          />
          <motion.button
            className="boton-menu"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModo('ver')}
          >
            Ver el Menú 🍽️
          </motion.button>
        </motion.div>
      )}

      {/* MODO VER */}
      {modo === 'ver' && (
        <motion.div
          className="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h2>Nuestro Menú</h2>
          <input
            type="text"
            placeholder="Buscar plato..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="platos-grid">
            {platosFiltrados.length > 0 ? (
              platosFiltrados.map(plato => (
                <motion.div
                  key={plato.id}
                  className="plato-card"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3>{plato.nombre}</h3>
                  <p className="descripcion">{plato.descripcion}</p>
                  <p className="precio">${plato.precio.toFixed(2)}</p>
                  <p className={plato.disponible ? 'disponible' : 'no-disponible'}>
                    {plato.disponible ? 'Disponible ✅' : 'No disponible ❌'}
                  </p>
                </motion.div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#6a4e23' }}>No se encontraron platos con ese nombre.</p>
            )}
          </div>
        </motion.div>
      )}

      {/* LOGIN ADMIN */}
      {modo === 'admin' && rol !== 'admin' && (
        <motion.div
          className="login-admin"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2>Acceso Administrativo</h2>
          <input
            type="password"
            placeholder="Ingrese contraseña"
            value={claveAdmin}
            onChange={(e) => setClaveAdmin(e.target.value)}
          />
          <button onClick={() => {
            if (claveAdmin === '1234') setRol('admin');
            else alert('Contraseña incorrecta');
          }}>
            Ingresar
          </button>
        </motion.div>
      )}

      {/* PANEL ADMIN */}
      {modo === 'admin' && rol === 'admin' && (
        <motion.div
          className="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2>Panel de Administración</h2>

          <form onSubmit={agregarOActualizar} className="formulario">
            <input type="text" name="nombre" placeholder="Nombre del plato" value={formData.nombre} onChange={manejarCambio} required />
            <input type="number" name="precio" placeholder="Precio" value={formData.precio} onChange={manejarCambio} required />
            <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={manejarCambio}></textarea>
            <input type="text" name="categoria" placeholder="Categoría" value={formData.categoria} onChange={manejarCambio} />
            <label>
              <input type="checkbox" name="disponible" checked={formData.disponible} onChange={manejarCambio} /> Disponible
            </label>
            <button type="submit">{editandoId ? 'Actualizar Plato' : 'Agregar Plato'}</button>
            {editandoId && (
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null);
                  setFormData({ nombre: '', precio: '', descripcion: '', categoria: '', disponible: true });
                }}
              >
                Cancelar
              </button>
            )}
          </form>

          <div className="platos-admin">
            <h3>Platos Actuales</h3>
            {platos.map(plato => (
              <motion.div
                key={plato.id}
                className="plato-admin"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <strong>{plato.nombre}</strong>
                  <p>{plato.descripcion}</p>
                  <p className="precio">${plato.precio.toFixed(2)}</p>
                  <p className={plato.disponible ? 'disponible' : 'no-disponible'}>
                    {plato.disponible ? 'Disponible ✅' : 'No disponible ❌'}
                  </p>
                </div>
                <div className="botones">
                  <button onClick={() => editar(plato)} className="editar">Editar</button>
                  <button onClick={() => eliminar(plato.id)} className="eliminar">Eliminar</button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={() => { setRol('cliente'); setModo('presentacion'); setClaveAdmin(''); }}
            className="boton-menu"
            style={{ marginTop: '30px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cerrar Sesión
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
