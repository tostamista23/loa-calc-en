
import { Box } from '../models/box.model';

export function  GetEffectLevelCoord(width: number, index: number): Box[] {
    return [
        new Box(12, 12, 97, GetHeightByEffectIndex(width, index, 45)), 
        new Box(12, 12, 125, GetHeightByEffectIndex(width, index, 45)), 
        new Box(12, 12, 154, GetHeightByEffectIndex(width, index, 45)), 
        new Box(12, 12, 178, GetHeightByEffectIndex(width, index, 45)), 
        new Box(12, 12, 202, GetHeightByEffectIndex(width, index, 45)),
        new Box(12, 12, 232, GetHeightByEffectIndex(width, index, 45)),
        new Box(12, 12, 252, GetHeightByEffectIndex(width, index, 45)),
        new Box(12, 12, 284, GetHeightByEffectIndex(width, index, 50)),//3
        new Box(12, 12, 308, GetHeightByEffectIndex(width, index, 45)),
        new Box(12, 12, 334, GetHeightByEffectIndex(width, index, 45)),
    ]
}

function GetHeightByEffectIndex(width: number, index: number, value: number): number {
    return (index)*width + (index*75.5) + value
}
