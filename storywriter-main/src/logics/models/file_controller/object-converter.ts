import { ActorData, ActorDetail, Actors } from "../actor-data";
import { ChatItem, Chats, ChatTalker } from "../chat-data";
import { Dictionaries, DictionaryContent } from "../dictionary-data";
import { MemoItem, Memos } from "../memo-data";
import { ItemResource } from "../resource";
import { Stories, StoryContent, StoryData, StoryItem } from "../story-data";
import { StoryWriterObject } from "../storywriter-object";
import { WorldData, WorldDescription, Worlds } from "../world-data";
import { Defs } from "../defs";
import fs from 'fs';

export class ObjectConverterAsync {
    public resources: Resources[];
    public stories: StoryDao[];
    public dictionaries: DictionaryDao[];
    public actors: ActorDao[];
    public chats: ChatDao[];
    public worlds: WorldDao[];
    public memos: MemoDao[];
    constructor(res: Resources[], stories: StoryDao[], dicts: DictionaryDao[],
        actors: ActorDao[], chats: ChatDao[], worlds: WorldDao[], memos: MemoDao[]) {
            this.resources = res;
            this.stories = stories;
            this.dictionaries = dicts;
            this.actors = actors;
            this.chats = chats;
            this.worlds = worlds;
            this.memos = memos;
    }

    public static SaveAsync(dest: string, obj: StoryWriterObject): Promise<Error | null> {
        return new Promise<Error | null>((resolve, reject) => {
            setTimeout(() => {
                reject("TIMEOUT on SaveAsync");
            }, 10 * 1000);
            // Extract resources (Dict, Actor, World)
            const resources = obj.dict.dictionaries.map(d => d.resources)
                .concat(obj.actor.actors.map(a => a.images.concat(a.face)))
                .concat(obj.world.GetFlattenWorlds().map(w => w.resources.concat(w.image)))
                .flatMap(res => res)
                .map(res => Resources.Conv(res));
            // Create simple data objects
            const stories = StoryDao.Conv(obj.story);
            const dicts = DictionaryDao.Conv(obj.dict);
            const actors = ActorDao.Conv(obj.actor);
            const chats = ChatDao.Conv(obj.chat);
            const worlds = WorldDao.Conv(obj.world);
            const memos = MemoDao.Conv(obj.memo);
            const dao = new ObjectConverterAsync(resources, stories, dicts, actors, chats, worlds, memos);
            // To JSON
            const json = JSON.stringify(dao, undefined, '\t');
            const compress = Buffer.from(json, 'utf-8').toString('base64');
            fs.writeFile(dest, compress, {encoding: 'utf-8'}, err => resolve(err));
        });
    }

    public static LoadAsync(src: string): Promise<Error | StoryWriterObject> {
        return new Promise<Error | StoryWriterObject>((resolve, reject) => {
            setTimeout(() => {
                reject("TIMEOUT on LoadAsync");
            }, 10 * 1000);
            const readStream = fs.createReadStream(src, 'utf-8');
            let base64 = "";
            readStream.on('data', chunk => base64 += chunk);
            readStream.on('end', () => {
                // From JSON
                const decompress = Buffer.from(base64, 'base64').toString('utf-8');
                const dao = JSON.parse(decompress) as ObjectConverterAsync;
                // Create Storywriter object data
                const obj = new StoryWriterObject();
                obj.story = StoryDao.ConvBack(dao.stories);
                obj.dict = DictionaryDao.ConvBack(dao.dictionaries, dao.resources);
                obj.actor = ActorDao.ConvBack(dao.actors, dao.resources);
                obj.chat = ChatDao.ConvBack(dao.chats);
                obj.world = WorldDao.ConvBack(dao.worlds, dao.resources);
                obj.memo = MemoDao.ConvBack(dao.memos);
                resolve(obj);
            });
            readStream.on('error', err => resolve(err));
        });
    }
}

class Resources {
    public id: string;
    public type: number;
    public content: string;
    constructor(id: string, type: number, content: string) {
        this.id = id;
        this.type = type;
        this.content = content;
    }
    public static Conv(obj: ItemResource): Resources {
        return new Resources(obj.id, obj.type, obj.resource);
    }
    public static ConvBack(dao: Resources): ItemResource {
        const obj = new ItemResource(dao.content, dao.type);
        obj.id = dao.id;
        return obj;
    }
}

class StoryContentDao {
    public id: string;
    public text: string;
    constructor(id: string, text: string) {
        this.id = id;
        this.text = text;
    }
    public static Conv(obj: StoryContent): StoryContentDao {
        return new StoryContentDao(obj.id, obj.text);
    }
    public static ConvBack(dao: StoryContentDao): StoryContent {
        const obj = new StoryContent(dao.text);
        obj.id = dao.id;
        return obj;
    }
}

