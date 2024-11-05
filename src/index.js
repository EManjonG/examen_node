// src/server.js

// Carga de los módulos
const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

// Obtener el número del puerto
const PORT = process.env.PORT || 4000;

// Cargar los datos
const datos = require('../data/ebooks.json');

// Ordenar por apellido del autor
datos.sort((a, b) => a.autor_apellido.localeCompare(b.autor_apellido, 'es-ES'));

// Indicar la ruta de los ficheros estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Ruta Home = Raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta API Global
app.get('/api', (req, res) => {
  res.json(datos);
});

// Ruta para filtrar los autores por el apellido
app.get('/api/apellido/:autor_apellido', (req, res) => {
  const apellido = req.params.autor_apellido.toLowerCase();
  const filtroAutores = datos.filter(autor => autor.autor_apellido.toLowerCase() === apellido);
  if (filtroAutores.length === 0) {
    return res.status(404).send("Autor no encontrado");
  }
  res.json(filtroAutores);
});

// Ruta para filtrar por nombre y apellido del autor
app.get('/api/nombre_apellido/:autor_nombre/:autor_apellido', (req, res) => {
  const nombre = req.params.autor_nombre.toLowerCase();
  const apellido = req.params.autor_apellido.toLowerCase();
  const filtroAutores = datos.filter(autor => 
    autor.autor_nombre.toLowerCase() === nombre && 
    autor.autor_apellido.toLowerCase() === apellido
  );
  if (filtroAutores.length === 0) {
    return res.status(404).send("Autor no encontrado");
  }
  res.json(filtroAutores);
});

// Ruta para filtrar por nombre y primeras letras del apellido
app.get('/api/nombre/:nombre', (req, res) => {
  const nombre = req.params.nombre.toLowerCase();
  const apellido = req.query.apellido;
  
  if (!apellido) {
    const filtroAutores = datos.filter(autor => autor.autor_nombre.toLowerCase() === nombre);
    if (filtroAutores.length === 0) {
      return res.status(404).send("Autor no encontrado");
    }
    return res.json(filtroAutores);
  }

  const letras = apellido.length;
  const filtroAutores = datos.filter(autor => 
    autor.autor_nombre.toLowerCase() === nombre &&
    autor.autor_apellido.toLowerCase().startsWith(apellido.toLowerCase())
  );
  
  if (filtroAutores.length === 0) {
    return res.status(404).send("Autor no encontrado");
  }
  res.json(filtroAutores);
});

// Ruta para filtrar por año de edición
app.get('/api/edicion/:year', (req, res) => {
  const year = parseInt(req.params.year);
  const obras = datos.flatMap(autor => autor.obras).filter(obra => obra.edicion === year);
  
  if (obras.length === 0) {
    return res.status(404).send(`No se encontraron obras del año ${year}`);
  }
  res.json(obras);
});

// Cargar la página 404
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '../public/error-404.html')));

// Poner el puerto en escucha
app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
