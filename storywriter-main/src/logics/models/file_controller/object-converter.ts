import { ActorData, ActorDetail, Actors } from "../actor-data";
import { Chats, ChatTalker } from "../chat-data";
import { Dictionaries, DictionaryContent } from "../dictionary-data";
import { Memos } from "../memo-data";
import { ItemResource } from "../resource";
import { Stories, StoryContent, StoryItem } from "../story-data";
import { StoryWriterObject } from "../storywriter-object";
import ViewSelection from "../view-selection";
import { Worlds } from "../world-data";
import { PlaneSQLite, SQLite } from "./database";

export class SQLiteConverter {
    public Save(dest: string, obj: StoryWriterObject): Error | null {
        return SQLite.Procedure(s => {
            this.MakeDatabase(dest);
            s.Execute("delete from resource");
            this.InsertStory(s, obj.story);
            this.InsertDictionary(s, obj.dict);
            this.InsertActor(s, obj.actor);
            this.InsertChat(s, obj.chat);
            this.InsertWorld(s, obj.world);
            this.InsertMemo(s, obj.memo);
        }, dest);
    }

    public Load(source: string): Error | StoryWriterObject {
        const obj = new StoryWriterObject();
        const err = SQLite.Procedure(s => {
            const resources = this.ResumeResource(s);
            obj.story = this.ResumeStory(s);
            obj.dict = this.ResumeDictionary(s, resources);
            obj.actor = this.ResumeActor(s, resources);
            obj.chat = this.ResumeChat(s);
            obj.world = this.ResumeWorld(s, resources);
            obj.memo = this.ResumeMemo(s);
        }, source, false);
        if(err !== null) return err;
        obj.currentView = ViewSelection.ViewType.Story;
        return obj;
    }

    // --- Save methods ---
    // --------------------
    public MakeDatabase(path: string): Error | null {
        return SQLite.Procedure(s => {
            let hasTable = false;
            s.Execute("select count(*) as tc from sqlite_master where type='table'", [], r => {
                hasTable = r[0]['tc'] as number > 0;
            });
            if(hasTable) return;

            const ct = "create table";
            s.Execute(`${ct} resource(id text not null, type integer, content blob)`);

            s.Execute(`${ct} story(id text not null, editing integer, depth integer, parentid text, isdir integer)`);
            s.Execute(`${ct} storydata(id text not null, sid text, caption text, desc text, color text, time integer)`);
            s.Execute(`${ct} storyitem(id text not null, sdid text, title text, color text)`);
            s.Execute(`${ct} storycontent(id text not null, siid text, txt text)`);

            s.Execute(`${ct} dict(id text not null, caption text, desc text, editing integer)`);
            s.Execute(`${ct} dictres(did text, rid text)`);

            s.Execute(`${ct} actor(id text not null, faceid text, name text, desc text, editing number)`);
            s.Execute(`${ct} actorres(aid text, rid text)`);
            s.Execute(`${ct} actordetail(id text, aid text, title text, desc text)`);

            s.Execute(`${ct} chat(id text not null, sid text, desc text, editing integer)`);
            s.Execute(`${ct} chattl(id text not null, cid text, idx integer, aid text, txt text)`);

            s.Execute(`${ct} world(id text not null, editing integer, isdir integer, parentid text, depth integer, caption text, thumbid text)`);
            s.Execute(`${ct} worldres(wid text, rid text)`);
            s.Execute(`${ct} worlddetail(id text not null, wid text, title text, desc text)`);

            s.Execute(`${ct} memo(id text not null, caption text, color text, txt text)`);
        }, path);
    }

    private InsertResource(sqlite: SQLite, r: ItemResource): void {
        sqlite.Execute(`select count(*) as cnt from resource where id = '${r.id}'`, [], result => {
            if((result[0]["cnt"] as number) === 0) {
                sqlite.Execute(`insert into resource values('${r.id}', ${r.type}, '${r.resource}')`);
            }
        });
    }

