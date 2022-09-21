import os from 'os';

export class Defs {
    public static readonly MessageType = {
        None: 0,
        Confirm: 1,
        Reject: 2
    } as const;

    public static readonly ResourceType = {
        None: 0,
        Image: 1,
        Audio: 2
    } as const;

    public static readonly definedDarkColors: string[] = [
        "#434343", // Gray
        "#582020", // Red
        "#583b20", // Orange
        "#585520", // Yellow
        "#395820", // Light Green
        "#20582b", // Green
        "#205852", // Skyblue
        "#204158", // Waterblue
        "#202458", // Blue
        "#3f2058", // Violet
        "#58204f", // Cherry blossom
        "#582039", // Crimson
    ];

    public static readonly definedLightColors: string[] = [
        "#bababa", // Gray
        "#bd4540", // Red
        "#c78640", // Orange
        "#ccc84b", // Yellow
        "#81d14b", // Light Green
        "#4bcc72", // Green
        "#4acccc", // Skyblue
        "#4b8dcf", // Waterblue
        "#4c4acc", // Blue
        "#9750c7", // Violet
        "#d14db4", // Cherry blossom
        "#d14b81", // Crimson
    ];

    public static readonly imageAccepts: string = "image/jpeg,image/jpg,image/png,image/gif";

    public static getTempDirectory(): string {
        const user = os.homedir();
        if(user.length != 0) {
            return user + "\\AppData\\Roaming\\StoryWriter";
        }
        return "\\";
    }
}
