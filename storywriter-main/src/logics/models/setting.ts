export class Setting {
    public Visible = false;
    public URI = "";

    public Darkmode = true;
    public ImageMaxExpandRate = new MinMaxPair(1, 9, 5);
    public ImageExpandRate = new MinMaxPair(1, 20, 3);

    public GetTitle(): string {
        const file = this.URI.split('/').pop() ?? "";
        return `${file.length > 0 ? (file + " /") : ""} Storywriter`;
    }
}

export class MinMaxPair {
    public min = 0;
    public max = 1;
    public current = 0;

    constructor(value1 = 0, value2 = 1, current?: number) {
        if(value1 < value2) {
            this.Min(value1);
            this.Max(value2);
        } else {
            this.Min(value2);
            this.Max(value1);
        }
        this.current = current ?? this.min;
    }

    public Min(value?: number): number {
        if(value !== undefined) {
            this.min = value > this.max ? this.max : value;
        }
        if(this.current < this.min) this.current = this.min;
        return this.min;
    }

    public Max(value?: number): number {
        if(value !== undefined) {
            this.max = value < this.min ? this.min : value;
        }
        if(this.current > this.max) this.current = this.max;
        return this.max;
    }
}