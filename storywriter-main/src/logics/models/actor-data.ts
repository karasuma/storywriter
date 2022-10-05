import { Defs } from "./defs";
import { ItemResource } from "./resource";
import { IUniqueObject, Utils } from "./utils";

export class Actors implements IUniqueObject {
    public id = Utils.getUniqueId();
    public actors = new Array<ActorData>();

    public static Create(): Actors {
        return new Actors();
    }

    public Add(name?: string): ActorData {
        const actor = new ActorData(name);
        this.actors.push(actor);
        return actor;
    }

    public Remove(id: string): void {
        const idx = this.actors.findIndex(x => x.id == id);
        if(idx >= 0) {
            this.actors.splice(idx, 1);
        }
    }
}

export class ActorData implements IUniqueObject {
    public id = Utils.getUniqueId();
    public face = new ItemResource();
    public name = "";
    public images = new Array<ItemResource>();
    public description = "";
    public details = new Array<ActorDetail>();
    public isEditing = false;

    constructor(name?: string) {
        this.name = name ?? "";
    }

    public AddImage(resource: string): ItemResource {
        const item = new ItemResource(resource, Defs.ResourceType.Image);
        this.images.push(item);
        return item;
    }

    public RemoveImage(id: string): void {
        const idx = this.images.findIndex(x => x.id == id);
        if(idx >= 0) {
            this.images.splice(idx, 1);
        }
    }

    public AddDetail(title?: string): ActorDetail {
        const detail = new ActorDetail(title);
        this.details.push(detail);
        return detail;
    }

    public RemoveDetail(id: string): void {
        const idx = this.details.findIndex(x => x.id == id);
        if(idx >= 0) {
            this.details.splice(idx, 1);
        }
    }

    public SwapDetail(left: ActorDetail, right: ActorDetail): void {
        const leftidx = this.details.findIndex(x => x.id == left.id);
        const rightidx = this.details.findIndex(x => x.id == right.id);
        
        if(leftidx == -1 || rightidx == -1) return;
        if(leftidx == rightidx) return;

        const temp = this.details[rightidx];
        this.details.splice(rightidx, 1, this.details[leftidx]);
        this.details.splice(leftidx, 1, temp);
    }
}

export class ActorDetail implements IUniqueObject {
    public id = Utils.getUniqueId();
    public title = "";
    public description = "";

    constructor(title?: string) {
        this.title = title ?? "";
    }
}