    private InsertStory(sqlite: SQLite, story: Stories): void {
        sqlite.Execute("delete from story");
        sqlite.Execute("delete from storydata");
        sqlite.Execute("delete from storyitem");
        sqlite.Execute("delete from storycontent");
        const ins = "insert into";
        story.GetFlattenStories().forEach(s => {
            const id = s.id;
            const editing = s.isEditing;
            const depth = s.depth;
            const pid = s.parent.id;
            const isdir = s.isDir ? 1 : 0;
            sqlite.Execute(`${ins} story values('${id}', ${editing}, ${depth}, '${pid}', ${isdir})`);

            const d_id = s.content.id;
            const d_cap = s.content.caption;
            const d_desc = s.content.description;
            const d_col = s.content.color;
            const d_time = s.content.time;
            sqlite.Execute(`${ins} storydata values('${d_id}', '${id}', '${d_cap}', '${d_desc}', '${d_col}', ${d_time})`);

            s.content.items.forEach(item => {
                sqlite.Execute(`${ins} storyitem values('${item.id}', '${d_id}', '${item.title}', '${item.color}')`);
                item.stories.forEach(c => {
                    sqlite.Execute(`${ins} storycontent values('${c.id}', '${item.id}', '${c.text}')`);
                });
            });
        });
    }

    private InsertDictionary(sqlite: SQLite, dict: Dictionaries): void {
        sqlite.Execute("delete from dict");
        sqlite.Execute("delete from dictres");
        const ins = "insert into";
        dict.dictionaries.forEach(d => {
            sqlite.Execute(`${ins} dict values('${d.id}', '${d.caption}', '${d.description}', ${d.isEditing ? 1 : 0})`);
            d.resources.forEach(r => {
                this.InsertResource(sqlite, r);
                sqlite.Execute(`${ins} dictres values('${d.id}', '${r.id}')`);
            });
        });
    }

    private InsertActor(sqlite: SQLite, actor: Actors): void {
        sqlite.Execute("delete from actor");
        sqlite.Execute("delete from actorres");
        sqlite.Execute("delete from actordetail");
        const ins = "insert into";
        actor.actors.forEach(a => {
            sqlite.Execute(`${ins} actor values('${a.id}', '${a.face.id}', '${a.name}', '${a.description}', ${a.isEditing ? 1 : 0})`);
            this.InsertResource(sqlite, a.face);
            a.images.forEach(img => {
                this.InsertResource(sqlite, img);
                sqlite.Execute(`${ins} actorres values('${a.id}', '${img.id}')`);
            });
            a.details.forEach(d => {
                sqlite.Execute(`${ins} actordetail values('${d.id}', '${a.id}', '${d.title}', '${d.description}')`);
            });
        });
    }

    private InsertChat(sqlite: SQLite, chat: Chats): void {
        sqlite.Execute("delete from chat");
        sqlite.Execute("delete from chattl");
        const ins = "insert into";
        chat.chats.forEach(c => {
            sqlite.Execute(`${ins} chat values('${c.id}', '${c.storyId}', '${c.description}', ${c.isEditing ? 1 : 0})`);
            c.timeline.forEach((t, i) => {
                sqlite.Execute(`${ins} chattl values('${t.id}', '${c.id}', ${i}, '${t.actorId}', '${t.text}')`);
            })
        });
    }

    private InsertWorld(sqlite: SQLite, world: Worlds): void {
        sqlite.Execute("delete from world");
        sqlite.Execute("delete from worldres");
        sqlite.Execute("delete from worlddetail");
        const ins = "insert into";
        world.GetFlattenWorlds().forEach(w => {
            const editing = w.isEditing ? 1 : 0;
            const dir = w.isDir ? 1 : 0;
            sqlite.Execute(`${ins} world values('${w.id}', ${editing}, ${dir}, '${w.parent.id}', ${w.depth}, '${w.caption}', '${w.image.id}')`);
            this.InsertResource(sqlite, w.image);
            w.resources.forEach(wr => {
                this.InsertResource(sqlite, wr);
                sqlite.Execute(`${ins} worldres values('${w.id}', '${wr.id}')`);
            });
            w.descriptions.forEach(d => {
                sqlite.Execute(`${ins} worlddetail values('${d.id}', '${w.id}', '${d.title}', '${d.text}')`);
            })
        });
    }

