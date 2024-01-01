export class Box {
    width: number;
    height: number;
    x: number;
    y: number;
    blue: number;
    purple: number;
    value: number;
    text?: any;
    image?: any;

    constructor(width: number, height: number, x:number, y:number, text?:any) {
      this.width = width;
      this.height = height;
      this.x = x;
      this.y = y;
      this.text = text;
      this.value = 0;
      this.purple = 0;
      this.blue = 0;
    }
}