class StoryItemDao {
    public id: string;
    public title: string;
    public color: string;
    public contents: StoryContentDao[] = [];
    constructor(id: string, title: string, color: string) {
        this.id = id;
        this.title = title;
        this.color = color;
    }
    public static Conv(obj: StoryItem): StoryItemDao {
        const dao = new StoryItemDao(obj.id, obj.title, obj.color);
        obj.stories.forEach(c => dao.contents.push(StoryContentDao.Conv(c)));
        return dao;
    }
    public static ConvBack(dao: StoryItemDao): StoryItem {
        const obj = new StoryItem(dao.title);
        obj.id = dao.id;
        obj.color = dao.color;
        dao.contents.forEach(c => obj.stories.push(StoryContentDao.ConvBack(c)));
        return obj;
    }
}

class StoryDataDao {
    public id: string;
    public caption: string;
    public desc: string;
    public color: string;
    public time: number;
    public items: StoryItemDao[] = [];
    constructor(id: string, capt: string, desc: string, color: string, time: number) {
        this.id = id;
        this.caption = capt;
        this.desc = desc;
        this.color = color;
        this.time = time;
    }
    public static Conv(obj: StoryData): StoryDataDao {
        const dao = new StoryDataDao(obj.id, obj.caption, obj.description, obj.color, obj.time);
        obj.items.forEach(item => dao.items.push(StoryItemDao.Conv(item)));
        return dao;
    }
    public static ConvBack(dao: StoryDataDao): StoryData {
        const obj = new StoryData();
        obj.id = dao.id;
        obj.caption = dao.caption;
        obj.description = dao.desc;
        obj.color = dao.color;
        obj.time = dao.time;
        dao.items.forEach(item => obj.items.push(StoryItemDao.ConvBack(item)));
        return obj;
    }
}

class StoryDao {
    public id: string;
    public editing: number;
    public depth: number;
    public parentId: string;
    public isDir: number;
    public content: StoryDataDao;
    constructor(id: string, editing: boolean, depth: number, pid: string, isdir: boolean, content: StoryData) {
        this.id = id;
        this.editing = editing ? 1 : 0;
        this.depth = depth;
        this.parentId = pid;
        this.isDir = isdir ? 1 : 0;
        this.content = StoryDataDao.Conv(content);
    }
    public static Conv(obj: Stories): StoryDao[] {
        //return new StoryDao(obj.id, obj.isEditing, obj.depth, obj.parent.id, obj.isDir);
        const daos = new Array<StoryDao>();
        obj.GetFlattenStories().forEach(s => {
            const dao = new StoryDao(s.id, s.isEditing, s.depth, s.parent.id, s.isDir, s.content);
            daos.push(dao);
        });
        return daos;
    }
    public static ConvBack(daos: StoryDao[]): Stories {
        const stories = Stories.Create();
        // Get unsorted stories
        const flatten = daos.map(dao => {
            const story = new Stories(dao.isDir === 1, dao.content.caption, stories.root);
            story.id = dao.id;
            story.isEditing = dao.editing === 1;
            story.depth = dao.depth;
            story.isDir = dao.isDir === 1;
            story.content = StoryDataDao.ConvBack(dao.content);
            return [story, dao.parentId];
        }) as Array<[Stories, string]>;
        //console.log(flatten.map(f => `${f[0].id} ${f[0].content.caption} -> ${f[1]}`))

        // Make story hierarchy and return
        let currDepth = 0;
        flatten
            .sort((l, r) => l[0].depth > r[0].depth ? 1 : -1)
            .forEach(pair => {
                const story = pair[0];
                const parentId = pair[1];
                if(currDepth !== story.depth) {
                    currDepth = story.depth;
                    Stories.ResetAllTimes(stories.root);
                    Stories.ResetFlattenStories(stories.root);
                }
                const parent = story.depth === 1
                    ? stories.root // Root item (depth: 1)
                    : stories.GetFlattenStories().find(s => s.id === parentId); // Descendant item
                if(parent !== undefined && parent.isDir) {
                    story.parent = parent;
                    parent.children.push(story);
                }
            });
        stories.InitializeHierarchy();
        return stories;
    }
}

