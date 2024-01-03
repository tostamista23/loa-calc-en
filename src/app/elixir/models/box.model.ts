export class Box {
    width: number;
    height: number;
    x: number;
    y: number;
    value: number;
    text?: any;
    image?: any;

    //Chaos/Lawful and level of effects
    children?: Box[];

    //Seal or Exhaust
    child!: Box;

    constructor(width: number, height: number, x:number, y:number, text?:any) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.text = text;
        this.value = 0;
        this.children = [];
    }
}