    private InsertMemo(sqlite: SQLite, memo: Memos): void {
        sqlite.Execute("delete from memo");
        const ins = "insert into";
        memo.memos.forEach(m => {
            sqlite.Execute(`${ins} memo values('${m.id}', '${m.caption}', '${m.color}', '${m.text}')`);
        });
    }
    
    // --- Load methods ---
    // --------------------
    private ResumeResource(sqlite: SQLite): Array<ItemResource> {
        const resources = new Array<ItemResource>();
        sqlite.Execute("select * from resource", [], r => {
            r.forEach(res => {
                const item = new ItemResource(res['id'] as string, res['type'] as number);
                item.resource = res['content'] as string;
                resources.push(item);
            });
        });
        return resources;
    }

    private ResumeStory(sqlite: SQLite): Stories {
        const story = Stories.Create();
        const squery = 
            "select s.id as id, editing, depth, isdir, sd.id as sdid, caption, desc, color, time " +
            "from story as s inner join storydata as sd on s.id = sd.sid order by time";
        sqlite.Execute(squery, [], r => {
            let currParent = story.root;
            let currDepth = 1;
            r.forEach(s => {
                const id = s['id'] as string;
                const editing = (s['editing'] as number) == 1;
                const depth = s['depth'] as number;
                const isdir = (s['isdir'] as number) == 1;
                const sdid = s['sdid'] as string;
                const caption = s['caption'] as string;
                const desc = s['desc'] as string;
                const color = s['color'] as string;
                const time = s['time'] as number;

                while(currDepth > depth) { // Move for ancestor
                    currParent = currParent.parent;
                    currDepth--;
                }
                if(currDepth < depth) currDepth = depth; // Move for descendant

                const currStory = currParent.AppendStory(caption, isdir);
                currStory.id = id;
                currStory.isEditing = editing;
                currStory.depth = depth;
                currStory.content.id = sdid;
                currStory.content.description = desc;
                currStory.content.color = color;
                currStory.content.time = time;
                if(currStory.isDir) currParent = currStory;
            });
        });
        story.root.InitializeHierarchy();

        const items = new Array<[string, StoryItem]>();
        sqlite.Execute("select * from storyitem", [], r => {
            r.forEach(item => {
                const storyitem = new StoryItem(item['title'] as string);
                storyitem.id = item['id'] as string;
                storyitem.color = item['color'] as string;
                items.push([item['sdid'] as string, storyitem]);
            });
        });

        sqlite.Execute("select * from storycontent", [], r => {
            r.forEach(c => {
                const content = new StoryContent(c['text'] as string);
                content.id = c['id'] as string;
                items.find(x => x[1].id === c['siid'] as string)?.[1].stories.push(content);
            })
        });

        items.forEach(i => {
            story.GetFlattenStories().find(x => x.content.id === i[0])?.content.items.push(i[1]);
        });
        return story;
    }

    private ResumeDictionary(sqlite: SQLite, resources: ItemResource[]): Dictionaries {
        const dict = Dictionaries.Create();
        sqlite.Execute("select * from dict", [], r => {
            r.forEach(d => {
                const item = new DictionaryContent();
                item.id = d['id'] as string;
                item.caption = d['caption'] as string;
                item.description = d['desc'] as string;
                item.isEditing = (d['editing'] as number) === 1;
                dict.dictionaries.push(item);
            });
        });

        sqlite.Execute("select * from dictres", [], r => {
            r.forEach(res => {
                const did = res['did'] as string;
                const rid = res['rid'] as string;
                const resource = resources.find(r => r.id === rid);
                if(resource !== undefined) {
                    dict.dictionaries.find(d => d.id === did)?.resources.push(resource);
                }
            })
        });

        return dict;
    }

