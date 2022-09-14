import { Stories } from "./story-data";

export class StoryWriterObject {
    public story = Stories.Create();
}

export class StoryWriterObjectSample extends StoryWriterObject {
    createStory(): void {
        this.story.AppendStory("Content1");
        const dir1 = this.story.AppendStory("Dir1", true);
        dir1.AppendStory("Dir1-Content1");
        dir1.AppendStory("Dir1-Content2");
        const dir2 = dir1.AppendStory("Dir-c1", true);
        dir2.AppendStory("Dir-c1-Content1");
        dir2.AppendStory("Dir-c1-Content2");
        const c2 = this.story.AppendStory("Content2");
        c2.isEditing = true;
        this.story.AppendStory("Content3");

        c2.content.color = "#4acccc";
        c2.content.description = "サンプルの\nストーリー紹介文";
        const i1 = c2.content.addItem();
        i1.title = "Sample title";
        i1.color = "#007b43";
        i1.addStory("new story");
    }

    constructor() {
        super();
        this.createStory();
    }
}