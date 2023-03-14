import { Component, Input } from '@angular/core';
import { api, GameState } from '../../../../.yalc/@mokoko/elixir';

@Component({
  selector: 'app-elixir-sage',
  templateUrl: './elixir-sage.component.html',
  styleUrls: ['./elixir-sage.component.scss'],
})
export class ElixirSageComponent {
  @Input() gameState!: GameState;
  @Input() curveScores!: number[];
  @Input() adviceScores!: number[];
  @Input() index!: number;

  constructor() {}

  get sage() {
    return this.gameState.sages[this.index];
  }

  get description() {
    return api.getSageDescription(this.gameState, this.index);
  }

  get curveScore() {
    return this.curveScores[this.index];
  }

  get adviceScore() {
    return this.adviceScores[this.index];
  }

  effectName(index: number) {
    return this.gameState.effects[index].name;
  }
}
