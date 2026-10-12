const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from Pixel folder
app.use(express.static(path.join(__dirname, 'Pixel')));

// Fallback to Pixel/index.html for any unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'Pixel', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`CampusFlow Web App running at: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
