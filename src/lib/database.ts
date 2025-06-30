import initSqlJs, { Database } from 'sql.js';

class CrewDatabase {
  private db: Database | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });

    // Try to load existing database from localStorage
    const existingDb = localStorage.getItem('crewrunner_db');
    if (existingDb) {
      const buffer = new Uint8Array(JSON.parse(existingDb));
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
      this.createTables();
    }
    
    this.initialized = true;
  }

  private createTables() {
    if (!this.db) return;

    // Crews table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS crews (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        agents TEXT NOT NULL,
        tasks TEXT NOT NULL,
        process TEXT NOT NULL DEFAULT 'sequential',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'draft',
        results TEXT
      )
    `);

    // Executions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS executions (
        id TEXT PRIMARY KEY,
        crew_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'running',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        results TEXT,
        logs TEXT,
        FOREIGN KEY (crew_id) REFERENCES crews (id)
      )
    `);

    this.saveToStorage();
  }

  private saveToStorage() {
    if (!this.db) return;
    const data = this.db.export();
    localStorage.setItem('crewrunner_db', JSON.stringify(Array.from(data)));
  }

  async saveCrewToDB(crew: any) {
    await this.init();
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO crews 
      (id, name, description, agents, tasks, process, status, results, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run([
      crew.id,
      crew.name,
      crew.description,
      JSON.stringify(crew.agents),
      JSON.stringify(crew.tasks),
      crew.process,
      crew.status,
      crew.results || null
    ]);

    stmt.free();
    this.saveToStorage();
  }

  async getCrews() {
    await this.init();
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT * FROM crews ORDER BY updated_at DESC
    `);

    const crews = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      crews.push({
        ...row,
        agents: JSON.parse(row.agents as string),
        tasks: JSON.parse(row.tasks as string),
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string)
      });
    }

    stmt.free();
    return crews;
  }

  async getCrew(id: string) {
    await this.init();
    if (!this.db) return null;

    const stmt = this.db.prepare(`SELECT * FROM crews WHERE id = ?`);
    stmt.bind([id]);

    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return {
        ...row,
        agents: JSON.parse(row.agents as string),
        tasks: JSON.parse(row.tasks as string),
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string)
      };
    }

    stmt.free();
    return null;
  }

  async deleteCrew(id: string) {
    await this.init();
    if (!this.db) return;

    const stmt = this.db.prepare(`DELETE FROM crews WHERE id = ?`);
    stmt.run([id]);
    stmt.free();
    this.saveToStorage();
  }

  async saveExecution(execution: any) {
    await this.init();
    if (!this.db) return;

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO executions 
      (id, crew_id, status, started_at, completed_at, results, logs)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      execution.id,
      execution.crewId,
      execution.status,
      execution.startedAt.toISOString(),
      execution.completedAt?.toISOString() || null,
      execution.results || null,
      JSON.stringify(execution.logs || [])
    ]);

    stmt.free();
    this.saveToStorage();
  }

  async getExecutions(crewId: string) {
    await this.init();
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT * FROM executions WHERE crew_id = ? ORDER BY started_at DESC
    `);

    const executions = [];
    stmt.bind([crewId]);
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      executions.push({
        ...row,
        logs: JSON.parse(row.logs as string || '[]'),
        startedAt: new Date(row.started_at as string),
        completedAt: row.completed_at ? new Date(row.completed_at as string) : undefined
      });
    }

    stmt.free();
    return executions;
  }
}

export const db = new CrewDatabase();