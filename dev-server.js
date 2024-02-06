// Express server - only for dev purposes


const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const file_name = path.join(__dirname, "index.html");

app.use(express.static(__dirname));


app.get('*', (req, res) => {

  res.sendFile(file_name);

})

app.listen(port, () => {

  console.log(`App listening on port ${port}`);

})