import { IUniqueObject, Utils } from "./utils";

export class Memos implements IUniqueObject {
    public id = Utils.getUniqueId();
    public memos = new Array<MemoItem>();

    public static Create(): Memos {
        return new Memos();
    }

    public Add(caption?: string, text?: string): MemoItem {
        const item = new MemoItem(caption, text);
        this.memos.push(item);
        return item;
    }

    public Remove(item: MemoItem): void {
        const memoIdx = this.memos.findIndex(x => x.id === item.id);
        if(memoIdx == -1) return;
        this.memos.splice(memoIdx, 1);
    }
}

export class MemoItem implements IUniqueObject {
    public id = Utils.getUniqueId();
    public caption = "";
    public color = "transparent";
    public text = "";

    constructor(caption?: string, text?: string) {
        this.caption = caption ?? "";
        this.text = text ?? "";
    }
}