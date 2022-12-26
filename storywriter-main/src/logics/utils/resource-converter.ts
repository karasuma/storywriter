import fs from 'fs';

export class ResourceConverter {
    public static readonly FileType = {
        TXT: "text/plain",
        JPG: "image/jpeg",
        PNG: "image/png",
        GIF: "image/gif",
        BMP: "image/bmp",
        ICO: "image/vnd.microsoft.icon",
        TIF: "image/tiff",
        WEBP: "image/webp",
        SVG: "image/svg+xml",
        MIDI: "audio/midi",
        MP3: "audio/mpeg",
        MPEG: "audio/mpeg",
    } as const;
    public static ConvImageAsBStr(filetype: string, filepath: string): string {
        const b64str = fs.readFileSync(filepath, 'base64');
        return `data:${filetype};base64,${b64str}`;
    }
}