export default class InputMessage {
    public title = "";
    public defaultText = "";
    public visible = false;

    constructor(title?: string, text?: string) {
        this.title = title ?? "入力";
        this.defaultText = text ?? "";
    }

    public static Create(title?: string, text?: string): InputMessage {
        const msg = new InputMessage(title, text);
        msg.visible = true;
        return msg;
    }
}