export const getImage = (ruta) => {
  if (!ruta) return '/fallback.jpg';  // imagen por defecto

  // Si la ruta YA empieza con /uploads, entonces no agregamos nada
  if (ruta.startsWith('/uploads')) {
    return `http://localhost:5000${ruta}`;
  }

  // Si la ruta viene sin carpeta
  return `http://localhost:5000/uploads/${ruta}`;
};