class DictionaryDao {
    public id: string;
    public caption: string;
    public desc: string;
    public editing: number;
    public resIds: string[] = [];
    constructor(id: string, capt: string, desc: string, editing: boolean, resIds: string[]) {
        this.id = id;
        this.caption = capt;
        this.desc = desc;
        this.editing = editing ? 1 : 0;
        resIds.forEach(rid => resIds.push(rid));
    }
    public static Conv(obj: Dictionaries): DictionaryDao[] {
        const dicts = new Array<DictionaryDao>();
        obj.dictionaries.forEach(d => {
            const dict = new DictionaryDao(
                d.id, d.caption,
                d.description,
                d.isEditing,
                d.resources.filter(res => res.type !== Defs.ResourceType.None).map(res => res.id)
            );
            dicts.push(dict);
        });
        return dicts;
    }
    public static ConvBack(daos: DictionaryDao[], resources: Resources[]): Dictionaries {
        const dict = Dictionaries.Create();
        daos.forEach(d => {
            const obj = new DictionaryContent();
            obj.id = d.id;
            obj.caption = d.caption;
            obj.description = d.desc;
            obj.isEditing = d.editing === 1;
            resources
                .filter(r => d.resIds.indexOf(r.id) !== -1)
                .forEach(r => obj.resources.push(Resources.ConvBack(r)));
            dict.dictionaries.push(obj);
        });
        return dict;
    }
}

class ActorDetailDao {
    public id: string;
    public title: string;
    public desc: string;
    constructor(id: string, title: string, desc: string) {
        this.id = id;
        this.title = title;
        this.desc = desc;
    }
    public static Conv(obj: ActorDetail): ActorDetailDao {
        return new ActorDetailDao(obj.id, obj.title, obj.description);
    }
    public static ConvBack(dao: ActorDetailDao): ActorDetail {
        const obj = new ActorDetail(dao.title);
        obj.id = dao.id;
        obj.description = dao.desc;
        return obj;
    }
}

class ActorDao {
    public id: string;
    public faceId: string;
    public name: string;
    public desc: string;
    public editing: number;
    public details: ActorDetailDao[] = [];
    public resources: string[] = [];
    constructor(id: string, fid: string, name: string, desc: string, editing: boolean, resIds: string[]) {
        this.id = id;
        this.faceId = fid;
        this.name = name;
        this.desc = desc;
        this.editing = editing ? 1 : 0;
        resIds.forEach(r => this.resources.push(r));
    }
    public static Conv(actor: Actors): ActorDao[] {
        return actor.actors.map(a => {
                const dao = new ActorDao(
                    a.id, a.face.id, a.name, a.description, a.isEditing,
                    a.images.map(img => img.id)
            );
            dao.details = a.details.map(d => {
                return new ActorDetailDao(d.id, d.title, d.description);
            });
            return dao;
        });
    }
    public static ConvBack(daos: ActorDao[], resources: Resources[]): Actors {
        const actor = Actors.Create();
        daos.forEach(dao => {
            const data = new ActorData(dao.name);
            data.id = dao.id;
            data.description = dao.desc;
            data.isEditing = dao.editing === 1;
            const face = resources.find(r => dao.faceId === r.id);
            if(face !== undefined) data.face = Resources.ConvBack(face);
            dao.details.forEach(d => data.details.push(ActorDetailDao.ConvBack(d)));
            resources
                .filter(r => dao.resources.indexOf(r.id) !== -1)
                .forEach(r => data.images.push(Resources.ConvBack(r)));
            actor.actors.push(data);
        });
        return actor;
    }
}

class ChatTalkDao {
    public id: string;
    public actorId: string;
    public text: string;
    constructor(id: string, aid: string, text: string) {
        this.id = id;
        this.actorId = aid;
        this.text = text;
    }
    public static Conv(obj: ChatTalker): ChatTalkDao {
        return new ChatTalkDao(obj.id, obj.actorId, obj.text);
    }
    public static ConvBack(dao: ChatTalkDao): ChatTalker {
        const obj = new ChatTalker(dao.id, dao.text);
        obj.actorId = dao.actorId;
        return obj;
    }
}
class ChatDao {
    public id: string;
    public storyId: string;
    public desc: string;
    public timeline: ChatTalkDao[] = [];
    public editing: number;
    constructor(id: string, sid: string, desc: string, editing: boolean) {
        this.id = id;
        this.storyId = sid;
        this.desc = desc;
        this.editing = editing ? 1 : 0;
    }
    public static Conv(obj: Chats): ChatDao[] {
        return obj.chats.map(chat => {
            const dao = new ChatDao(chat.id, chat.storyId, chat.description, chat.isEditing);
            chat.timeline.forEach(tl => dao.timeline.push(ChatTalkDao.Conv(tl)));
            return dao;
        });
    }
    public static ConvBack(daos: ChatDao[]): Chats {
        const chats = Chats.Create();
        daos.forEach(dao => {
            const chat = new ChatItem(dao.storyId);
            chat.id = dao.id;
            chat.description = dao.desc;
            chat.isEditing = dao.editing === 1;
            dao.timeline.forEach(tl => chat.timeline.push(ChatTalkDao.ConvBack(tl)));
            chats.chats.push(chat);
        });
        return chats;
    }
}

