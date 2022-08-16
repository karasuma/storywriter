export default class DragElement {
    public static BorderColor = "#ba2636";

    private document: Document;

    constructor(document: Document) {
        this.document = document;
    }

    public DragStart(ID: string, event: DragEvent): void {
        event.dataTransfer?.setData("text/plain", ID);
    }

    public DragOver(ID: string, event: DragEvent): void {
        event.preventDefault();
        const el = this.document.getElementById(ID);
        if(el === null) return;

        const rect = el.getBoundingClientRect();
        if((event.clientY - rect.top) < (el.clientHeight * 0.5)) {
            el.style.borderTop = `solid 3px ${DragElement.BorderColor}`;
            el.style.borderBottom = "";
        } else {
            el.style.borderTop = "";
            el.style.borderBottom = `solid 3px ${DragElement.BorderColor}`;
        }
    }

    public DragLeave(ID: string): void {
        const el = this.document.getElementById(ID);
        if(el === null) return;
        el.style.borderTop = "";
        el.style.borderBottom = "";
    }

    public Drop(ID: string, event: DragEvent, dragged: (recvID: string, nextID: string) => void): void {
        event.preventDefault();
        const recvID = event.dataTransfer?.getData("text/plain");
        if(recvID === undefined) return;
        const draggedEl = this.document.getElementById(recvID);
        if(draggedEl === null) return;

        const el = this.document.getElementById(ID);
        if(el === null) return;
        const rect = el.getBoundingClientRect();
        if((event.clientY - rect.top) < (el.clientHeight * 0.5)) {
            // Drop upside of the target
            console.log(`${el?.className}, ${el?.id}`);
            el.parentNode?.insertBefore(draggedEl, el);
            dragged(recvID, el.id);
        } else {
            // Drop downside of the target
            const nextEl = el.nextElementSibling;
            console.log(`${nextEl?.className}, ${nextEl?.id}`);
            el.parentNode?.insertBefore(draggedEl, nextEl);
            dragged(recvID, nextEl?.id ?? "");
        }
        this.DragLeave(ID);
    }
}
