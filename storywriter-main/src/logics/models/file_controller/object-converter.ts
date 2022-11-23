import { Actors } from "../actor-data";
import { Chats } from "../chat-data";
import { Dictionaries } from "../dictionary-data";
import { Memos } from "../memo-data";
import { ItemResource } from "../resource";
import { Stories } from "../story-data";
import { StoryWriterObject } from "../storywriter-object";
import { Worlds } from "../world-data";
import { SQLite } from "./database";

export interface IObjectConverter {
    Save(dest: string, obj: StoryWriterObject): Error | null;
    Load(source: string): StoryWriterObject;
}

export class SQLiteConverter implements IObjectConverter {
    public Save(dest: string, obj: StoryWriterObject): Error | null {
        return SQLite.Procedure(s => {
            this.MakeDatabase(dest);
            this.InsertStory(s, obj.story);
            this.InsertDictionary(s, obj.dict);
            this.InsertActor(s, obj.actor);
            this.InsertChat(s, obj.chat);
            this.InsertWorld(s, obj.world);
            this.InsertMemo(s, obj.memo);
        }, dest);
    }
    public Load(source: string): StoryWriterObject {
        throw new Error("Method not implemented.");
    }

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

            story.content.items.forEach(item => {
                sqlite.Execute(`${ins} storyitem values('${item.id}', '${d_id}', '${item.title}', '${item.color}')`);
                item.stories.forEach(c => {
                    sqlite.Execute(`${ins} storycontent values('${c.id}', '${item.id}', '${c.text}')`);
                });
            });
        });
    }

    private InsertDictionary(sqlite: SQLite, dict: Dictionaries): void {
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
        const ins = "insert into";
        chat.chats.forEach(c => {
            sqlite.Execute(`${ins} chat values('${c.id}', '${c.storyId}', '${c.description}', ${c.isEditing ? 1 : 0})`);
            c.timeline.forEach((t, i) => {
                sqlite.Execute(`${ins} chattl values('${t.id}', '${c.id}', ${i}, '${t.actorId}', '${t.text}')`);
            })
        });
    }

    private InsertWorld(sqlite: SQLite, world: Worlds): void {
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
        const ins = "insert into";
        memo.memos.forEach(m => {
            sqlite.Execute(`${ins} memo values('${m.id}', '${m.caption}', '${m.color}', '${m.text}')`);
        });
    }
}