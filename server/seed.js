import dotenv from 'dotenv';
import { initDatabase, resetAndSeed } from './dataStore.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/volunteerhub';

async function runSeed() {
  console.log('--- VolunteerHub Database Seed Process Started ---');
  await initDatabase(MONGO_URI);
  const result = await resetAndSeed();
  console.log(result.message);
  console.log('--- VolunteerHub Database Seed Completed Successfully ---');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('Seed process failed:', err);
  process.exit(1);
});
