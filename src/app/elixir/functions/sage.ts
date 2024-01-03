
import { Box } from '../models/box.model';
import { data, GameState } from 'src/app/core/elixir';

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

export function GetAllCouncils(gameState: GameState) {
    let list: {id: string,sage: number, desc: string}[] = []

    data.councils.forEach(obj => { 
        obj.descriptions.map(c => {
            [0,1,2].forEach(x => {
                list.push({id:obj.id,sage: x, desc: GameState.query.getCouncilDescriptionFromId(gameState, obj.id, x, false).replaceAll("<", "").replaceAll(">","")});
            })
        });
    });

    return list;
}
