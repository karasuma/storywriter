import Database from 'better-sqlite3';

export type QueryResult = { [key: string]: unknown };

export class SQLite {
    public static Procedure(queries: (sqlite: SQLite) => void, filepath?: string): void {
        const sqlite = new SQLite(filepath);
        queries(sqlite);
        sqlite.Dispose();
    }

    public db: Database.Database;

    constructor(filepath?: string) {
        this.db = new Database(filepath ?? ":memory:");
    }

    public Execute(sql: string, params?: unknown[], callback?: (row: Array<QueryResult>) => void): Error | null {
        try {
            const statement = this.db.prepare(sql);
            if(params === undefined || sql.split(' ')[0].toLowerCase() !== "select") {
                statement.run(params ?? []);
                if(callback !== undefined) callback(new Array<QueryResult>());
                return null;
            }
            const result = statement.all(params);
            if(callback !== undefined) callback(result as QueryResult[]);
        } catch(ex: unknown) {
            return ex as Error;
        }
        return null;
    } 

    public Dispose(): void {
        this.db.close();
    }
}