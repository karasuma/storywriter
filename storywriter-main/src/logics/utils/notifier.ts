export default class Notifier {
    private history = new Array<[string, number]>();
    private historyLimit = 10;

    public static readonly Levels = {
        Info: 0,
        Warning: 1,
        Alert: 2
    } as const;

    constructor(limit?: number) {
        this.historyLimit = limit ?? 10;
    }

    public ChangeHistoryLimit(limit = 10, cut = false): void {
        if(limit <= 1) return;
        if(cut && this.historyLimit < limit) {
            this.history.splice(0, this.historyLimit);
        }
        this.historyLimit = limit;
    }

    public Send(message: string, level: number = Notifier.Levels.Info): void {
        this.history.push([message, level]);
        if(this.history.length > this.historyLimit) {
            this.history.splice(0, 1);
        }
    }

    public GetLatest(): [string, number] {
        if(this.history.length === 0) {
            return ["You're floating on the sea of imagine now...", Notifier.Levels.Info];
        }
        return this.history[this.history.length - 1];
    }

    public GetMessage(index = -1): [string, number] {
        if(index < 0) {
            return this.GetLatest();
        }
        if(this.history.length <= index) {
            return ["GetMessage(notifier.ts): History index out of range.", Notifier.Levels.Alert];
        }
        return this.history[index];
    }
}