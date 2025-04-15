const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

let conn = null;
const initMySQL = async()=>{
  while (!conn) {
    try {
      conn = await mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'root',
        database: 'notesdb'
      });
    } catch (error) {
      console.log("Waiting for the database to be ready...");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const [tables] = await conn.query(`SHOW TABLES LIKE 'notes'`);

  if (tables.length === 0) {
    await conn.query(`
      CREATE TABLE notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        content TEXT
      )
    `);
    console.log("Table 'notes' created.");
  } else {
    console.log("Table 'notes' already exists.");
  }
}

app.post('/notes', async(req,res)=>{
  try{
    const results = await conn.query(`INSERT INTO notes SET title="New Note", content=""`);
    res.json({
      message: 'create done',
      data: results[0]
    });
  }catch(error){
    res.status(500).json({
      message: 'error!',
      errorMessage: error.message
    });
  }
});
app.get('/notes', async(req,res)=>{
  try{
    const [results] = await conn.query(`SELECT * FROM notes`);
    res.json(results);
  }catch(error){
    res.status(500).json({
      message: 'error!',
      errorMessage: error.message
    });
  }
});
app.get('/notes/:id', async(req,res)=>{
  try{
    const [results] = await conn.query(`SELECT * FROM notes WHERE id=?`, req.params.id);
    res.json(results[0]);
  }catch(error){
    res.status(500).json({
      message: 'error!',
      errorMessage: error.message
    });
  }
});
app.patch('/notes/:id', async(req,res)=>{
  try{
    let id = req.params.id;
    const results = await conn.query(`UPDATE notes SET ? WHERE id=?`, [req.body, id]);
    res.json({
      message: 'patch done',
      data: results[0]
    });
  }catch(error){
    res.status(500).json({
      message: 'error!',
      errorMessage: error.message
    });
  }
});
app.delete('/notes/:id', async(req,res)=>{
  try{
    let id = req.params.id;
    const results = await conn.query('DELETE FROM notes WHERE id=?',id);
    res.json({
      message: 'delete done',
      data: results[0]
    });
  }catch(error){
    res.status(500).json({
      message: 'error!',
      errorMessage: error.message
    });
  }
});

app.listen(PORT, async()=>{
  await initMySQL();
  console.log(`Backend server running at http://localhost:${PORT}/`);
});