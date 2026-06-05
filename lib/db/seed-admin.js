import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: 'postgresql://postgres:Rounak@localhost:5432/talent_db' });

async function run() {
  await client.connect();
  const res = await client.query(`SELECT * FROM "users" WHERE email = 'admin@matchpoint.com'`);
  if (res.rows.length === 0) {
    await client.query(`
      INSERT INTO "users" ("name", "email", "password", "role") 
      VALUES ('Admin', 'admin@matchpoint.com', 'admin123', 'admin')
    `);
    console.log('Default admin seeded.');
  } else {
    console.log('Admin already exists.');
  }
  await client.end();
}

run().catch(console.error);
