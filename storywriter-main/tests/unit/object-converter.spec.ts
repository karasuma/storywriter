import { PlaneSQLite, SQLite } from "@/logics/models/file_controller/database";
import { SQLiteConverter, SQLiteConverterAsync } from "@/logics/models/file_controller/object-converter";
import { StoryWriterObjectSample } from "@/logics/models/storywriter-object";
import fs from "fs";

describe("object-converter.ts (w/ better-sqlite3)", () => {
    it("can make DB structure of savedata", () => {
        // Arrange
        const conv = new SQLiteConverter();
        const filepath = "C:\\Temp\\savedata.test.db";
        if(fs.existsSync(filepath)) fs.rmSync(filepath);

        // Act
        conv.MakeDatabase(filepath);

        // Assert
        const fileExists = fs.existsSync(filepath);
        expect(fileExists).toEqual(true);
    });
    it("can save data to DB", () => {
        // Arrange
        const conv = new SQLiteConverter();
        const filepath = "C:\\Temp\\storywriter1.test.db";

        // Act
        const err = conv.Save(filepath, new StoryWriterObjectSample());
        SQLite.Procedure(s => {
            s.Execute(`select count(id) as cnt from memo`);
        }, filepath, false);

        // Assert
        if(err !== null) console.log(err.message);
        expect(err === null).toEqual(true);
    });
    it("can load data from DB", () => {
        // Arrange
        const conv = new SQLiteConverter();
        const filepath = "C:\\Temp\\storywriter.sample.db";
        let stories = 0;

        // Act
        const result = conv.Load(filepath);
        const isErr = result instanceof Error;
        if(!isErr) {
            SQLite.Procedure(s => {
                s.Execute("select count(*) as cnt from story", [], r => stories = r[0]['cnt'] as number);
            }, filepath, false);
        }

        // Assert
        if(isErr) console.log((result as Error).message);
        expect(!isErr && stories === 9).toEqual(true);
    });
});

describe("object-converter.ts (w/ node-sqlite3)", () => {
    it("can make DB structure of savedata", async () => {
        // Arrange
        const conv = new SQLiteConverterAsync();
        const filepath = "C:\\Temp\\savedata.test.db";
        if(fs.existsSync(filepath)) fs.rmSync(filepath);

        // Act
        await conv.MakeDatabase(filepath);

        // Assert
        const fileExists = fs.existsSync(filepath);
        expect(fileExists).toEqual(true);
    });
    it("can save data to DB", async () => {
        // Arrange
        const conv = new SQLiteConverterAsync();
        const filepath = "C:\\Temp\\storywriter1.test.db";

        // Act
        const err = await conv.SaveAsync(filepath, new StoryWriterObjectSample());
        await PlaneSQLite.Procedure(async s => {
            await s.Execute(`select count(id) as cnt from memo`);
        }, filepath, false);

        // Assert
        if(err !== null) console.log(err.message);
        expect(err === null).toEqual(true);
    });
    it("can load data from DB", async () => {
        // Arrange
        const conv = new SQLiteConverterAsync();
        const filepath = "C:\\Temp\\storywriter.sample.db";
        let stories = 0;

        // Act
        const result = await conv.LoadAsync(filepath);
        const isErr = result instanceof Error;
        if(!isErr) {
            await PlaneSQLite.Procedure(async s => {
                const r = await s.Execute("select count(*) as cnt from story");
                stories = r[0]['cnt'] as number;
            }, filepath, false);
        }

        // Assert
        if(isErr) console.log((result as Error).message);
        expect(!isErr && stories === 9).toEqual(true);
    });
});