    private ResumeActor(sqlite: SQLite, resources: ItemResource[]): Actors {
        const actors = Actors.Create();
        sqlite.Execute("select * from actor", [], r => {
            r.forEach(a => {
                const actor = new ActorData(a['name'] as string);
                actor.id = a['id'] as string;
                actor.description = a['desc'] as string;
                const face = resources.find(r => r.id === a['faceid'] as string);
                if(face !== undefined) {
                    actor.face = face;
                }
                actor.isEditing = (a['editing'] as number) === 1;
                actors.actors.push(actor);
            });
        });

        sqlite.Execute("select * from actorres", [], r => {
            r.forEach(res => {
                const actorId = res['aid'] as string;
                const img = resources.find(resimg => resimg.id === (res['rid'] as string));
                if(img !== undefined) {
                    actors.actors.find(a => a.id === actorId)?.images.push(img);
                }
            })
        });

        sqlite.Execute("select * from actordetail", [], r => {
            r.forEach(d => {
                const detail = new ActorDetail(d['title'] as string);
                detail.id = d['id'] as string;
                detail.description = d['desc'] as string;
                actors.actors.find(a => a.id === d['aid'] as string)?.details.push(detail);
            });
        });

        return actors;
    }

    private ResumeChat(sqlite: SQLite): Chats {
        const chats = Chats.Create();

        sqlite.Execute("select * from chat", [], r => {
            r.forEach(c => {
                const chat = chats.Add(c['sid'] as string);
                chat.id = c['id'] as string;
                chat.description = c['desc'] as string;
                chat.isEditing = (c['editing'] as number) === 1;
            });
        });

        sqlite.Execute("select * from chattl order by idx", [], r => {
            r.forEach(tl => {
                const chat = chats.chats.find(c => c.id === tl['cid'] as string);
                if(chat !== undefined) {
                    const timeline = ChatTalker.Create(
                        tl['id'] as string,
                        tl['aid'] as string,
                        tl['txt'] as string
                    );
                    chat.timeline.push(timeline);
                }
            });
        });

        return chats;
    }

    private ResumeWorld(sqlite: SQLite, resources: ItemResource[]): Worlds {
        const worlds = Worlds.Create();
        sqlite.Execute("select * from world order by depth", [], r => {
            let currentDepth = 1;
            r.forEach(w => {
                const depth = w['depth'] as number;
                if(depth === 1) { // Children of the root
                    const world = worlds.AddWorldData(w['caption'] as string, (w['isdir'] as number) === 1);
                    const res = resources.find(r => r.id === w['thumbid'] as string);
                    if(res !== undefined) {
                        world.image = res;
                    }
                } else { // Children of the root's children
                    if(currentDepth !== depth) {
                        worlds.MakeFlattenWorlds();
                        currentDepth = depth;
                    }
                    // pw: parent world, not password ----------------↓
                    const parents = worlds.GetFlattenWorlds().filter(pw => pw.depth === depth - 1);
                    const parent = parents.find(p => p.id === w['parentid'] as string);
                    if(parent !== undefined) {
                        const world = parent.Add(w['caption'] as string, (w['isdir'] as number) === 1);
                        const res = resources.find(r => r.id === w['thimbid'] as string);
                        if(res !== undefined) {
                            world.image = res;
                        }
                    }
                }
            });
        });
        worlds.MakeFlattenWorlds();

        sqlite.Execute("select * from worldres", [], r => {
            r.forEach(res => {
                const item = resources.find(i => i.id === res['rid']);
                if(item !== undefined) {
                    worlds.GetFlattenWorlds().find(w => w.id === res['wid'] as string)?.resources.push(item);
                }
            });
        });

        sqlite.Execute("select * from worlddetail", [], r => {
            r.forEach(d => {
                const world = worlds.GetFlattenWorlds().find(w => w.id === d['wid'] as string);
                if(world !== undefined) {
                    const detail = world.AppendDesc(d['title'] as string, d['desc'] as string);
                    detail.id = d['id'] as string;
                }
            });
        })

        return worlds;
    }

    private ResumeMemo(sqlite: SQLite): Memos {
        const memos = Memos.Create();
        sqlite.Execute("select * from memo", [], r => {
            r.forEach(m => {
                const memo = memos.Add(m['caption'] as string, m['txt'] as string);
                memo.id = m['id'] as string;
                memo.color = m['color'] as string;
            });
        });
        return memos;
    }
}

