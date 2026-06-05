import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: 'postgresql://postgres:Rounak@localhost:5432/talent_db' });

async function run() {
  await client.connect();
  try {
    await client.query(`ALTER TABLE "interviews" ADD COLUMN "video_url" text`);
    console.log('Added video_url column successfully.');
  } catch (err) {
    if (err.code === '42701') { // 42701 = duplicate_column
      console.log('Column already exists.');
    } else {
      console.error(err);
    }
  }
  await client.end();
}

run().catch(console.error);
