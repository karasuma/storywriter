import { ipcMain, ipcRenderer } from "electron";
import { IpcMainInvokeEvent, IpcRendererEvent } from "electron/main";

export class IpcUtils {
    public static readonly DefinedIpcChannels = {
        Minimize: "minimize",
        Maximize: "maximize",
        Close: "close",
        KernelPanic: "KernelPanic",
        MessageBox: "messagebox",
        InputBox: "inputbox",
        Save: "save",
        Load: "load",
        Cancel: "cancel",
        SaveClose: "save_close",
        SaveHome: "save_home",
        HomeData: "home_data",
        DefaultStoryPath: "def_file_path"
    } as const;

    public static RelayedPrefix = "Relayed::";

    public static GenRelayedChannel(channel: string): string {
        return IpcUtils.RelayedPrefix + channel;
    }

    public static Send(channel: string, ...args: unknown[]): void {
        ipcRenderer.invoke(channel, args);
    }

    public static Receive(channel: string, action: (e: IpcRendererEvent, ...args: unknown[]) => void): void {
        ipcRenderer.on(channel, action);
    }

    public static ReceiveFromRelay(channel: string, action: (e: IpcRendererEvent, ...args: unknown[]) => void): void {
        IpcUtils.Receive(IpcUtils.GenRelayedChannel(channel), action);
    }

    public static ReceiveOnMain(channel: string, action?: (event?: IpcMainInvokeEvent, ...args: unknown[]) => void): void {
        ipcMain.handle(channel, (e, a) => {
            if(action !== undefined) {
                action(e, a);
            }
        });
    }

    public static ReceiveOnMainAsync(channel: string, action?: (event?: IpcMainInvokeEvent, ...args: unknown[]) => Promise<void>): void {
        ipcMain.handle(channel, async (e, a) => {
            if(action !== undefined) await action(e, a);
        });
    }

    public static RelayOnMain(channel: string, action?: (event?: IpcMainInvokeEvent, ...args: unknown[]) => unknown): void {
        ipcMain.handle(channel, (e, a) => {
            if(action !== undefined) {
                const resultArgs = action(e, a);
                console.log(resultArgs);
                e.sender.send(IpcUtils.GenRelayedChannel(channel), resultArgs);
                return;
            }
            e.sender.send(IpcUtils.GenRelayedChannel(channel), a);
        })
    }

    public static RelayOnMainAsync(channel: string, action?: (event?: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>): void {
        ipcMain.handle(channel, async (e, a) => {
            if(action !== undefined) {
                const resultArgs = await action(e, a);
                e.sender.send(IpcUtils.GenRelayedChannel(channel), resultArgs);
                return;
            }
            e.sender.send(IpcUtils.GenRelayedChannel(channel), a);
        })
    }
}