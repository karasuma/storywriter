import { IUniqueObject, Utils } from "./utils";

export class Chats implements IUniqueObject {
    public id = Utils.getUniqueId();
    public chats = new Array<ChatItem>();

    public static Create(): Chats {
        return new Chats();
    }

    public Add(storyId?: string): ChatItem {
        const chat = new ChatItem(storyId);
        this.chats.push(chat);
        return chat;
    }

    public Remove(chat: ChatItem): void {
        const idx = this.chats.findIndex(x => x.id == chat.id);
        if(idx >= 0) {
            this.chats.splice(idx, 1);
        }
    }
}

export class ChatItem implements IUniqueObject {
    public id = Utils.getUniqueId();
    public storyId = "";
    public description = "";
    public timeline = new Array<ChatTalker>();
    public isEditing = false;

    constructor(storyId?: string) {
        this.storyId = storyId ?? "";
    }

    public AddTalk(actorId: string, text: string): ChatTalker {
        const talker = new ChatTalker(actorId, text);
        this.timeline.push(talker);
        return talker;
    }

    public RemoveTalk(talk: ChatTalker): void {
        const idx = this.timeline.findIndex(x => x.id == talk.id);
        if(idx >= 0) {
            this.timeline.splice(idx, 1);
        }
    }

    public MoveTalk(talk: ChatTalker, target: ChatTalker): void {
        const talkIdx = this.timeline.findIndex(x => x.id == talk.id);
        const tgtIdx = this.timeline.findIndex(x => x.id == target.id);

        if(talkIdx == -1 || tgtIdx == -1 || talkIdx == tgtIdx) return;

        const currTalk = ChatTalker.Create(talk.id, talk.actorId, talk.text);
        this.timeline.splice(talkIdx, 1);
        if(talkIdx < tgtIdx) {
            // Insert target is upside
            this.timeline.splice(tgtIdx - 1, 0, currTalk);
        } else {
            // Insert target is downside
            this.timeline.splice(tgtIdx, 0, currTalk);
        }
    }

    public GetAllChars(): string {
        return this.timeline.map(x => x.text).join("");
    }
}

export class ChatTalker implements IUniqueObject {
    public id = Utils.getUniqueId();
    public actorId = "";
    public text = "";

    constructor(id: string, text: string) {
        this.actorId = id;
        this.text = text;
    }

    public static Create(id: string, actorId: string, text: string): ChatTalker {
        const talk = new ChatTalker(actorId, text);
        talk.id = id;
        return talk;
    }
}