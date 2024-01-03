import { Box } from "./box.model";

export class ScreenBox {
    aspectRatio: string;
    sages: Box[];
    effects: Box[];
    attemptsLeft: Box;

    constructor() {
        this.aspectRatio = "21:9";
        this.sages = [
            new Box(270, 70, 45, 110), 
            new Box(270, 70, 325, 110), 
            new Box(270, 70, 605, 110)
        ]
        
        this.effects = [
            new Box(110, 20, 121, 21), 
            new Box(110, 20, 121, 118), 
            new Box(110, 20, 121, 214), 
            new Box(110, 20, 121, 310), 
            new Box(110, 20, 121, 406)
        ]

        this.attemptsLeft = new Box(30, 23, 508, 346)
    }

}