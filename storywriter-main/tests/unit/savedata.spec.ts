import { Savedata } from "@/logics/models/file_controller/savedata";
import { StoryWriterObject, StoryWriterObjectSample } from "@/logics/models/storywriter-object";
import fs from 'fs';
import path from "path";

describe("savedata.ts", () => {
    const filepath = path.resolve("./tests/test.ysd");
    it("can create savedata", async () => {
        // Arrange
        // x

        // Act
        const result = await Savedata.Save(filepath, new StoryWriterObjectSample());

        // Assert
        if(result !== null) {
            alert(result.message);
        }
        expect(fs.existsSync(filepath)).toEqual(true);
    });
    it("can load from savedata", async () => {
        // Arrange
        // x

        // Act
        const result = await Savedata.Load(filepath);

        // Assert
        if(result instanceof StoryWriterObject) {
            expect(result.story.GetFlattenStories().length).toBeGreaterThan(0);
        } else {
            alert(result.message);
        }
    });
});