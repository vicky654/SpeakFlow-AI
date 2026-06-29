import fs from 'fs';
import path from 'path';
import { DATA_DIR } from './db';

export const localDb = {
  readData<T>(filename: string): T[] {
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
  },

  writeData<T>(filename: string, data: T[]): void {
    const filePath = path.join(DATA_DIR, filename);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Error writing ${filename}:`, e);
    }
  },

  // Helper getters/setters for collections
  getCollection<T>(name: 'users' | 'vocabs' | 'lessons' | 'progress'): T[] {
    return this.readData<T>(`${name}.json`);
  },

  saveCollection<T>(name: 'users' | 'vocabs' | 'lessons' | 'progress', data: T[]): void {
    this.writeData<T>(`${name}.json`, data);
  }
};
