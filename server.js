import dotenv from 'dotenv'; 
import express, { json } from 'express';
import { createPool } from 'mysql2/promise';

const app = express();
app.use(json());
dotenv.config();

// Database Connection Pool
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();

// Question 1: Retrieve all patients
app.get('/patients', async (req, res) => {
  try {
    const [patients] = await pool.query(
      'SELECT id AS patient_id, first_name, last_name, date_of_birth FROM Patients'
    );
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve patients' });
  }
});

// Question 2: Retrieve all providers
app.get('/providers', async (req, res) => {
  try {
    const [providers] = await pool.query(
      'SELECT first_name, last_name, provider_specialty FROM Providers'
    );
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve providers' });
  }
});

// Question 3: Filter patients by first name
app.get('/patients/filter', async (req, res) => {
    const { first_name } = req.query;
    if (!first_name) {
      return res.status(400).json({ error: 'Please provide a first name to filter' });
    }
    
    try {
      const [patients] = await pool.query(
        'SELECT id AS patient_id, first_name, last_name, date_of_birth FROM Patients WHERE first_name = ?',
        [first_name]
      );
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: 'Failed to filter patients' });
    }
  });
  

// Question 4: Retrieve all providers by their specialty
app.get('/providers/specialty', async (req, res) => {
  const { provider_specialty } = req.query;
  if (!provider_specialty) {
    return res.status(400).json({ error: 'Please provide a provider specialty to filter' });
  }

  try {
    const [providers] = await pool.query(
      'SELECT first_name, last_name, provider_specialty FROM Providers WHERE provider_specialty = ?',
      [provider_specialty]
    );
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to filter providers' });
  }
});

// Listen to the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
