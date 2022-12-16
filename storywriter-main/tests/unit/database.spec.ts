import { PlaneSQLite, SQLite } from "@/logics/models/file_controller/database";
import fs from "fs";

const defaultFilepath = "C:\\Temp\\database.test.db";

describe("database.ts (w/ better-sqlite3)", () => {

    it("can make bible database", () => {
        // Arrange
        const parts = [{s: "Genesis", n: 50}, {s: "Exodus", n: 40}];
        const sql1 = "CREATE TABLE bible(title TEXT, number INTEGER)";
        const sql2 = "INSERT INTO bible VALUES (?, ?)";
        const sql3 = "SELECT title as section, number as pages from bible";
        let result = "x";

        // Act
        const dbResult = SQLite.Procedure((s) => {
            s.Execute(sql1);
            parts.forEach(p => s.Execute(sql2, [p.s, p.n]));
            s.Execute(sql3, [], r => result = r[1]['section'] as string);
        });
            
        // Assert
        if(dbResult instanceof Error) console.log(dbResult.message);
        expect(result).toEqual("Exodus");
    });

    it("can get empty data", () => {
        // Arrange
        const parts = [{s: "Genesis", n: 50}, {s: "Exodus", n: 40}];
        const sql1 = "CREATE TABLE bible(title TEXT, number INTEGER)";
        const sql2 = "INSERT INTO bible VALUES (?, ?)";
        const sql3 = "SELECT title as section, number as pages from bible where section = 'Psalm'";
        let result = -1;

        // Act
        const dbResult = SQLite.Procedure((s) => {
            s.Execute(sql1);
            parts.forEach(p => s.Execute(sql2, [p.s, p.n]));
            s.Execute(sql3, [], r => result = r.length);
        });
            
        // Assert
        if(dbResult instanceof Error) console.log(dbResult.message);
        expect(result).toEqual(0);
    });

    it("Occurs SQL error", () => {
        // Arrange
        const sql_init = "CREATE TABLE bible(title TEXT, number INTEGER)";
        const parts = {s: "Genesis", n: "Fifty", x: 50};
        const err_sql1 = "INSERT INTO bible VALUES (?, ?)";
        const err_sql2 = "SELECT col1 as unknown from bible";
        const err_sql3 = "UPDATE bible set greeting = 'Hello'";

        // Act
        const err = SQLite.Procedure((s) => {
            s.Execute(sql_init);
            s.Execute(err_sql1, [parts.s, parts.n, parts.x]);
            s.Execute(err_sql2);
            s.Execute(err_sql3);
        });
            
        // Assert
        if(err instanceof Error) console.log(err.message);
        expect(err === null).toEqual(false);
    });

    it("can make new database", () => {
        // Arrange
        const sql = "create table bible(title text, number integer)";

        // Act
        SQLite.Procedure(s => {
            s.Execute(sql);
        }, defaultFilepath);

        // Assert
        const fileExists = fs.existsSync(defaultFilepath);
        expect(fileExists).toEqual(true);
        if(fileExists) fs.unlinkSync(defaultFilepath);
    });
});

describe("database.ts (w/ node-sqlite3)", () => {
    it.only("can make bible database", async () => {
        // Arrange
        const parts = [{s: "Genesis", n: 50}, {s: "Exodus", n: 40}];
        const sql1 = "CREATE TABLE bible(title TEXT, number INTEGER)";
        const sql2 = "INSERT INTO bible VALUES (?, ?)";
        const sql3 = "SELECT title as section, number as pages from bible";
        let result = "x";

        // Act
        const dbResult = await PlaneSQLite.Procedure(async s => {
            console.log("can make bible database")
            await s.Execute(sql1);
            for (const p of parts) {
                await s.Execute(sql2, [p.s, p.n]);
            }
            result = (await s.Execute(sql3))[1]['section'] as string;
        });
            
        // Assert
        if(dbResult instanceof Error) console.log(dbResult.message);
        expect(result).toEqual("Exodus");
    });

    it("can get empty data", async () => {
        // Arrange
        const parts = [{s: "Genesis", n: 50}, {s: "Exodus", n: 40}];
        const sql1 = "CREATE TABLE bible(title TEXT, number INTEGER)";
        const sql2 = "INSERT INTO bible VALUES (?, ?)";
        const sql3 = "SELECT title as section, number as pages from bible where section = 'Psalm'";
        let result = -1;

        // Act
        const dbResult = await PlaneSQLite.Procedure(async s => {
            await s.Execute(sql1);
            parts.forEach(async p => await s.Execute(sql2, [p.s, p.n]));
            result = (await s.Execute(sql3)).length;
        });
            
        // Assert
        if(dbResult instanceof Error) console.log(dbResult.message);
        expect(result).toEqual(0);
    });

    it("Occurs SQL error", async () => {
        // Arrange
        const sql_init = "CREATE TABLE bible(title TEXT, number INTEGER)";
        const parts = {s: "Genesis", n: "Fifty", x: 50};
        const err_sql1 = "INSERT INTO bible VALUES (?, ?)";
        const err_sql2 = "SELECT col1 as unknown from bible";
        const err_sql3 = "UPDATE bible set greeting = 'Hello'";

        // Act
        const err = await PlaneSQLite.Procedure(async s => {
            console.log("Occurs SQL error")
            await s.Execute(sql_init);
            await s.Execute(err_sql1, [parts.s, parts.n, parts.x]);
            await s.Execute(err_sql2);
            await s.Execute(err_sql3);
        });
            
        // Assert
        if(err instanceof Error) console.log(err.message);
        expect(err === null).toEqual(false);
    });

    it("can make new database", async () => {
        // Arrange
        const sql = "create table bible(title text, number integer)";

        // Act
        await PlaneSQLite.Procedure(async s => {
            await s.Execute(sql);
        }, defaultFilepath);

        // Assert
        const fileExists = fs.existsSync(defaultFilepath);
        expect(fileExists).toEqual(true);
        if(fileExists) fs.unlinkSync(defaultFilepath);
    });
});