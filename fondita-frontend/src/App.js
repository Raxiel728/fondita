// ======================= APP.JS COMPLETO CON ADMIN OCULTO =======================
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFacebook, FaInstagram, FaWhatsapp, FaPhone, FaEnvelope, 
  FaMapMarkerAlt, FaClock, FaStar, FaUtensils, FaUsers,
  FaTimes, FaMoon, FaSun, FaArrowUp, FaLeaf, FaHeart
} from 'react-icons/fa';
import './App.css';
import imagenFondita from './assets/antojitos_veracruzanos.jpg';

export default function App() {
  const [platos, setPlatos] = useState([]);
  const [modo, setModo] = useState('presentacion');
  const [rol, setRol] = useState('cliente');
  const [claveAdmin, setClaveAdmin] = useState('');
  const [formData, setFormData] = useState({
    nombre: '', precio: '', descripcion: '', categoria: '', disponible: true
  });
  const [editandoId, setEditandoId] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [testimonioActual, setTestimonioActual] = useState(0);
  const [modalGaleria, setModalGaleria] = useState(null);
  const [contactForm, setContactForm] = useState({ nombre: '', email: '', mensaje: '' });
  
  // ⭐ NUEVO: Estado para mostrar/ocultar botón Admin
  const [mostrarAdmin, setMostrarAdmin] = useState(false);

  const API = 'http://localhost:5000/api/platos';

  // Datos de testimonios
  const testimonios = [
    { nombre: 'María García', texto: '¡Los mejores antojitos veracruzanos! El sabor a casa que tanto extrañaba.', rating: 5 },
    { nombre: 'Carlos Ruiz', texto: 'Las picadas están deliciosas y el servicio es excelente. 100% recomendado.', rating: 5 },
    { nombre: 'Ana López', texto: 'Auténtica comida veracruzana. Los tamales son mi platillo favorito.', rating: 5 }
  ];

  // Estadísticas
  const [stats, setStats] = useState({ años: 0, platillos: 0, clientes: 0 });

  // NUEVO: DETECTAR COMBINACIÓN DE TECLAS SECRETA "admin"
  useEffect(() => {
    let teclas = [];
    
    const manejarTecla = (e) => {
      teclas.push(e.key.toLowerCase());
      
      // Limitar el array a los últimos 5 caracteres
      if (teclas.length > 5) {
        teclas.shift();
      }
      
      // Combinación secreta: "admin"
      if (teclas.join('') === 'admin') {
        setMostrarAdmin(true);
        console.log('🔓 Modo administrador activado');
        teclas = [];
      }
    };

    window.addEventListener('keydown', manejarTecla);
    
    return () => {
      window.removeEventListener('keydown', manejarTecla);
    };
  }, []);

  useEffect(() => {
    cargarPlatos();
    setTimeout(() => setLoading(false), 1500);
    
    // Animación de estadísticas
    const timer = setInterval(() => {
      setStats(prev => ({
        años: prev.años < 15 ? prev.años + 1 : 15,
        platillos: prev.platillos < 50 ? prev.platillos + 2 : 50,
        clientes: prev.clientes < 1000 ? prev.clientes + 50 : 1000
      }));
    }, 50);

    // Scroll listener
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Carrusel de testimonios
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonioActual((prev) => (prev + 1) % testimonios.length);
    }, 5000);
    return () => clearInterval(timer);
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
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const agregarOActualizar = async (e) => {
    e.preventDefault();
    if (!formData.nombre || formData.precio === '') {
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
        setPlatos(platos.map(p => p.id === Number(editandoId) 
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

  const platosFiltrados = platos.filter(p => {
    const coincideNombre = (p.nombre || '').toLowerCase().includes(buscar.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'Todos' || p.categoria === categoriaFiltro;
    return coincideNombre && coincideCategoria;
  });

  const categorias = ['Todos', ...new Set(platos.map(p => p.categoria).filter(Boolean))];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enviarContacto = (e) => {
    e.preventDefault();
    alert(`Gracias ${contactForm.nombre}! Tu mensaje ha sido enviado.`);
    setContactForm({ nombre: '', email: '', mensaje: '' });
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="loading-screen">
        <motion.div
          className="loading-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaUtensils className="loading-icon" />
          <h2>Mi Fondita Veracruzana</h2>
          <div className="loading-spinner"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`app ${modoOscuro ? 'dark-mode' : ''}`}>
      {/* HEADER MEJORADO */}
      <motion.header
        className="header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="header-content">
          <div className="logo-section">
            <FaLeaf className="logo-icon" />
            <h1>Mi Fondita Veracruzana</h1>
          </div>
          
          <nav className="nav-desktop">
            <button className={modo === 'presentacion' ? 'activo' : ''} onClick={() => setModo('presentacion')}>
              Inicio
            </button>
            <button className={modo === 'ver' ? 'activo' : ''} onClick={() => setModo('ver')}>
              Menú
            </button>
            <button className={modo === 'galeria' ? 'activo' : ''} onClick={() => setModo('galeria')}>
              Galería
            </button>
            <button className={modo === 'contacto' ? 'activo' : ''} onClick={() => setModo('contacto')}>
              Contacto
            </button>
            
            {/*  BOTÓN ADMIN SOLO VISIBLE SI mostrarAdmin ES TRUE */}
            {mostrarAdmin && (
              <button 
                className={modo === 'admin' ? 'activo admin-btn' : 'admin-btn'} 
                onClick={() => setModo('admin')}
              >
                🔒 Admin
              </button>
            )}
          </nav>

          <button className="theme-toggle" onClick={() => setModoOscuro(!modoOscuro)}>
            {modoOscuro ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </motion.header>

      {/* PRESENTACIÓN MEJORADA */}
      {modo === 'presentacion' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Hero Section */}
          <section className="hero-section">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="hero-title">
                <span className="title-emoji">🍲</span> 
                Bienvenidos a Mi Fondita Veracruzana 
                <span className="title-emoji">🌿</span>
              </h1>
              <p className="hero-subtitle">
                Donde los sabores del Golfo se mezclan con la calidez de casa
              </p>
              <p className="hero-description">
                Prueba nuestras <strong>picadas, garnachas, empanadas y tamales</strong> elaborados 
                con amor, ingredientes frescos y tradición veracruzana.
              </p>
              
              <div className="hero-buttons">
                <motion.button
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModo('ver')}
                >
                  Ver el Menú <FaUtensils />
                </motion.button>
                <motion.button
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModo('contacto')}
                >
                  Contactar <FaPhone />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="hero-image"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <img src={imagenFondita} alt="Antojitos veracruzanos" />
              <div className="image-badge">
                <FaHeart /> Hecho con amor
              </div>
            </motion.div>
          </section>

          {/* Estadísticas */}
          <section className="stats-section">
            <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
              <FaClock className="stat-icon" />
              <h3>{stats.años}+</h3>
              <p>Años de experiencia</p>
            </motion.div>
            <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
              <FaUtensils className="stat-icon" />
              <h3>{stats.platillos}+</h3>
              <p>Platillos en menú</p>
            </motion.div>
            <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
              <FaUsers className="stat-icon" />
              <h3>{stats.clientes}+</h3>
              <p>Clientes satisfechos</p>
            </motion.div>
          </section>

          {/* Oferta Especial */}
          <section className="special-offer">
            <motion.div
              className="offer-content"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="offer-badge">Oferta Especial</span>
              <h2>Platillo del Día</h2>
              <p>Picadas veracruzanas con salsa verde, queso fresco y crema - Solo $45 MXN</p>
              <button className="btn-offer" onClick={() => setModo('ver')}>
                Ver Menú Completo
              </button>
            </motion.div>
          </section>

          {/* Testimonios */}
          <section className="testimonials-section">
            <h2>Lo que dicen nuestros clientes</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonioActual}
                className="testimonial-card"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="stars">
                  {[...Array(testimonios[testimonioActual].rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonios[testimonioActual].texto}"</p>
                <p className="testimonial-author">- {testimonios[testimonioActual].nombre}</p>
              </motion.div>
            </AnimatePresence>
            <div className="testimonial-dots">
              {testimonios.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === testimonioActual ? 'active' : ''}`}
                  onClick={() => setTestimonioActual(index)}
                />
              ))}
            </div>
          </section>
        </motion.div>
      )}

      {/* MENÚ MEJORADO */}
      {modo === 'ver' && (
        <motion.div
          className="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h2>Nuestro Menú</h2>
          
          <div className="menu-filters">
            <input
              type="text"
              placeholder="🔍 Buscar plato..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="search-input"
            />
            
            <div className="category-filters">
              {categorias.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${categoriaFiltro === cat ? 'active' : ''}`}
                  onClick={() => setCategoriaFiltro(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="platos-grid">
            {platosFiltrados.length > 0 ? (
              platosFiltrados.map(plato => (
                <motion.div
                  key={plato.id}
                  className="plato-card-modern"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="plato-header">
                    <span className={`badge ${plato.disponible ? 'disponible' : 'no-disponible'}`}>
                      {plato.disponible ? '✓ Disponible' : '✗ Agotado'}
                    </span>
                  </div>
                  
                  <h3>{plato.nombre}</h3>
                  <p className="descripcion">{plato.descripcion}</p>
                  
                  <div className="plato-footer">
                    <span className="precio">${plato.precio.toFixed(2)}</span>
                    <button className="btn-order">
                      Ordenar <FaWhatsapp />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-results">
                <FaUtensils />
                <p>No se encontraron platillos</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* GALERÍA */}
      {modo === 'galeria' && (
        <motion.div
          className="galeria-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>Nuestra Galería</h2>
          <div className="galeria-grid">
            {[1, 2, 3, 4, 5, 6].map((img) => (
              <motion.div
                key={img}
                className="galeria-item"
                whileHover={{ scale: 1.05 }}
                onClick={() => setModalGaleria(img)}
              >
                <img src={imagenFondita} alt={`Platillo ${img}`} />
                <div className="galeria-overlay">
                  <FaStar />
                  <p>Ver imagen</p>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {modalGaleria && (
              <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalGaleria(null)}
              >
                <motion.div
                  className="modal-content"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="modal-close" onClick={() => setModalGaleria(null)}>
                    <FaTimes />
                  </button>
                  <img src={imagenFondita} alt="Imagen ampliada" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* CONTACTO */}
      {modo === 'contacto' && (
        <motion.div
          className="contacto-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2>Contáctanos</h2>
          <div className="contacto-container">
            <div className="contacto-info">
              <div className="info-card">
                <FaMapMarkerAlt />
                <h3>Ubicación</h3>
                <p>Calle Principal #123, Veracruz, México</p>
              </div>
              <div className="info-card">
                <FaPhone />
                <h3>Teléfono</h3>
                <p>+52 229 123 4567</p>
              </div>
              <div className="info-card">
                <FaClock />
                <h3>Horario</h3>
                <p>Lun - Dom: 8:00 AM - 10:00 PM</p>
              </div>
              <div className="info-card">
                <FaEnvelope />
                <h3>Email</h3>
                <p>info@fondita.com</p>
              </div>
            </div>

            <form className="contacto-form" onSubmit={enviarContacto}>
              <input
                type="text"
                placeholder="Tu nombre"
                value={contactForm.nombre}
                onChange={(e) => setContactForm({...contactForm, nombre: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Tu email"
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                required
              />
              <textarea
                placeholder="Tu mensaje"
                value={contactForm.mensaje}
                onChange={(e) => setContactForm({...contactForm, mensaje: e.target.value})}
                required
              />
              <button type="submit" className="btn-submit">
                Enviar Mensaje <FaEnvelope />
              </button>
            </form>
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
              <button type="button" onClick={() => {
                setEditandoId(null);
                setFormData({ nombre: '', precio: '', descripcion: '', categoria: '', disponible: true });
              }}>
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
            onClick={() => { 
              setRol('cliente'); 
              setModo('presentacion'); 
              setClaveAdmin(''); 
              setMostrarAdmin(false); // Ocultar botón al cerrar sesión
            }}
            className="boton-menu"
            style={{ marginTop: '30px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cerrar Sesión
          </motion.button>
        </motion.div>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Mi Fondita Veracruzana</h3>
            <p>Auténtica comida veracruzana desde 2010</p>
            <div className="social-icons">
              <a href="#"><FaFacebook /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaWhatsapp /></a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Enlaces Rápidos</h4>
            <ul>
              <li onClick={() => setModo('presentacion')}>Inicio</li>
              <li onClick={() => setModo('ver')}>Menú</li>
              <li onClick={() => setModo('galeria')}>Galería</li>
              <li onClick={() => setModo('contacto')}>Contacto</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Horarios</h4>
            <p>Lunes - Viernes: 8:00 AM - 10:00 PM</p>
            <p>Sábado - Domingo: 9:00 AM - 11:00 PM</p>
          </div>

          <div className="footer-section">
            <h4>Contacto</h4>
            <p><FaPhone /> +52 229 123 4567</p>
            <p><FaEnvelope /> info@fondita.com</p>
            <p><FaMapMarkerAlt /> Veracruz, México</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Mi Fondita Veracruzana. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* WhatsApp Flotante */}
      <motion.a
        href="https://wa.me/522291234567"
        className="whatsapp-float"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <FaWhatsapp />
      </motion.a>

      {/* Botón Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="scroll-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
          >
            <FaArrowUp />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
