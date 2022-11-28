import { StoryWriterObject } from "../storywriter-object";
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import { SQLiteConverter } from "./object-converter";

export class Savedata {
    public static Save(filepath: string, obj: StoryWriterObject): Promise<Error | null> {
        const temp = `${path.dirname(filepath)}\\${Date.now().toString(16)}.tmp`;
        
        return new Promise<Error | null>(resolve => {
            const errPrefix = "Savedata.Save(filepath, storywriter)";

            // DB
            const db = new SQLiteConverter();
            const result = db.Save(temp, obj);
            if(result instanceof Error) {
                resolve(result);
                return;
            }

            // Zip
            const zippingStream = fs.createReadStream(temp)
                                    .pipe(zlib.createGzip())
                                    .pipe(fs.createWriteStream(filepath));
            zippingStream.on('error', err => resolve(err));

            // DB & Remove temporary file
            zippingStream.on('finish', () => {
                fs.unlink(temp, err => {
                    if(err !== null) {
                        resolve(new Error(`${errPrefix}: Error occurred on compressing.`));
                    } else {
                        resolve(null);
                    }
                });
            });
        });
    }

    public static async Load(filepath: string): Promise<Error | StoryWriterObject> {
        const temp = `${path.dirname(filepath)}\\${Date.now().toString(16)}.tmp`;

        return new Promise<Error | StoryWriterObject>(resolve => {
            //const errPrefix = "Savedata.Save(filepath, storywriter)";

            // Unzip
            const unzipStream = fs.createReadStream(filepath)
                                  .pipe(zlib.createGunzip())
                                  .pipe(fs.createWriteStream(temp));
            unzipStream.on('error', err => resolve(err));

            // DB & Remove temporary file
            unzipStream.on('finish', () => {
                const db = new SQLiteConverter();
                const result = db.Load(temp);
                if(result instanceof StoryWriterObject) {
                    fs.unlink(temp, () => resolve(result));
                } else {
                    resolve(result);
                }
            });
        });
    }
}