export class SQLiteConverterAsync {
    public async SaveAsync(dest: string, obj: StoryWriterObject): Promise<Error | null> {
        return await PlaneSQLite.Procedure(async s => {
            const create = await this.MakeDatabase(dest);
            if(create !== null) throw create;
            await s.Execute("delete from resource");
            await this.InsertStory(s, obj.story);
            await this.InsertDictionary(s, obj.dict);
            await this.InsertActor(s, obj.actor);
            await this.InsertChat(s, obj.chat);
            await this.InsertWorld(s, obj.world);
            await this.InsertMemo(s, obj.memo);
        }, dest);
    }

    public async LoadAsync(source: string): Promise<Error | StoryWriterObject> {
        const obj = new StoryWriterObject();
        const err = await PlaneSQLite.Procedure(async s => {
            const resources = await this.ResumeResource(s);
            obj.story = await this.ResumeStory(s);
            obj.dict = await this.ResumeDictionary(s, resources);
            obj.actor = await this.ResumeActor(s, resources);
            obj.chat = await this.ResumeChat(s);
            obj.world = await this.ResumeWorld(s, resources);
            obj.memo = await this.ResumeMemo(s);
        }, source, false);
        if(err !== null) return err;
        obj.currentView = ViewSelection.ViewType.Story;
        return obj;
    }

    // --- Save methods ---
    // --------------------
    public async MakeDatabase(path: string): Promise<Error | null> {
        return PlaneSQLite.Procedure(async s => {
            const hasTable =
                (await s.Execute("select count(*) as tc from sqlite_master where type='table'"))[0]['tc'] as number > 0;
            if(hasTable) return;

            const ct = "create table";
            await s.Execute(`${ct} resource(id text not null, type integer, content blob)`);

            await s.Execute(`${ct} story(id text not null, editing integer, depth integer, parentid text, isdir integer)`);
            await s.Execute(`${ct} storydata(id text not null, sid text, caption text, desc text, color text, time integer)`);
            await s.Execute(`${ct} storyitem(id text not null, sdid text, title text, color text)`);
            await s.Execute(`${ct} storycontent(id text not null, siid text, txt text)`);

            await s.Execute(`${ct} dict(id text not null, caption text, desc text, editing integer)`);
            await s.Execute(`${ct} dictres(did text, rid text)`);

            await s.Execute(`${ct} actor(id text not null, faceid text, name text, desc text, editing number)`);
            await s.Execute(`${ct} actorres(aid text, rid text)`);
            await s.Execute(`${ct} actordetail(id text, aid text, title text, desc text)`);

            await s.Execute(`${ct} chat(id text not null, sid text, desc text, editing integer)`);
            await s.Execute(`${ct} chattl(id text not null, cid text, idx integer, aid text, txt text)`);

            await s.Execute(`${ct} world(id text not null, editing integer, isdir integer, parentid text, depth integer, caption text, thumbid text)`);
            await s.Execute(`${ct} worldres(wid text, rid text)`);
            await s.Execute(`${ct} worlddetail(id text not null, wid text, title text, desc text)`);

            await s.Execute(`${ct} memo(id text not null, caption text, color text, txt text)`);
        }, path);
    }

    private async InsertResource(sqlite: PlaneSQLite, r: ItemResource): Promise<void> {
        const result = await sqlite.Execute(`select count(*) as cnt from resource where id = '${r.id}'`);
        if((result[0]["cnt"] as number) === 0) {
            await sqlite.Execute(`insert into resource values('${r.id}', ${r.type}, '${r.resource}')`);
        }
    }

