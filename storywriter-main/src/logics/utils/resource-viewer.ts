export default class ResourceViewer {
    public src = "";
    public visible = false;

    public static Show(src: string): ResourceViewer {
        const viewer = new ResourceViewer();
        viewer.src = src;
        viewer.visible = true;
        return viewer;
    }
}