import { IpcUtils } from "./ipc-utils";

export default class SystemMessage {
    public static readonly MessageType = {
        Info: "#6495EE",
        Normal: "#6495ED",
        Warning: "#DAA520",
        Alert: "#B22222"
    } as const;

    public static readonly MessageResult = {
        None: 0,
        OK: 1,
        No: 2,
        Cancel: 3
    } as const;

    public title = "";
    public message = "";
    public status: string = SystemMessage.MessageType.Normal;
    public strictly = false;
    public visible = false;

    constructor(title?: string, message?: string, status?: string, strictly?: boolean) {
        this.title = title ?? "情報";
        this.message = message ?? "メッセージが設定されていません。";
        this.status = status ?? SystemMessage.MessageType.Normal;
        this.strictly = strictly ?? false;
    }

    public static Create(title?: string, message?: string, status?: string, strictly?: boolean): SystemMessage {
        const msg = new SystemMessage(title, message, status, strictly);
        msg.visible = true;
        return msg;
    }
}

