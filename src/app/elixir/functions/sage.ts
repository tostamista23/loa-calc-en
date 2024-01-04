
import { Box } from '../models/box.model';
import { data, GameState } from 'src/app/core/elixir';

export function  GetChaosCoord(width: number, index: number): Box[] {
    return [
        //TODO height games with no black bars -134
        new Box(32,32,GetWidthBySageIndex(width, index, 590), 598), 
        new Box(32,32,GetWidthBySageIndex(width, index, 626), 598), 
        new Box(32,32,GetWidthBySageIndex(width, index, 664), 598), 
        new Box(32,32,GetWidthBySageIndex(width, index, 700), 598), 
        new Box(32,32,GetWidthBySageIndex(width, index, 736), 598),
        new Box(32,32,GetWidthBySageIndex(width, index, 773), 598)
    ]
}

export function GetLawfulCoord(width: number, index: number): Box[] {
    return [
        new Box(32,32,GetWidthBySageIndex(width, index, 634),598), 
        new Box(32,32,GetWidthBySageIndex(width, index, 682),598), 
        new Box(32,32,GetWidthBySageIndex(width, index, 732),598)
    ]
}

function GetWidthBySageIndex(width: number, index: number, value: number): number {
    return (index)*width + (index*19.5) + value
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
