import { Box } from "./box.model";

export class ScreenBox {
    aspectRatio: string;
    sages: Box[];
    effects: Box[];
    attemptsLeft: number;

    constructor() {
        this.aspectRatio = "21:9";
        this.sages = [
            new Box(270,70,45,110), 
            new Box(270,70,325,110), 
            new Box(270,70,605,110)
        ]
        
        this.effects = [new Box(1,1,1,1), new Box(1,1,1,1), new Box(1,1,1,1), new Box(1,1,1,1), new Box(1,1,1,1)]
        this.attemptsLeft = 0
    }

}