import Database from 'better-sqlite3';

export type QueryResult = { [key: string]: unknown };

export class SQLite {
    public static Procedure(queries: (sqlite: SQLite) => void, filepath?: string): Error | null {
        const sqlite = new SQLite(filepath);
        sqlite.DB().prepare("BEGIN").run();
        try {
            queries(sqlite);
            sqlite.DB().prepare("COMMIT").run();
            sqlite.DB().prepare("VACUUM").run();
        } catch(ex: unknown) {
            return ex as Error;
        } finally {
            if(sqlite.DB().inTransaction) sqlite.DB().prepare("ROLLBACK").run();
            sqlite.Dispose();
        }
        return null;
    }

    public db: Database.Database;

    constructor(filepath?: string) {
        this.db = new Database(filepath ?? ":memory:");
    }

    public DB(): Database.Database { return this.db; }

    public Execute(sql: string, params?: unknown[], callback?: (row: Array<QueryResult>) => void): void {
        try {
            const statement = this.db.prepare(sql);
            if(params === undefined || sql.split(' ')[0].toLowerCase() !== "select") {
                statement.run(params ?? []);
                if(callback !== undefined) callback(new Array<QueryResult>());
            } else {
                const result = statement.all(params);
                if(callback !== undefined) callback(result as QueryResult[]);
            }
        } catch(ex: unknown) {
            const err = ex as Error;
            err.message = `${err.message}\nQuery: ${sql}\nParam: ${params?.join() ?? ""}`;
            throw err;
        }
    } 

    public Dispose(): void {
        this.db.close();
    }
}