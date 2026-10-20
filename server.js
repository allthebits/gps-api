import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();   // Load .env

const { Pool } = pg;
const app = express();

app.use(express.json());
app.use(cors());

// Cache pools so we don't recreate them
const pools = {};
const allowedDBs = ["nmea", "gps", "analytics"];

function getPool(dbname) {
  if (!pools[dbname]) {
    pools[dbname] = new Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: dbname,                     // dynamic DB name
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      max: 10
    });
  }
  return pools[dbname];
}

// POST /api/query/:dbname
app.post("/api/query/:dbname", async (req, res) => {
  const dbname = req.params.dbname;
  const sql = req.body.sql;

  if (!sql) {
    return res.status(400).json({ error: "SQL query missing" });
  }

  const normalizedSql = sql.trim().toLowerCase();
  const forbiddenPattern = /\b(insert|update|delete|drop|alter|create|truncate|replace|grant|revoke)\b/i;

  if (!normalizedSql.startsWith("select") || sql.includes(';') || forbiddenPattern.test(sql)) {
    return res.status(400).json({ error: "Only single SELECT queries are allowed" });
  }

  if (!allowedDBs.includes(dbname)) {
    return res.status(400).json({ error: "Invalid database" });
  }

  console.log(`[${dbname}] ${sql}`);
  
  try {
    const pool = getPool(dbname);

    const start = Date.now();
    
    const result = await pool.query({ text: sql, statement_timeout: 5000 });
    
    console.log(`Query took ${Date.now() - start}ms - \n\t ${dbname}] ${sql}`);

    res.json({
        rows: result.rows,
        count: result.rowCount
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});
