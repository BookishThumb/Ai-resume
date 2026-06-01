import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export class CsvTable<T extends { id: any }> {
  private filePath: string;
  private memoryStore: T[] | null = null;
  private columns: string[];

  constructor(filename: string, columns: string[]) {
    // Assuming this is run from the workspace root (e.g. from api-server via tsx)
    this.filePath = path.join(process.cwd(), 'lib', 'db', 'data', filename);
    this.columns = columns;

    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '');
    }
  }

  private loadData(): T[] {
    if (this.memoryStore !== null) {
      return this.memoryStore;
    }
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    if (!fileContent.trim()) {
      this.memoryStore = [];
      return this.memoryStore;
    }
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      cast: (value) => {
        if (value === '') return null;
        if (value.startsWith('[') || value.startsWith('{')) {
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
        }
        if (!isNaN(Number(value)) && value.trim() !== '') {
          return Number(value);
        }
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      }
    });
    this.memoryStore = records as T[];
    return this.memoryStore;
  }

  private saveData() {
    if (this.memoryStore === null) return;
    if (this.memoryStore.length === 0) {
        fs.writeFileSync(this.filePath, '');
        return;
    }
    
    const records = this.memoryStore.map(item => {
      const serialized: any = {};
      for (const col of this.columns) {
        const v = (item as any)[col];
        if (v === undefined || v === null) {
            serialized[col] = '';
        } else if (v instanceof Date) {
          serialized[col] = v.toISOString();
        } else if (typeof v === 'object' && v !== null) {
          serialized[col] = JSON.stringify(v);
        } else {
          serialized[col] = v;
        }
      }
      return serialized;
    });

    const output = stringify(records, { header: true, columns: this.columns });
    fs.writeFileSync(this.filePath, output);
  }

  public findMany(predicate?: (item: T) => boolean): T[] {
    const data = this.loadData();
    return predicate ? data.filter(predicate) : data;
  }

  public findFirst(predicate: (item: T) => boolean): T | undefined {
    const data = this.loadData();
    return data.find(predicate);
  }

  public insert(item: T): T[] {
    const data = this.loadData();
    data.push(item);
    this.saveData();
    return [item];
  }
  
  public insertMany(items: T[]): T[] {
    const data = this.loadData();
    data.push(...items);
    this.saveData();
    return items;
  }

  public update(id: any, updates: Partial<T>): T[] {
    const data = this.loadData();
    const index = data.findIndex(i => i.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      this.saveData();
      return [data[index]];
    }
    return [];
  }

  public delete(id: any): void {
    const data = this.loadData();
    this.memoryStore = data.filter(i => i.id !== id);
    this.saveData();
  }
}
