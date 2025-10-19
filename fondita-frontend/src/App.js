import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [platos, setPlatos] = useState([]);
  const [modo, setModo] = useState('ver'); // 'ver' o 'admin'
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
        // ACTUALIZAR
        const res = await fetch(`${API}/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const platoActualizado = await res.json();

        if (!platoActualizado || !platoActualizado.id) {
          console.error('Error: plato actualizado no válido', platoActualizado);
          alert('No se pudo actualizar el plato');
          return;
        }

        setPlatos(platos.map(p =>
          p.id === Number(editandoId)
            ? {
                ...p,
                nombre: platoActualizado.nombre || '',
                precio: parseFloat(platoActualizado.precio) || 0,
                descripcion: platoActualizado.descripcion || '',
                categoria: platoActualizado.categoria || '',
                disponible: platoActualizado.disponible === 1 || platoActualizado.disponible === true
              }
            : p
        ));
        setEditandoId(null);
      } else {
        // CREAR
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const nuevoPlato = await res.json();
        setPlatos([...platos, {
          id: nuevoPlato.id,
          nombre: nuevoPlato.nombre || '',
          precio: parseFloat(nuevoPlato.precio) || 0,
          descripcion: nuevoPlato.descripcion || '',
          categoria: nuevoPlato.categoria || '',
          disponible: nuevoPlato.disponible === 1 || nuevoPlato.disponible === true
        }]);
      }

      // Limpiar formulario
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

  // Filtrado seguro
  const platosFiltrados = platos.filter(p =>
    (p.nombre || '').toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="app">
      {/* PORTADA */}
      <div className="portada">
        <h1>🍲 Mi Fondita</h1>
        <p>¡Disfruta los mejores antojitos veracruzanos!</p>
      </div>

      <header className="header">
        <nav>
          <button className={modo === 'ver' ? 'activo' : ''} onClick={() => setModo('ver')}>
            Ver Menú
          </button>
          <button className={modo === 'admin' ? 'activo' : ''} onClick={() => setModo('admin')}>
            Admin
          </button>
        </nav>
      </header>

      {/* MODO VER */}
      {modo === 'ver' ? (
        <div className="menu">
          <h2>Nuestro Menú</h2>
          <input
            type="text"
            placeholder="Buscar plato..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="platos-grid">
            {platosFiltrados.map(plato => (
              <div key={plato.id} className="plato-card">
                <h3>{plato.nombre}</h3>
                <p className="descripcion">{plato.descripcion}</p>
                <p className="precio">${plato.precio.toFixed(2)}</p>
                <p className={plato.disponible ? 'disponible' : 'no-disponible'}>
                  {plato.disponible ? 'Disponible ✅' : 'No disponible ❌'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MODO ADMIN */
        <div className="admin">
          <h2>Administración del Menú</h2>

          <form onSubmit={agregarOActualizar} className="formulario">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del plato"
              value={formData.nombre}
              onChange={manejarCambio}
              required
            />
            <input
              type="number"
              name="precio"
              placeholder="Precio"
              value={formData.precio}
              onChange={manejarCambio}
              required
            />
            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={formData.descripcion}
              onChange={manejarCambio}
            ></textarea>
            <input
              type="text"
              name="categoria"
              placeholder="Categoría"
              value={formData.categoria}
              onChange={manejarCambio}
            />
            <label>
              <input
                type="checkbox"
                name="disponible"
                checked={formData.disponible}
                onChange={manejarCambio}
              />
              Disponible
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
              <div key={plato.id} className="plato-admin">
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
