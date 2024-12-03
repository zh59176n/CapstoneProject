const express = require('express');
const mysql = require('mysql'); // Using mysql instead of mysql2
const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pakorasamosa1!', 
    database: 'spotify_db',  
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// **GET: Basic Server Check**
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// **GET: Retrieve All Tracks**
app.get('/tracks', (req, res) => {
    const query = 'SELECT * FROM spotify_recommendations;';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving tracks:', err);
            res.status(500).send('Error retrieving tracks');
            return;
        }
        res.json(results);
    });
});

// **POST: Add a New Track**
app.post('/add', (req, res) => {
    const {
        danceability, energy, key, loudness, mode, speechiness,
        acousticness, instrumentalness, liveness, valence,
        tempo, duration_ms, time_signature, liked
    } = req.body;

    const query = `
        INSERT INTO spotify_recommendations 
        (danceability, energy, \`key\`, loudness, \`mode\`, speechiness,
        acousticness, instrumentalness, liveness, valence,
        tempo, duration_ms, time_signature, liked)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.query(
        query,
        [
            danceability, energy, key, loudness, mode, speechiness,
            acousticness, instrumentalness, liveness, valence,
            tempo, duration_ms, time_signature, liked
        ],
        (err) => {
            if (err) {
                console.error('Error adding track:', err);
                res.status(500).send('Error adding track');
                return;
            }
            res.status(201).send('Track added successfully');
        }
    );
});

// **DELETE: Remove a Track**
app.delete('/delete', (req, res) => {
    const { danceability, energy, tempo, duration_ms } = req.body;

    const query = `
        DELETE FROM spotify_recommendations 
        WHERE ABS(danceability - ?) < 0.001
        AND ABS(energy - ?) < 0.001
        AND ABS(tempo - ?) < 0.001
        AND duration_ms = ?;
    `;

    db.query(query, [danceability, energy, tempo, duration_ms], (err, result) => {
        if (err) {
            console.error('Error deleting track:', err);
            res.status(500).send('Error deleting track');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Track not found');
        } else {
            res.status(200).send('Track deleted successfully');
        }
    });
});

// **Extra Credit: Retrieve Top Danceable Tracks**
app.get('/top-danceable', (req, res) => {
    const query = `
        SELECT * FROM spotify_recommendations
        WHERE danceability > 0.8
        ORDER BY danceability DESC, tempo DESC
        LIMIT 5;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving top danceable tracks:', err);
            res.status(500).send('Error retrieving tracks');
            return;
        }
        res.json(results);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
