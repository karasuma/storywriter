import { SQLite } from "@/logics/models/file_controller/database";
import { SQLiteConverter } from "@/logics/models/file_controller/object-converter";
import { StoryWriterObjectSample } from "@/logics/models/storywriter-object";
import fs from "fs";

describe("object-converter.ts", () => {
    it("can make DB structure of a savedata", () => {
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
    it("can save data to a DB", () => {
        // Arrange
        const conv = new SQLiteConverter();
        const filepath = "C:\\Temp\\storywriter1.test.db";
        let count = 0;

        // Act
        const err = conv.Save(filepath, new StoryWriterObjectSample());
        SQLite.Procedure(s => {
            s.Execute(`select count(id) as cnt from memo`, [], r => count = r.length);
        }, filepath);

        // Assert
        if(err !== null) console.log(err.message);
        expect(err === null).toEqual(true);
    });
});
