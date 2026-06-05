import pg from "pg";
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres:Rounak@localhost:5432/talent_db' });
async function run() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      "email" text NOT NULL,
      "password" text NOT NULL,
      "role" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "users_email_unique" UNIQUE("email")
    );
  `);
  console.log('Table created');
  await client.end();
}
run().catch(console.error);
