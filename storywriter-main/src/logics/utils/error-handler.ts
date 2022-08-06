import Logger from "./logger";
import { ipcRenderer } from "electron";
import { IpcUtils } from "./ipc-utils";

export default class ErrorHandler {
    public static readonly ErrorLevel = {
        Notice: 1,
        Warning: 2,
        Failed: 4,
        Critical: 8
    } as const;

    public static MessagingLevel = ErrorHandler.ErrorLevel.Warning;

    public static RaiseError(caption: string, message: string, level: number): string {
        // Logging
        const logstr = Logger.write(caption, message, Math.log2(level));

        // Abort if the cirtical error has occured
        if(level == ErrorHandler.ErrorLevel.Critical) {
            IpcUtils.Send('KernelPanic', caption, message);
            return logstr;
        }

        return logstr;
    }
}