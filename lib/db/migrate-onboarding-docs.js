import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: 'postgresql://postgres:Rounak@localhost:5432/talent_db' });

async function run() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "onboarding_documents" (
        "id" serial PRIMARY KEY NOT NULL,
        "onboarding_id" integer NOT NULL,
        "file_name" text NOT NULL,
        "file_url" text NOT NULL,
        "file_type" text NOT NULL,
        "uploaded_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log('Created onboarding_documents table successfully.');
  } catch (err) {
    console.error(err);
  }
  await client.end();
}

run().catch(console.error);
