const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data.json');

const readData = () => {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) { return []; }
};

const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// API: Seznam a filtrace
app.get('/items', (req, res) => {
    let data = readData();
    const { search } = req.query;
    if (search) {
        data = data.filter(s => s.nazev.toLowerCase().includes(search.toLowerCase()));
    }
    res.json(data);
});

// API: Vytvoření
app.post('/items', (req, res) => {
    const data = readData();
    data.push({ id: Date.now(), ...req.body });
    writeData(data);
    res.redirect('/admin.html');
});

// API: Editace
app.post('/edit/:id', (req, res) => {
    let data = readData();
    const index = data.findIndex(s => s.id == req.params.id);
    if (index !== -1) {
        data[index] = { id: Number(req.params.id), ...req.body };
        writeData(data);
    }
    res.redirect('/admin.html');
});

// API: Smazání
app.post('/delete/:id', (req, res) => {
    let data = readData();
    data = data.filter(s => s.id != req.params.id);
    writeData(data);
    res.redirect('/admin.html');
});

app.listen(PORT, () => {
    console.log(`Server bezi na http://localhost:${PORT}`);
});