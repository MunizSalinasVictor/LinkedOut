const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.listen(5500, () => {
  console.log('Servidor estático en http://localhost:5500');
});
