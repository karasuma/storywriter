import Database from 'better-sqlite3';
import sqlite3 from 'sqlite3';
import { Utils } from '../utils';

export type QueryResult = { [key: string]: unknown };

export class SQLite {
    public static Procedure(queries: (sqlite: SQLite) => void, filepath?: string, transaction = true): Error | null {
        const sqlite = new SQLite(filepath);
        if(transaction) sqlite.DB().prepare("BEGIN").run();
        try {
            queries(sqlite);
            if(transaction) {
                sqlite.DB().prepare("COMMIT").run();
            }
            sqlite.DB().prepare("VACUUM").run();
        } catch(ex: unknown) {
            return ex as Error;
        } finally {
            if(transaction && sqlite.DB().inTransaction) sqlite.DB().prepare("ROLLBACK").run();
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

export class PlaneSQLite {
    public static async Procedure(
        queries: (sqlite: PlaneSQLite) => Promise<void>,
        filepath?: string,
        transaction = true
    ): Promise<Error | null> {
        const sqlite = new PlaneSQLite(filepath);
        let err: Error | null = null;

        try {
            if(transaction) await sqlite.Run("BEGIN");
            await queries(sqlite);
            if(transaction) await sqlite.Run("COMMIT");
            await sqlite.Run("VACUUM");
        } catch(ex: unknown) {
            if(transaction) await sqlite.Run("ROLLBACK");
            err = ex as Error;
        }
        await sqlite.Dispose();
        return err;
    }

    public db: sqlite3.Database;
    public uid: string;

    constructor(filepath?: string) {
        this.db = new sqlite3.Database(filepath ?? ":memory:");
        this.uid = Utils.getUniqueId();
    }

    public DB(): sqlite3.Database { return this.db; }

    public async Execute(sql: string, params?: unknown[]): Promise<Array<QueryResult>> {
        if(sql.split(' ')[0].toUpperCase() === "SELECT") {
            return await this.Fetch(sql, params);
        }
        const result = await this.Run(sql, params);
        if(result !== null) {
            result.message = `${result.message}\nQuery: ${sql}\nParam: ${params?.join() ?? ""}`;
            throw result;
        }
        return new Array<QueryResult>();
    }

    public Dispose(): Promise<Error | null> {
        return new Promise(resolve => {
            this.db.close(err => resolve(err));
        });
    }

    public Run(sql: string, param?: unknown): Promise<Error | null> {
        return new Promise<Error | null>(resolve => {
            this.db.run(sql, param, err => resolve(err))
        });
    }

    public Fetch(sql: string, ...params: unknown[]): Promise<Array<QueryResult>> {
        return new Promise<Array<QueryResult>>((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if(err !== null) {
                    reject(err);
                    return;
                }
                if(rows === undefined) {
                    resolve(new Array<QueryResult>());
                    return;
                }
                const results = rows.map(r => {
                    const row: QueryResult = {};
                    let idx = 0;
                    const values = Object.values(r);
                    Object.keys(r).forEach(k => row[k] = values[idx++]);
                    return row;
                });
                resolve(results);
            });
        });
    }
}