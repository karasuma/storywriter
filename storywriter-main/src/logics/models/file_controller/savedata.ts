import { StoryWriterObject } from "../storywriter-object";
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';
import { ObjectConverterAsync } from "./object-converter";

export class Savedata {
    public static GetTempFile(filepath: string): string {
        const dir = path.dirname(filepath);
        const tmp = `${Date.now().toString(16)}.tmp`;
        if(dir.slice(-1)[0] === '\\') return `${dir}${tmp}`;
        return `${dir}\\${tmp}`;
    }

    public static async Save(filepath: string, obj: StoryWriterObject): Promise<Error | null> {
        const temp = Savedata.GetTempFile(filepath);

        // DB
        const result = await ObjectConverterAsync.SaveAsync(temp, obj);
        if(result !== null) {
            return result;
        }
        
        return new Promise<Error | null>(resolve => {
            const errPrefix = "Savedata.Save(filepath, storywriter)";

            // Zip
            const zippingStream = fs.createReadStream(temp)
                                    .pipe(zlib.createGzip())
                                    .pipe(fs.createWriteStream(filepath));
            zippingStream.on('error', err => resolve(err));

            // DB & Remove temporary file
            zippingStream.on('finish', () => {
                fs.rm(temp, err => {
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
        const temp = Savedata.GetTempFile(filepath);

        return new Promise<Error | StoryWriterObject>(resolve => {
            // Unzip
            const unzipStream = fs.createReadStream(filepath)
                                  .pipe(zlib.createGunzip())
                                  .pipe(fs.createWriteStream(temp));
            unzipStream.on('error', err => resolve(err));

            // DB & Remove temporary file
            unzipStream.on('finish', async () => {
                const result = await ObjectConverterAsync.LoadAsync(temp);
                if(result instanceof StoryWriterObject) {
                    fs.rm(temp, () => resolve(result));
                } else {
                    resolve(result);
                }
            });
        });
    }
}