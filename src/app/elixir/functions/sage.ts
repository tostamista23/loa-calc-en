
import { Box } from '../models/box.model';

export function  GetChaosCoord(width: number, index: number): Box[] {
    return [
        new Box(32,32,GetWidthBySageIndex(width, index, 62), 73), 
        new Box(32,32,GetWidthBySageIndex(width, index, 103), 73), 
        new Box(32,32,GetWidthBySageIndex(width, index, 145), 73), 
        new Box(32,32,GetWidthBySageIndex(width, index, 186), 73), 
        new Box(32,32,GetWidthBySageIndex(width, index, 228), 73),
        new Box(32,32,GetWidthBySageIndex(width, index, 270), 73)
    ]
}

export function GetLawfulCoord(width: number, index: number): Box[] {
    return [
        new Box(32,32,GetWidthBySageIndex(width, index, 111),73), 
        new Box(32,32,GetWidthBySageIndex(width, index, 167),73), 
        new Box(32,32,GetWidthBySageIndex(width, index, 222),73)
    ]
}

function GetWidthBySageIndex(width: number, index: number, value: number): number {
    return (index)*width + (index*13) + value
}
