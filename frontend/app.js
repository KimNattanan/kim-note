const express = require('express');
const app = express();

app.use(express.static('public'));

const PORT = process.env.FRONTEND_PORT || 3000;
app.listen(PORT,()=>{
  console.log(`Frontend server running at http://localhost:${PORT}/`);
});