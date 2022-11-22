import { SQLite } from "@/logics/models/file_controller/database";
import fs from "fs";

describe("database.ts", () => {
    it("can make bible database", () => {
        // Arrange
        const parts = [{s: "Genesis", n: 50}, {s: "Exodus", n: 40}];
        const sql1 = "CREATE TABLE bible(title TEXT, number INTEGER)";
        const sql2 = "INSERT INTO bible VALUES (?, ?)";
        const sql3 = "SELECT title as section, number as pages from bible";
        let result = "x";

        // Act
        SQLite.Procedure((s) => {
            s.Execute(sql1);
            parts.forEach(p => s.Execute(sql2, [p.s, p.n]));
            s.Execute(sql3, [], r => result = r[1]['section'] as string);
        });
            
        // Assert
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
        SQLite.Procedure((s) => {
            s.Execute(sql1);
            parts.forEach(p => s.Execute(sql2, [p.s, p.n]));
            s.Execute(sql3, [], r => result = r.length);
        });
            
        // Assert
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
        expect(err === null).toEqual(false);
        console.log(err?.message);
    });

    it("can make new database", () => {
        // Arrange
        const sql = "create table bible(title text, number integer)";
        const filepath = "C:\\Temp\\database.test.db";

        // Act
        SQLite.Procedure(s => {
            s.Execute(sql);
        }, filepath);

        // Assert
        const fileExists = fs.existsSync(filepath);
        expect(fileExists).toEqual(true);
        if(fileExists) fs.rmSync(filepath);
    });
});