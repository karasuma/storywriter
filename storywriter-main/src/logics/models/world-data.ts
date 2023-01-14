import ErrorHandler from "../utils/error-handler";
import { Defs } from "./defs";
import { ItemResource } from "./resource";
import { IUniqueObject, Utils } from "./utils";

export class Worlds implements IUniqueObject {
    public id = Utils.getUniqueId();
    public area = new WorldData(this, undefined, WorldData.RootName, true);

    private flattenWorlds = new Array<WorldData>();

    public static Create(): Worlds {
        return new Worlds();
    }

    public MakeFlattenWorlds(): void {
        this.flattenWorlds.splice(0);
        this.area.children.forEach(x => {
            this.flattenWorlds.push(x);
            this.flattenWorlds = this.flattenWorlds.concat(this.MakeFlattenChildren(x.children));
        });
    }

    public MakeFlattenChildren(children: WorldData[]): WorldData[] {
        let flatten = new Array<WorldData>();
        children.forEach(x => {
            flatten.push(x);
            flatten = flatten.concat(this.MakeFlattenChildren(x.children));
        });
        return flatten;
    }

    public GetFlattenWorlds(): Array<WorldData> {
        return this.flattenWorlds;
    }

    public AddWorldData(caption?: string, isDir?: boolean, parent?: WorldData): WorldData {
        const parentWorld = parent ?? this.area;
        const world = parentWorld.Add(caption, isDir);
        this.MakeFlattenWorlds();
        return world;
    }

    public RemoveWorldData(id: string): void {
        const worldIdx = this.flattenWorlds.findIndex(x => x.id === id);
        if(worldIdx === -1) {
            ErrorHandler.RaiseError(
                "World remove error",
                `RemoveWorldData tried to remove '${id}' but not found.`,
                ErrorHandler.ErrorLevel.Failed
            );
            return;
        }
        const world = this.flattenWorlds[worldIdx];
        world.parent?.Remove(world);
        this.MakeFlattenWorlds();
    }
}

export class WorldData implements IUniqueObject {
    public id = Utils.getUniqueId();
    public isEditing = false;
    public isExpanding = true;
    public isChildrenExpanding = true;

    public isDir = false;
    public children = new Array<WorldData>();
    public parent: WorldData;
    public depth = 0;
    public root: Worlds;

    public caption = "";
    public image = new ItemResource();
    public descriptions = new Array<WorldDescription>();
    public resources = new Array<ItemResource>();

    public static RootName = "ROOTOFTHEWORLD";

    constructor(root: Worlds, parent?: WorldData, caption?: string, isDir = false) {
        this.root = root;
        this.parent = parent ?? this;
        this.caption = caption ?? "";
        this.isDir = isDir;
    }

    public Add(caption?: string, isDir = false): WorldData {
        const world = new WorldData(this.root, this, caption, isDir);
        world.depth = this.depth + 1;
        this.children.push(world);
        return world;
    }

    public Remove(world: WorldData): void {
        const area = this.children.findIndex(x => x.id === world.id);
        if(area == -1) {
            ErrorHandler.RaiseError(
                "World remove error",
                `World tried to remove '${world.caption}' but it's not found.`,
                ErrorHandler.ErrorLevel.Failed
            );
            return;
        }
        this.children.splice(area, 1);
    }

    public AppendResource(src: string): ItemResource {
        const item = new ItemResource(src, Defs.ResourceType.Image);
        this.resources.push(item);
        return item;
    }

    public RemoveResource(id: string): void {
        const itemIdx = this.resources.findIndex(x => x.id === id);
        if(itemIdx === -1) return;
        this.resources.splice(itemIdx, 1);
    }

    public AppendDesc(caption?: string, text?: string): WorldDescription {
        const desc = new WorldDescription(caption, text);
        this.descriptions.push(desc);
        return desc;
    }

    public RemoveDesc(id: string): void {
        const descIdx = this.descriptions.findIndex(x => x.id === id);
        if(descIdx === -1) return;
        this.descriptions.splice(descIdx, 1);
    }

    public ChangeDepth(depth: number): void {
        this.depth = depth;
        this.children.forEach(x => x.ChangeDepth(depth + 1));
    }

    public FindAncestor(id: string): WorldData | null {
        let parent = this.parent;
        while(parent.caption !== WorldData.RootName) {
            if(parent.id === id) return parent;
            parent = parent.parent;
        }
        return null;
    }
}

export class WorldDescription implements IUniqueObject {
    public id = Utils.getUniqueId();
    public title = "";
    public text = "";

    constructor(title?: string, text?: string) {
        this.title = title ?? "";
        this.text = text ?? "";
    }
}