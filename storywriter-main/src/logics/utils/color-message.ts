export default class ColorMessage {
    public static readonly Type = {
        Dark: true,
        Light: false
    } as const;

    public type: boolean = ColorMessage.Type.Dark;
    public visible = false;

    public static Show(type?: boolean): ColorMessage {
        const msg = new ColorMessage();
        msg.type = type ?? ColorMessage.Type.Dark;
        msg.visible = true;
        return msg;
    }
}