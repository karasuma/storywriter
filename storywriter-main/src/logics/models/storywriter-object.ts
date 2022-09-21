import { Dictionaries } from "./dictionary-data";
import { Stories } from "./story-data";

export class StoryWriterObject {
    public story = Stories.Create();
    public dict = Dictionaries.Create();
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

    createDict(): void {
        this.dict.Add("射命丸　文");
        const d = this.dict.Add("犬走　椛", "妖怪の山に住む白狼天狗。哨戒、警邏業務を主に行う。下っ端気質のため、文さんに色々といじられる。");
        d.isEditing = true;
        this.dict.Add("姫海棠　はたて");
    }

    constructor() {
        super();
        this.createStory();
        this.createDict();
    }
}