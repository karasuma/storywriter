import { ObjectConverterAsync } from "@/logics/models/file_controller/object-converter";
import { StoryWriterObject, StoryWriterObjectSample } from "@/logics/models/storywriter-object";
import path from "path";

describe("object-converter.ts", () => {
    const filepath = path.resolve("./tests/test.plane.ysd");
    it("can save data to DB", async () => {
        // Arrange
        // x

        // Act
        const err = await ObjectConverterAsync.SaveAsync(filepath, new StoryWriterObjectSample());
        const isErr = err !== null;

        // Assert
        if(isErr) console.log(err.message);
        expect(isErr).toEqual(false);
    });
    it("can load data from DB", async () => {
        // Arrange
        let stories = 0;
        let dicts = 0;
        let actors = 0;
        let chats = 0;
        let worlds = 0;
        let memos = 0;

        // Act
        const result = await ObjectConverterAsync.LoadAsync(filepath);
        const isErr = result instanceof Error;
        if(result instanceof StoryWriterObject) {
            stories = result.story.GetFlattenStories().length;
            dicts = result.dict.dictionaries.length;
            actors = result.actor.actors.length;
            chats = result.chat.chats.length;
            worlds = result.world.GetFlattenWorlds().length;
            memos = result.memo.memos.length;
        }

        // Assert
        if(isErr) console.log((result as Error).message);
        expect(isErr).toEqual(false);
        expect(stories === 9).toEqual(true);
        expect(dicts === 3).toEqual(true);
        expect(actors === 3).toEqual(true);
        expect(chats === 2).toEqual(true);
        expect(worlds === 8).toEqual(true);
        expect(memos === 2).toEqual(true);
    });
});
