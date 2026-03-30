const express = require('express');
const mysql = require('mysql2');
const { XMLParser } = require('fast-xml-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Conexao com o banco
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'guarda_db'
});

app.post('/upload', upload.single('xmlFile'), (req, res) => {
    const filePath = req.file.path;
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    
    // De XML para JSON
    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);
    
    // Salva no banco de dados
    const sql = 'INSERT INTO items (name, value) VALUES ?';
    const values = data.map(item => [item.name, item.value]);
    
    db.query(sql, [values], (err, result) => {
        if (err) throw err;
        res.send('Arquivo importado com sucesso');
    });
});