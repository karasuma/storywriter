export default class Notifier {
    private static history = new Array<[string, number]>();
    private static historyLimit = 10;

    public static readonly Levels = {
        Info: 1,
        Warning: 2,
        Alert: 4
    } as const;

    public static ChangeHistoryLimit(limit = 10, cut = false): void {
        if(limit <= 1) return;
        if(cut && Notifier.historyLimit < limit) {
            Notifier.history.splice(0, Notifier.historyLimit);
        }
        Notifier.historyLimit = limit;
    }

    public static Send(message: string, level: number = Notifier.Levels.Info): void {
        this.history.push([message, level]);
        if(this.history.length > Notifier.historyLimit) {
            this.history.splice(0, 1);
        }
    }

    public static GetLatest(): [string, number] {
        return Notifier.history[Notifier.history.length - 1];
    }

    public static GetMessage(index = -1): [string, number] {
        if(index < 0) {
            return Notifier.history[Notifier.history.length - 1];
        }
        if(Notifier.history.length <= index) {
            return ["GetMessage(notifier.ts): History index out of range.", Notifier.Levels.Alert];
        }
        return Notifier.history[index];
    }
}