import { ipcMain, ipcRenderer } from "electron";
import { IpcMainEvent, IpcRendererEvent } from "electron/main";
import { mapActions } from "vuex";

export class IpcUtils {
    public static RelayedPrefix = "Relayed::";

    public static GenRelayedChannel(channel: string): string {
        return IpcUtils.RelayedPrefix + channel;
    }

    public static Send(channel: string, message?: string): void {
        ipcRenderer.send(channel, message);
    }

    public static Receive(channel: string, action: (e: IpcRendererEvent, ...args: any[]) => void): void {
        ipcRenderer.on(channel, action);
    }

    public static ReceiveOnMain(channel: string, action?: (e?: IpcMainEvent, args?: any[]) => void): void {
        ipcMain.on(channel, async (e, a) => {
            if(action !== undefined) {
                action(e, a);
            }
        });
    }

    public static RelayOnMain(channel: string, action?: (e?: IpcMainEvent, args?: any[]) => void): void {
        ipcMain.on(channel, async(e, a) => {
            if(action !== undefined) {
                action(e, a);
            }
            e.sender.send(IpcUtils.GenRelayedChannel(channel), a);
        })
    }
}