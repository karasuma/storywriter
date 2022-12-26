import { Defs } from "./defs";
import { IUniqueObject, Utils } from "./utils";

export class ItemResource implements IUniqueObject {
    public id = Utils.getUniqueId();
    public resource = "";
    public type: number = Defs.ResourceType.None;

    constructor(resource?: string, type?: number) {
        this.resource = resource ?? "";
        this.type = type ?? Defs.ResourceType.None;
    }
}