import { ItemResource } from "./resource";
import { IUniqueObject, Utils } from "./utils";

export class Dictionaries implements IUniqueObject {
    public id = Utils.getUniqueId();
    public dictionaries = new Array<DictionaryContent>();

    static Create(): Dictionaries {
        return new Dictionaries();
    }

    public Add(caption = "", description = ""): DictionaryContent {
        const dict = new DictionaryContent();
        dict.caption = caption;
        dict.description = description;
        this.dictionaries.push(dict);
        return dict;
    }

    public Remove(caption: string): void {
        const idx = this.GetIndex(caption);
        if(idx >= 0) {
            this.dictionaries.splice(idx, 1);
        }
    }

    public GetIndex(caption: string): number {
        return this.dictionaries.map(dc => dc.caption).indexOf(caption);
    }

    public Swap(idx1: number, idx2: number): void {
        if(idx1 == idx2) return;
        const lidx = idx1 < idx2 ? idx1 : idx2;
        const ridx = lidx == idx1 ? idx2 : idx1;
        const left = this.dictionaries[lidx];
        
        this.dictionaries.splice(ridx, 1);
        this.dictionaries.splice(ridx, 0, left);
        this.dictionaries.splice(lidx, 1);
    }
}

export class DictionaryContent implements IUniqueObject {
    public id = Utils.getUniqueId();
    public caption = "";
    public description = "";
    public isEditing = false;
    public resources = new Array<ItemResource>();

    public AddResource(resource: string, type: number): void {
        this.resources.push(new ItemResource(resource, type));
    }

    public RemoveResource(index: number): void {
        this.resources.splice(index, 1);
    }

    public RemoveResourceFromID(id: string): void {
        const idx = this.resources.findIndex(x => x.id == id);
        if(idx >= 0) {
            this.RemoveResource(idx);
        }
    }

    public FindResourceIndex(resource: string): number {
        return this.resources.findIndex(x => x.resource == resource);
    }
}
