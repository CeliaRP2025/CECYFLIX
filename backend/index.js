require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const peliculasRouter = require('./routes/peliculas'); // ✅ solo aquí

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Mostrar API KEY (solo para pruebas)
console.log("API KEY:", process.env.OPENROUTER_API_KEY);

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Ruta para recomendaciones IA
app.post('/api/recomendaciones', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/cypher-alpha:free',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const recomendacion = response.data.choices[0].message.content;
    res.json({ recomendacion });
  } catch (error) {
    console.error('Error en la API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error en el servidor proxy' });
  }
});

// Ruta de películas
app.use('/api/peliculas', peliculasRouter);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
