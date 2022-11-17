import { Actors } from "./actor-data";
import { Chats } from "./chat-data";
import { Dictionaries } from "./dictionary-data";
import { Stories } from "./story-data";
import { Worlds } from "./world-data";

export class StoryWriterObject {
    public story = Stories.Create();
    public dict = Dictionaries.Create();
    public actor = Actors.Create();
    public chat = Chats.Create();
    public world = Worlds.Create();
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

    createActor(): void {
        this.actor.Add("射命丸 文");
        const momiji = this.actor.Add("犬走 椛");
        this.actor.Add("はたて");
        momiji.description = "下っ端天狗。つよい。";
        momiji.isEditing = true;
        const d = momiji.AddDetail("特徴");
        d.description = "刀振るのがうまい";
        const d2 = momiji.AddDetail("性格");
        d2.description = "真面目";
    }

    createChat(): void {
        const story1 = this.story.GetFlattenStories().find(x => x.content.caption == "Content1");
        const story2 = this.story.GetFlattenStories().find(x => x.content.caption == "Content2");
        const aya = this.actor.actors[0];
        const momiji = this.actor.actors[1];
        const hatate = this.actor.actors[2];
        this.chat.Add(story1?.id);
        const chat = this.chat.Add(story2?.id);
        chat.isEditing = true;
        let ayatalk = "ブン屋の本懐は情報の鮮度！あらゆる情報を多角的に観察し、最もインパクトが強い事件を選んで";
        ayatalk += "それをセンセーショナルに報道する！そうすると世の中が世界の出来事に目を向け始め、そして遂には";
        ayatalk += "新聞の購読者数もうなぎ登り！ってわけです！";
        chat.AddTalk(aya.id, ayatalk);
        chat.AddTalk(momiji.id, "さすが、ゴシップ専門記者は言うことが違いますね。");
        chat.AddTalk(hatate.id, "な");
        chat.AddTalk(aya.id, "は？");
    }

    createWorld(): void {
        const w1 = this.world.area.Add("妖怪の山", true);
        const a1 = w1.Add("天狗の里");
        a1.isEditing = true;
        //a1.description = "天狗が住んでる街。\n広い。";
        a1.AppendDesc("説明", "天狗が住んでる街。\n広い。");
        w1.Add("九天の滝");
        const w2 = this.world.area.Add("守矢神社", true);
        w2.Add("大蝦蟇の池");
        const a2 = w2.Add("警邏所", true);
        a2.Add("一番詰所");
        a2.Add("表門");
        this.world.MakeFlattenWorlds();
    }

    constructor() {
        super();
        this.createStory();
        this.createDict();
        this.createActor();
        this.createChat();
        this.createWorld();
    }
}