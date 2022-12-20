import Notifier from "../utils/notifier";
import { ResourceConverter } from "../utils/resource-converter";
import { Actors } from "./actor-data";
import { Chats } from "./chat-data";
import { Defs } from "./defs";
import { Dictionaries } from "./dictionary-data";
import { Savedata } from "./file_controller/savedata";
import { Memos } from "./memo-data";
import { Setting } from "./setting";
import { Stories } from "./story-data";
import { Utils } from "./utils";
import { Worlds } from "./world-data";

export class StoryWriterObject {
    public story = Stories.Create();
    public dict = Dictionaries.Create();
    public actor = Actors.Create();
    public chat = Chats.Create();
    public world = Worlds.Create();
    public memo = Memos.Create();

    public setting = new Setting();
    public message = new Notifier();

    public currentView = 1;

    public async Save(): Promise<void> {
        this.message.Send("保存中...", Notifier.Levels.Warning);
        const result = await Savedata.Save(this.setting.URI, this);
        if(result !== null) {
            this.message.Send(`'${this.setting.URI}' への保存に失敗しました。`, Notifier.Levels.Alert);
            return;
        }
        this.message.Send(`'${this.setting.URI}' へ保存しました！`, Notifier.Levels.Info);
    }

    public async Load(): Promise<void> {
        this.message.Send("読み込み中...", Notifier.Levels.Warning);
        const result = await Savedata.Load(this.setting.URI);
        if(result instanceof Error) {
            this.message.Send(`'${this.setting.URI}' からの読み込みに失敗しました。`, Notifier.Levels.Alert);
            return;
        }
        this.message.Send(`'${this.setting.GetTitle()}' の読み込み成功！`, Notifier.Levels.Info);

        this.story = result.story;
        this.dict = result.dict;
        this.actor = result.actor;
        this.chat = result.chat;
        this.world = result.world;
        this.memo = result.memo;
        this.currentView = 1;
    }
}

export class StoryWriterObjectSample extends StoryWriterObject {
    createStory(): void {
        this.story.AppendStory("序章");
        const dir1 = this.story.AppendStory("第一章", true);
        dir1.AppendStory("崩壊");
        dir1.AppendStory("邂逅");
        const dir2 = dir1.AppendStory("諜報", true);
        dir2.AppendStory("信仰と友情");
        dir2.AppendStory("洗脳と利潤");
        const c2 = this.story.AppendStory("幕間");
        c2.isEditing = true;
        this.story.AppendStory("次章");

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
        a1.AppendDesc("説明", "天狗が住んでる街。\n広い。");
        const img = ResourceConverter.ConvImageAsBStr(ResourceConverter.FileType.JPG, "C:\\Temp\\image.jpg");
        a1.image.id = Utils.getUniqueId();
        a1.image.type = Defs.ResourceType.Image;
        a1.image.resource = img;
        w1.Add("九天の滝");
        const w2 = this.world.area.Add("守矢神社", true);
        w2.Add("大蝦蟇の池");
        const a2 = w2.Add("警邏所", true);
        a2.Add("一番詰所");
        a2.Add("表門");
        this.world.MakeFlattenWorlds();
    }

    createMemo(): void {
        this.memo.Add("メモ１", "１番目のメモ");
        const m2 = this.memo.Add("メモ２", "緑のメモ");
        m2.color = Defs.definedDarkColors[5];

    }

    constructor() {
        super();
        this.createStory();
        this.createDict();
        this.createActor();
        this.createChat();
        this.createWorld();
        this.createMemo();
    }
}