    private async InsertStory(sqlite: PlaneSQLite, story: Stories): Promise<void> {
        await sqlite.Execute("delete from story");
        await sqlite.Execute("delete from storydata");
        await sqlite.Execute("delete from storyitem");
        await sqlite.Execute("delete from storycontent");
        const ins = "insert into";
        for(const s of story.GetFlattenStories()) {
            const id = s.id;
            const editing = s.isEditing;
            const depth = s.depth;
            const pid = s.parent.id;
            const isdir = s.isDir ? 1 : 0;
            await sqlite.Execute(`${ins} story values('${id}', ${editing}, ${depth}, '${pid}', ${isdir})`);

            const d_id = s.content.id;
            const d_cap = s.content.caption;
            const d_desc = s.content.description;
            const d_col = s.content.color;
            const d_time = s.content.time;
            await sqlite.Execute(`${ins} storydata values('${d_id}', '${id}', '${d_cap}', '${d_desc}', '${d_col}', ${d_time})`);

            for(const item of s.content.items) {
                await sqlite.Execute(`${ins} storyitem values('${item.id}', '${d_id}', '${item.title}', '${item.color}')`);
                for(const c of item.stories) {
                    await sqlite.Execute(`${ins} storycontent values('${c.id}', '${item.id}', '${c.text}')`);
                }
            }
        }
    }

    private async InsertDictionary(sqlite: PlaneSQLite, dict: Dictionaries): Promise<void> {
        await sqlite.Execute("delete from dict");
        await sqlite.Execute("delete from dictres");
        const ins = "insert into";
        for(const d of dict.dictionaries) {
            await  sqlite.Execute(`${ins} dict values('${d.id}', '${d.caption}', '${d.description}', ${d.isEditing ? 1 : 0})`);
            for(const r of d.resources) {
                this.InsertResource(sqlite, r);
                await sqlite.Execute(`${ins} dictres values('${d.id}', '${r.id}')`);
            }
        }
    }

    private async InsertActor(sqlite: PlaneSQLite, actor: Actors): Promise<void> {
        await sqlite.Execute("delete from actor");
        await sqlite.Execute("delete from actorres");
        await sqlite.Execute("delete from actordetail");
        const ins = "insert into";
        for(const a of actor.actors) {
            await sqlite.Execute(`${ins} actor values('${a.id}', '${a.face.id}', '${a.name}', '${a.description}', ${a.isEditing ? 1 : 0})`);
            this.InsertResource(sqlite, a.face);
            for(const img of a.images) {
                this.InsertResource(sqlite, img);
                await sqlite.Execute(`${ins} actorres values('${a.id}', '${img.id}')`);
            }
            for(const d of a.details) {
                await sqlite.Execute(`${ins} actordetail values('${d.id}', '${a.id}', '${d.title}', '${d.description}')`);
            }
        }
    }

    private async InsertChat(sqlite: PlaneSQLite, chat: Chats): Promise<void> {
        await sqlite.Execute("delete from chat");
        await sqlite.Execute("delete from chattl");
        const ins = "insert into";
        for(const c of chat.chats) {
            await sqlite.Execute(`${ins} chat values('${c.id}', '${c.storyId}', '${c.description}', ${c.isEditing ? 1 : 0})`);
            let i = 0;
            for(const t of c.timeline) {
                await sqlite.Execute(`${ins} chattl values('${t.id}', '${c.id}', ${i++}, '${t.actorId}', '${t.text}')`);
            }
        }
    }

    private async InsertWorld(sqlite: PlaneSQLite, world: Worlds): Promise<void> {
        await sqlite.Execute("delete from world");
        await sqlite.Execute("delete from worldres");
        await sqlite.Execute("delete from worlddetail");
        const ins = "insert into";
        for(const w of world.GetFlattenWorlds()) {
            const editing = w.isEditing ? 1 : 0;
            const dir = w.isDir ? 1 : 0;
            await sqlite.Execute(`${ins} world values('${w.id}', ${editing}, ${dir}, '${w.parent.id}', ${w.depth}, '${w.caption}', '${w.image.id}')`);
            this.InsertResource(sqlite, w.image);
            for(const wr of w.resources) {
                this.InsertResource(sqlite, wr);
                await sqlite.Execute(`${ins} worldres values('${w.id}', '${wr.id}')`);
            }
            for(const d of w.descriptions) {
                await sqlite.Execute(`${ins} worlddetail values('${d.id}', '${w.id}', '${d.title}', '${d.text}')`);
            }
        }
    }

