export default class DragElement {
    public static BorderColor = "#ba2636";
    public static NoNextElement = "No-Next-Element";

    private document: Document;

    constructor(document: Document) {
        this.document = document;
    }

    public DragStart(ID: string, event: DragEvent, dragElement?: Element): void {
        event.dataTransfer?.setData("text/plain", ID);
        if(dragElement !== undefined) {
            event.dataTransfer?.setDragImage(dragElement, 0, 0);
        } else {
            event.dataTransfer?.setDragImage(event.target as Element, 0, 0);
        }
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
            //console.log(`upside: ${el?.className}, ${el?.id}`);
            el.parentNode?.insertBefore(draggedEl, el);
            dragged(recvID, el.id);
        } else {
            // Drop downside of the target
            const nextEl = el.nextElementSibling;
            //console.log(`downside: ${nextEl?.className}, ${nextEl?.id ?? "x"}`);
            el.parentNode?.insertBefore(draggedEl, nextEl);
            const nextId = nextEl?.id ?? "";
            dragged(recvID, nextId.length != 0 ? nextId : DragElement.NoNextElement);
        }
        this.DragLeave(ID);
    }
}