class WorldDescDao {
    public id: string;
    public title: string;
    public text: string;
    constructor(id: string, title: string, text: string) {
        this.id = id;
        this.title = title;
        this.text = text;
    }
    public static Conv(obj: WorldDescription): WorldDescDao {
        return new WorldDescDao(obj.id, obj.title, obj.text);
    }
    public static ConvBack(dao: WorldDescDao): WorldDescription {
        const obj = new WorldDescription(dao.title, dao.text);
        obj.id = dao.id;
        return obj;
    }
}
class WorldDao {
    public id: string;
    public editing: number;
    public isDir: number;
    public isExpanding: number;
    public parentId: string;
    public depth: number;
    public caption: string;
    public thumbId: string;
    public desc: WorldDescDao[] = [];
    public resources: string[] = [];
    constructor(
        id: string, editing: boolean, isdir: boolean, expand: boolean,
        pid: string, depth: number, caption: string, tid: string
    ) {
        this.id = id;
        this.editing = editing ? 1 : 0;
        this.isDir = isdir ? 1 : 0;
        this.isExpanding = expand ? 1 : 0;
        this.parentId = pid;
        this.depth = depth;
        this.caption = caption;
        this.thumbId = tid;
    }
    public static Conv(obj: Worlds): WorldDao[] {
        return obj.GetFlattenWorlds().map(world => {
            const dao = new WorldDao(
                world.id, world.isEditing, world.isDir, world.isExpanding,
                world.parent.id, world.depth, world.caption, world.image.id
            );
            world.descriptions.forEach(d => dao.desc.push(WorldDescDao.Conv(d)));
            world.resources.forEach(r => dao.resources.push(r.id));
            return dao;
        });
    }
    public static ConvBack(daos: WorldDao[], resources: Resources[]): Worlds {
        const worlds = Worlds.Create();
        const flatten = daos.map(dao => {
            const world = new WorldData(worlds);
            world.id = dao.id;
            world.isEditing = dao.editing === 1;
            world.isDir = dao.isDir === 1;
            world.isExpanding = dao.isExpanding === 1;
            world.depth = dao.depth;
            world.caption = dao.caption;
            dao.desc.forEach(d => world.descriptions.push(WorldDescDao.ConvBack(d)));
            const thumb = resources.find(r => r.id === dao.thumbId);
            if(thumb !== undefined) {
                world.image = Resources.ConvBack(thumb);
            }
            dao.resources.forEach(dr => {
                const res = resources.find(r => r.id === dr);
                if(res !== undefined) {
                    world.resources.push(Resources.ConvBack(res));
                }
            });
            return world;
        });

        // Make hierarchy
        let currDepth = 0;
        flatten
            .sort((l, r) => l.depth > r.depth ? 1 : -1)
            .forEach(world => {
                if(currDepth !== world.depth) {
                    currDepth = world.depth;
                    worlds.MakeFlattenWorlds();
                }
                if(world.depth === 1) {
                    world.parent = worlds.area;
                    world.parent.children.push(world);
                } else {
                    const parent = worlds.GetFlattenWorlds()
                        .filter(w => w.depth === world.depth - 1)
                        .find(w => w.id === daos.find(d => d.id === world.id)?.parentId);
                    if(parent !== undefined) {
                        world.parent = parent;
                        world.parent.children.push(world);
                    } else {
                        throw new Error(
                            "[WorldDao.ConvBack in object-converter.ts] Missing world's parent."
                        );
                    }
                }
            });
        worlds.MakeFlattenWorlds();
        
        return worlds;
    }
}

class MemoDao {
    public id: string;
    public caption: string;
    public color: string;
    public text: string;
    constructor(id: string, caption: string, color: string, text: string) {
        this.id = id;
        this.caption = caption;
        this.color = color;
        this.text = text;
    }
    public static Conv(obj: Memos): MemoDao[] {
        return obj.memos.map(m => new MemoDao(m.id, m.caption, m.color, m.text));
    }
    public static ConvBack(daos: MemoDao[]): Memos {
        const memo = Memos.Create();
        daos.forEach(dao => {
            const obj = new MemoItem(dao.caption, dao.text);
            obj.id = dao.id;
            obj.color = dao.color;
            memo.memos.push(obj);
        });
        return memo;
    }
}