    private async InsertMemo(sqlite: PlaneSQLite, memo: Memos): Promise<void> {
        await sqlite.Execute("delete from memo");
        const ins = "insert into";
        for(const m of memo.memos) {
            await sqlite.Execute(`${ins} memo values('${m.id}', '${m.caption}', '${m.color}', '${m.text}')`);
        }
    }
    
    // --- Load methods ---
    // --------------------
    private async ResumeResource(sqlite: PlaneSQLite): Promise<Array<ItemResource>> {
        const resources = new Array<ItemResource>();
        const r = await sqlite.Execute("select * from resource");
        r.forEach(res => {
            const item = new ItemResource(res['id'] as string, res['type'] as number);
            item.resource = res['content'] as string;
            resources.push(item);
        });
        return resources;
    }

    private async ResumeStory(sqlite: PlaneSQLite): Promise<Stories> {
        const story = Stories.Create();
        const squery = 
            "select s.id as id, editing, depth, isdir, sd.id as sdid, caption, desc, color, time " +
            "from story as s inner join storydata as sd on s.id = sd.sid order by time";
        const r1 = await sqlite.Execute(squery);
        let currParent = story.root;
        let currDepth = 1;
        r1.forEach(s => {
            const id = s['id'] as string;
            const editing = (s['editing'] as number) === 1;
            const depth = s['depth'] as number;
            const isdir = (s['isdir'] as number) === 1;
            const sdid = s['sdid'] as string;
            const caption = s['caption'] as string;
            const desc = s['desc'] as string;
            const color = s['color'] as string;
            const time = s['time'] as number;

            while(currDepth > depth) { // Move for ancestor
                currParent = currParent.parent;
                currDepth--;
            }

            if(currDepth < depth) currDepth = depth; // Move for descendant
            const currStory = currParent.AppendStory(caption, isdir);
            currStory.id = id;
            currStory.isEditing = editing;
            currStory.depth = depth;
            currStory.content.id = sdid;
            currStory.content.description = desc;
            currStory.content.color = color;
            currStory.content.time = time;
            if(currStory.isDir) currParent = currStory;
        });
        story.root.InitializeHierarchy();

        const items = new Array<[string, StoryItem]>();
        const r2 = await sqlite.Execute("select * from storyitem");
        r2.forEach(item => {
            const storyitem = new StoryItem(item['title'] as string);
            storyitem.id = item['id'] as string;
            storyitem.color = item['color'] as string;
            items.push([item['sdid'] as string, storyitem]);
        });

        const r3 = await sqlite.Execute("select * from storycontent");
        r3.forEach(c => {
            const content = new StoryContent(c['text'] as string);
            content.id = c['id'] as string;
            items.find(x => x[1].id === c['siid'] as string)?.[1].stories.push(content);
        });

        items.forEach(i => {
            story.GetFlattenStories().find(x => x.content.id === i[0])?.content.items.push(i[1]);
        });
        return story;
    }

    private async ResumeDictionary(sqlite: PlaneSQLite, resources: ItemResource[]): Promise<Dictionaries> {
        const dict = Dictionaries.Create();
        const r1 = await sqlite.Execute("select * from dict");
        r1.forEach(d => {
            const item = new DictionaryContent();
            item.id = d['id'] as string;
            item.caption = d['caption'] as string;
            item.description = d['desc'] as string;
            item.isEditing = (d['editing'] as number) === 1;
            dict.dictionaries.push(item);
        });

        const r2 = await sqlite.Execute("select * from dictres");
        r2.forEach(res => {
            const did = res['did'] as string;
            const rid = res['rid'] as string;
            const resource = resources.find(r => r.id === rid);
            if(resource !== undefined) {
                dict.dictionaries.find(d => d.id === did)?.resources.push(resource);
            }
        });

        return dict;
    }

