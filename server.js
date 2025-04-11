const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers statiques depuis le dossier build
app.use(express.static(path.join(__dirname, 'build')));
app.use('/packs', express.static(path.join(__dirname, 'public/packs')));
app.use('/sounds', express.static(path.join(__dirname, 'public/sounds')));

// Route pour l'application React
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
