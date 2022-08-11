import { IUniqueObject, Utils } from "./utils";

export class Stories implements IUniqueObject {
    // Story data
    public id: string = Utils.getUniqueId();
    public content: StoryData = new StoryData();
    public children: Stories[] = new Array<Stories>();
    
    // View setting
    public isEditing = false;
    public isExpanding = true;
    public depth = 0;

    // Data status
    public parent: Stories | null = null;
    public isDir = false;
    private flattenStories: Stories[] = new Array<Stories>();

    public readonly root: Stories;

    constructor(
        createAsDir: boolean,
        caption: string,
        root: Stories | null = null
    ) {
        this.isDir = createAsDir;
        this.content.caption = caption ?? "";
        this.root = root ?? this;
    }

    public static MakeFlatStories(root: Stories, stories?: Stories[]): Array<Stories> {
        let flatStories = new Array<Stories>();
        (stories ?? root.children).forEach((s: Stories) => {
            flatStories.push(s);
            flatStories = flatStories.concat(this.MakeFlatStories(s, s.children));
        });
        return flatStories;
    }

    public static FindStoryFormID(root: Stories, id: string): Stories | undefined {
        return root.flattenStories.find((x: Stories) => x.id === id);
    }

    public static RemoveStoryFromID(root: Stories, id: string, stories?: Stories[]): boolean {
        const children = stories ?? root.children;
        const index = children.findIndex((x: Stories) => x.id === id);
        if(index >= 0) {
            children.splice(index, 1);
            return true;
        }
        for(const s of children) {
            const removed = Stories.RemoveStoryFromID(s, id, s.children);
            if(removed) return true;
        }
        return false;
    }

    public static ResetAllTimes(root: Stories): void {
        let time = 1;
        root.flattenStories.forEach(s => {
            s.content.time = s.isDir ? -1 : time++;
        });
    }

    public GetFlattenStories(): Array<Stories> {
        return this.root.flattenStories;
    }

    public GetLastTime(): number {
        if(this.root.children.length == 0) return -1;
        return this.root.flattenStories
            .map((x: Stories) => x.content.time)
            .reduce((acc: number, curr: number) => acc > curr ? acc : curr);
    }

    public AppendStory(caption: string, createAsDir = false): Stories {
        const newstory = new Stories(createAsDir, caption, this.root);
        newstory.parent = this;
        newstory.depth = this.depth + 1;
        this.children.push(newstory);
        this.root.flattenStories = Stories.MakeFlatStories(this.root);
        Stories.ResetAllTimes(this.root);
        return newstory;
    }

    public GetEditingStory(): Stories | undefined {
        return this.root.flattenStories.find((x: Stories) => x.isEditing);
    }

    public IsVisible(): boolean {
        let parent = this.parent;
        while(parent !== null) {
            if(parent.isExpanding) return true;
            parent = parent.parent;
        }
        return false;
    }

    public Clear(): void {
        this.content.items.forEach(i => i.stories.splice(0));
        this.content.items.splice(0);
        this.children.forEach(x => x.Clear());
        this.children.splice(0);
    }

    public SwapStory(idl: string, idr: string): void {
        const flatten = this.root.flattenStories;
        const left = flatten.findIndex((x: Stories) => x.id == idl);
        const right = flatten.findIndex((x: Stories) => x.id == idr);

        if(left < 0 || right < 0) return;

        const tmpContent = flatten[left].content;
        const tmpChildren = flatten[left].children;
        const tmpIsEditing = flatten[left].isEditing;
        const tmpIsExpanding = flatten[left].isExpanding;
        const tmpIsDir = flatten[left].isDir;

        flatten[left].content = flatten[right].content;
        flatten[left].children = flatten[right].children;
        flatten[left].isEditing = flatten[right].isEditing;
        flatten[left].isExpanding = flatten[right].isExpanding;
        flatten[left].isDir = flatten[right].isDir;

        flatten[right].content = tmpContent;
        flatten[right].children = tmpChildren;
        flatten[right].isEditing = tmpIsEditing;
        flatten[right].isExpanding = tmpIsExpanding
        flatten[right].isDir = tmpIsDir;
        
        Stories.ResetAllTimes(this.root);
    }

    public MoveStory(id: string, upward: boolean): void {
        const flatten = this.root.flattenStories;
        const currDirs = ((flatten.find((x: Stories) => x.id == id) as Stories).parent as Stories).children;
        const currIdx = currDirs.findIndex((x: Stories) => x.id == id);

        if(upward && currIdx > 0) {
            this.SwapStory(id, currDirs[currIdx - 1].id);
        } else if (!upward && currIdx < currDirs.length - 1) {
            this.SwapStory(id, currDirs[currIdx + 1].id);
        }
    }
}

export class StoryData implements IUniqueObject {
    public id: string = Utils.getUniqueId();
    public caption = "";
    public description = "";
    public color = "#333333";
    public items: StoryItem[] = new Array<StoryItem>();
    public time = 0;

    public addItem(item?: StoryItem): void {
        this.items.push(item ?? new StoryItem());
    }

    public removeItem(id: string): void {
        this.items = this.items.filter((x: StoryItem) => x.id !== id);
    }

    public getItem(id: string): StoryItem {
        return this.items.find((x: StoryItem) => x.id == id) as StoryItem;
    }

    public getItemIndex(item?: StoryItem, id?: string): number {
        if(item === undefined) {
            if(id === undefined) {
                throw new Error("");
            }

            return this.items.indexOf(this.getItem(id as string));
        }
        return this.items.indexOf(item as StoryItem);
    }
}

export class StoryItem implements IUniqueObject {
    public id: string = Utils.getUniqueId();
    public title = "";
    public color = "#383838";
    public stories: StoryContent[] = new Array<StoryContent>();

    public addStory(): void {
        this.stories.push(new StoryContent());
    }

    public removeStory(index: number): void {
        this.stories.splice(index, 1);
    }
}

export class StoryContent implements IUniqueObject {
    public id: string = Utils.getUniqueId();
    public text = "";
}