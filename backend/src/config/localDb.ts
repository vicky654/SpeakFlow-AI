import fs from 'fs';
import path from 'path';
import { DATA_DIR } from './db';

function readData<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T[];
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
    return [];
  }
}

function writeData<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error writing ${filename}:`, e);
  }
}

type CollectionName = 'users' | 'vocabs' | 'lessons' | 'progress' | 'challengeDays' | 'challengeProgress';

export const localDb = {
  readData,
  writeData,

  getCollection<T>(name: CollectionName): T[] {
    return readData<T>(`${name}.json`);
  },

  saveCollection<T>(name: CollectionName, data: T[]): void {
    writeData<T>(`${name}.json`, data);
  }
};
