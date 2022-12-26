import { BrowserWindow, dialog } from "electron";
import { IpcUtils } from "../utils/ipc-utils";

export class Dialog {
    public static async SaveDialog(win: BrowserWindow, uri: string): Promise<string> {
      console.log(uri);
      if(!uri.includes(".ysd")) {
        const result = await dialog.showSaveDialog(win, {
          filters: [
              { name: "セーブファイル (Your Story Data)", extensions: ["ysd"]},
              { name: "All Files", extensions: ["*"]}
          ]
        });
      
        if(result.canceled) return IpcUtils.DefinedIpcChannels.Cancel;
        if(result.filePath === undefined) return "";
        if(result.filePath.length > 0) {
          return result.filePath;
        }
      }
      return uri;
    }

    public static async LoadDialog(win: BrowserWindow): Promise<string> {
      const result = await dialog.showOpenDialog(win, {
        filters: [
          { name: "セーブファイル (Your Story Data)", extensions: ["ysd"]},
          { name: "All Files", extensions: ["*"]}
        ]
      });
      
      if(result.canceled) return IpcUtils.DefinedIpcChannels.Cancel;
      if(result.filePaths.length < 1) return "";
      return result.filePaths[0];
    }
}