import { Savedata } from "@/logics/models/file_controller/savedata";
import { StoryWriterObjectSample } from "@/logics/models/storywriter-object";
import fs from 'fs';

describe("savedata.ts", () => {
    it("can create savedata", async () => {
        // Arrange
        const filepath = "C:\\Temp\\save.test";

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
        const filepath = "C:\\Temp\\sample.test";

        // Act
        const result = await Savedata.Load(filepath);

        // Assert
        if(result instanceof Error) {
            alert(result.message);
        } else {
            expect(result.story.GetFlattenStories().length).toBeGreaterThan(0);
        }
    });
});