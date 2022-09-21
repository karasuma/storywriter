export default class ViewSelection {
    public static readonly ViewType = {
        Story: 1,
        Calendar: 2,
        Dictionary: 3,
    } as const;

    public currentView = 3;

    public ChangeCurrentView(view: number): void {
        this.currentView = view;
    }
}
