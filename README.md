📝 Guía Detallada para Ejecutar el Proyecto "Fondita de Antojitos Veracruzanos"

Este proyecto tiene Frontend (React) y Backend (Node.js + MySQL).

Sigue estos pasos para tenerlo funcionando en tu computadora.

1️⃣ Clonar el repositorio

Abre la terminal y ejecuta:

# Clonar el repositorio
git clone https://github.com/TU_USUARIO/TU_REPO.git

# Entrar a la carpeta del proyecto
cd TU_REPO


Sustituye TU_USUARIO/TU_REPO por la URL de tu repositorio de GitHub.

2️⃣ Estructura de carpetas

Dentro del proyecto deberían existir al menos estas carpetas:

fondita/
│
├─ backend/         # Servidor Node.js + MySQL
│  ├─ server.js
│  ├─ migrate.js
│  ├─ package.json
│  └─ .env           # Variables de entorno (lo crearemos)
│
├─ frontend/        # Aplicación React
│  ├─ src/
│  ├─ public/
│  ├─ package.json
│  └─ .gitignore


Es importante mantener frontend y backend separados dentro del mismo repositorio.

3️⃣ Instalar dependencias
Backend
cd backend
npm install

Frontend
cd ../frontend
npm install

4️⃣ Configurar variables de entorno en Backend

Crea un archivo llamado .env en la carpeta backend con este contenido:

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA
DB_NAME=fondita_db
APP_PORT=5000


Cambia TU_CONTRASEÑA por la contraseña que uses en MySQL.

APP_PORT es el puerto donde correrá el backend (por defecto 5000).

5️⃣ Crear la base de datos y tablas

El backend tiene un archivo migrate.js que crea la base de datos y la tabla platos con datos iniciales.

cd backend
node migrate.js


Deberías ver mensajes como:

✅ Base de datos 'fondita_db' lista.
✅ Tabla "platos" creada o ya existente.
✅ Datos iniciales insertados.
🏁 Migración completada correctamente.


Esto asegura que el backend tenga todo listo para funcionar.

6️⃣ Ejecutar Backend y Frontend

Se recomienda abrir dos terminales:

Terminal 1 → Backend
cd backend
npm run dev


Si no tienes el script dev, ejecuta directamente:

node server.js


Deberías ver algo como:

🍽️ Servidor de "Antojitos Veracruzanos" (MySQL)
🚀 Corriendo en: http://localhost:5000

Terminal 2 → Frontend
cd frontend
npm start


Esto abrirá automáticamente el navegador en http://localhost:3000.

El frontend se conecta con el backend para mostrar los platos y permitir administración.

7️⃣ Uso del proyecto
Roles:

Cliente: Modo “Ver Menú” → Solo puede ver los platos disponibles.

Administrador: Modo “Admin” → Puede agregar, editar y eliminar platos.

Funcionalidades:

Buscar platos por nombre.

Editar y actualizar platos.

Marcar platos como disponibles o no disponibles.

Agregar nuevos platos.
