import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export let useLocalDB = false;
export const DATA_DIR = path.join(__dirname, '../../data');

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.log('⚠️  No MONGO_URI found in environment config.');
    enableLocalDB();
    return;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.error('❌ MongoDB Connection failed:', error);
    console.log('⚠️ Switching to Local JSON Database fallback...');
    enableLocalDB();
  }
}

function enableLocalDB() {
  useLocalDB = true;
  console.log('📂 Local JSON Database Fallback Enabled.');
  
  // Ensure data folder exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Created local data directory at: ${DATA_DIR}`);
  }

  // Initialize JSON files if they don't exist
  const files = ['users.json', 'vocabs.json', 'lessons.json', 'progress.json'];
  files.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      console.log(`📄 Created initial data file: ${file}`);
    }
  });
}
