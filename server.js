const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Tomamos la clave de la API de manera segura desde las variables de entorno
const API_KEY = process.env.GEMINI_API_KEY;

app.post(['/api/analyzeFood', '/analyzeFood'], async (req, res) => {
    try {
        const { text, image } = req.body;
        const prompt = `Analiza el alimento proporcionado. Calcula y devuelve ÚNICAMENTE un objeto JSON válido con los campos: name, calories, protein, carbs, fat. Texto del usuario: "${text || ''}"`;

        let parts = [{ text: prompt }];
        if (image) {
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: image
                }
            });
        }

        // Petición HTTP directa a la API oficial usando el modelo seguro y la variable de entorno
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Error al comunicarse con Gemini');
        }

        const resultText = data.candidates[0].content.parts[0].text;
        res.json({ result: resultText });
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});