    private async ResumeActor(sqlite: PlaneSQLite, resources: ItemResource[]): Promise<Actors> {
        const actors = Actors.Create();
        const r1 = await sqlite.Execute("select * from actor");
        r1.forEach(a => {
            const actor = new ActorData(a['name'] as string);
            actor.id = a['id'] as string;
            actor.description = a['desc'] as string;
            const face = resources.find(r => r.id === a['faceid'] as string);
            if(face !== undefined) {
                actor.face = face;
            }
            actor.isEditing = (a['editing'] as number) === 1;
            actors.actors.push(actor);
        });

        const r2 = await sqlite.Execute("select * from actorres");
        r2.forEach(res => {
            const actorId = res['aid'] as string;
            const img = resources.find(resimg => resimg.id === (res['rid'] as string));
            if(img !== undefined) {
                actors.actors.find(a => a.id === actorId)?.images.push(img);
            }
        });

        const r3 = await sqlite.Execute("select * from actordetail");
        r3.forEach(d => {
            const detail = new ActorDetail(d['title'] as string);
            detail.id = d['id'] as string;
            detail.description = d['desc'] as string;
            actors.actors.find(a => a.id === d['aid'] as string)?.details.push(detail);
        });

        return actors;
    }

    private async ResumeChat(sqlite: PlaneSQLite): Promise<Chats> {
        const chats = Chats.Create();

        const r1 = await sqlite.Execute("select * from chat");
        r1.forEach(c => {
            const chat = chats.Add(c['sid'] as string);
            chat.id = c['id'] as string;
            chat.description = c['desc'] as string;
            chat.isEditing = (c['editing'] as number) === 1;
        });

        const r2 = await sqlite.Execute("select * from chattl order by idx");
        r2.forEach(tl => {
            const chat = chats.chats.find(c => c.id === tl['cid'] as string);
            if(chat !== undefined) {
                const timeline = ChatTalker.Create(
                    tl['id'] as string,
                    tl['aid'] as string,
                    tl['txt'] as string
                );
                chat.timeline.push(timeline);
            }
        });

        return chats;
    }

    private async ResumeWorld(sqlite: PlaneSQLite, resources: ItemResource[]): Promise<Worlds> {
        const worlds = Worlds.Create();
        const r1 = await sqlite.Execute("select * from world order by depth");
        let currentDepth = 1;
        r1.forEach(w => {
            const depth = w['depth'] as number;
            if(depth === 1) { // Children of the root
                const world = worlds.AddWorldData(w['caption'] as string, (w['isdir'] as number) === 1);
                const res = resources.find(r => r.id === w['thumbid'] as string);
                if(res !== undefined) {
                    world.image = res;
                }
            } else { // Children of the root's children
                if(currentDepth !== depth) {
                    worlds.MakeFlattenWorlds();
                    currentDepth = depth;
                }
                // pw: parent world, not password ----------------↓
                const parents = worlds.GetFlattenWorlds().filter(pw => pw.depth === depth - 1);
                const parent = parents.find(p => p.id === w['parentid'] as string);
                if(parent !== undefined) {
                    const world = parent.Add(w['caption'] as string, (w['isdir'] as number) === 1);
                    const res = resources.find(r => r.id === w['thimbid'] as string);
                    if(res !== undefined) {
                        world.image = res;
                    }
                }
            }
        });
        worlds.MakeFlattenWorlds();

        const r2 = await sqlite.Execute("select * from worldres");
        r2.forEach(res => {
            const item = resources.find(i => i.id === res['rid']);
            if(item !== undefined) {
                worlds.GetFlattenWorlds().find(w => w.id === res['wid'] as string)?.resources.push(item);
            }
        });

        const r3 = await sqlite.Execute("select * from worlddetail");
        r3.forEach(d => {
            const world = worlds.GetFlattenWorlds().find(w => w.id === d['wid'] as string);
            if(world !== undefined) {
                const detail = world.AppendDesc(d['title'] as string, d['desc'] as string);
                detail.id = d['id'] as string;
            }
        });

        return worlds;
    }

    private async ResumeMemo(sqlite: PlaneSQLite): Promise<Memos> {
        const memos = Memos.Create();
        const r = await sqlite.Execute("select * from memo");
        r.forEach(m => {
            const memo = memos.Add(m['caption'] as string, m['txt'] as string);
            memo.id = m['id'] as string;
            memo.color = m['color'] as string;
        });
        return memos;
    }
}