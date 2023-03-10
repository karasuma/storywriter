export default class ViewSelection {
    public static readonly ViewType = {
        Story: 1,
        Calendar: 2,
        Dictionary: 3,
        Actor: 4,
        Chat: 5,
        World: 6,
        Memo: 7
    } as const;

    public currentView = 7;

    public ChangeCurrentView(view: number): void {
        this.currentView = view;
    }
}
