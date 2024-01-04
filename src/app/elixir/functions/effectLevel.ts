
import { Box } from '../models/box.model';

export function  GetEffectLevelCoord(height: number, index: number): Box[] {
    return [
        //TODO height games with no black bars
        new Box(12, 12, 1653, GetHeightByEffectIndex(height, index, 206)), 
        new Box(12, 12, 1676, GetHeightByEffectIndex(height, index, 206)), 
        new Box(12, 12, 1699, GetHeightByEffectIndex(height, index, 206)), //1
        new Box(12, 12, 1724, GetHeightByEffectIndex(height, index, 206)), //empty
        new Box(12, 12, 1748, GetHeightByEffectIndex(height, index, 206)), //
        new Box(12, 12, 1769, GetHeightByEffectIndex(height, index, 210)), //2
        new Box(12, 12, 1797, GetHeightByEffectIndex(height, index, 208)), //empty
        new Box(12, 12, 1818, GetHeightByEffectIndex(height, index, 210)), //3
        new Box(12, 12, 1846, GetHeightByEffectIndex(height, index, 206)), //4
        new Box(12, 12, 1974, GetHeightByEffectIndex(height, index, 206)), //5
    ]
}

function GetHeightByEffectIndex(height: number, index: number, value: number): number {
    return (index)*height + (index*71.5) + value
}
