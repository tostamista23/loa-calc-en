import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  api,
  Council,
  data,
  GameState,
  Sage,
  SageType,
} from 'src/app/core/elixir';
import { DisclaimerDialogComponent } from '../../core/components/disclaimer-dialog.component';
import { EvaluatorService } from '../services/evaluator.service';
import { SageService } from '../services/sage.service';
import { Box } from '../models/box.model';
import { MAX_CHAOS, MAX_LAWFUL } from 'src/app/core/elixir/data/const';
import { ScreenBox } from '../models/screen.model';
import { DetectionService } from '../services/detection.service';
import { GetAllCouncils } from '../functions/sage';

@Component({
  selector: 'app-elixir',
  templateUrl: './elixir.component.html',
  styleUrls: ['./elixir-common.scss', './elixir.component.scss'],
})
export class ElixirComponent implements OnInit {
  isLoading = false;

  gameState = api.game.getInitialGameState({ maxEnchant: 10, totalTurn: 14 });

  //For detection
  gameScreen: ScreenBox = new ScreenBox();

  focusedIndices: [number, number] = [0, 1];

  curveScores: number[] = [];
  adviceScores: number[] = [];
  totalScores: number[] = [];
  baselineScore: number = 0;

  councils = data.councils;

  isDangerous = false;

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private titleService: Title,
    private dialog: MatDialog,
    private evaluator: EvaluatorService,
    public detection: DetectionService,
    public sageService: SageService
  ) {
    this.titleService.setTitle(locale == "en-US" ? "Elixir Simulation - Lost Ark Optimization Calculator": 'LoaCalc : 엘릭서 시뮬레이션 - 로스트아크 최적화 계산기');
  }

  ngOnInit(): void {
    this.dialog.open(DisclaimerDialogComponent, {
      disableClose: true,
    });
    this.evaluator.fetchInitialData().then(() => {
      this.updateScores();
      this.isLoading = false;
    });
  }

  get pickRatios() {
    return GameState.query.getPickRatios(this.gameState);
  }

  get luckyRatios() {
    return GameState.query.getLuckyRatios(this.gameState);
  }

  get recommendRerollBaseline() {
    return this.adviceScores.every((score) => score < this.baselineScore);
  }

  get recommendRerollLawfulFullSeal() {
    if (!GameState.query.checkSealNeeded(this.gameState)) {
      return false;
    }

    const lawfulFullSage = this.gameState.sages.find((x) =>
      Sage.query.isLawfulFull(x)
    )!;

    if (lawfulFullSage && lawfulFullSage.councilId !== 'mYuyjIL/') {
      return true;
    }

    return false;
  }

  get recommendRerollLawfulSeal() {
    if (!GameState.query.checkSealNeeded(this.gameState)) {
      return false;
    }

    const lawfulSage = this.gameState.sages.find((x) => x.type === 'lawful')!;
    if (!lawfulSage) {
      return false;
    }

    const power = lawfulSage.power;

    if (this.gameState.turnLeft > data.constant.MAX_LAWFUL - power) {
      const council = Council.query.getOne(lawfulSage.councilId);
      if (
        council.type === 'seal' &&
        council.logics[0].type === 'sealTarget' &&
        this.focusedIndices.includes(council.logics[0].targetCondition - 1)
      ) {
        return true;
      }
    }

    return false;
  }

  getCouncilDescription(id: string, index: number) {
    return GameState.query.getCouncilDescriptionFromId(
      this.gameState,
      id,
      index
    );
  }

  updateScores() {
    const scores = this.evaluator.evaluateScores(
      this.gameState,
      this.focusedIndices
    );
    this.baselineScore = this.evaluator.evaluateBaselineAdviceScore(
      this.gameState,
      this.focusedIndices
    );

    this.curveScores = scores.curveScores;
    this.adviceScores = scores.adviceScores;
    this.totalScores = scores.totalScores;
  }

  async onFileSelected(event: any): Promise<void> {
      this.loadDetection(event.target.files[0]);
  }

  loadDetection(file: any){
      const list: {id: string,sage: number, desc: string}[] = GetAllCouncils(this.gameState);
        
      this.detection.start(this.gameScreen, URL.createObjectURL(file)).then(() => {
          this.updateSages();
          this.updateEffects();
          this.updateRemainingSteps();
      })
  }

  updateSages(){
    const list: {id: string,sage: number, desc: string}[] = GetAllCouncils(this.gameState);

    this.gameScreen.sages.forEach((box:Box, index: number) => {

      const list: {id: string,sage: number, desc: string}[] = GetAllCouncils(this.gameState);
      let result = list.find((x) => x.desc == box.text.replace(/\s+$/, ''));
    
      !result ? console.warn(box.text.replace(/\s+$/, '')) : this.setCouncil(index, result.id)

      this.setTypePower(index, { 
          type: box.children?.length === MAX_LAWFUL ? 'lawful' : box.children?.length === MAX_CHAOS ? 'chaos' : 'none', 
          power: box.children?.filter(x => x.text === 'lawful' || x.text === 'chaos').length || 0 
      });
    });
  }

  updateEffects(){

    this.gameScreen.effects.forEach((box:Box, index: number) => {

      let result = data.effectOptions.find((x) => x.name == box.text.replace(/\s+$/, ''));
    
      !result ? console.warn(box.text.replace(/\s+$/, '')) : this.gameState.effects[index].optionName = result.name

      this.setEffectValue(index ,box.value)
    });
  }

  updateRemainingSteps() {
    let d = Number(this.gameScreen.attemptsLeft.text)

    if (isNaN(d)){
      alert("Remaining attemps invalid");
      return;
    }

    const diff = this.gameState.turnLeft - d;
    const incrementOrDecrement = diff < 0 ? this.increaseTurnLeft.bind(this) : this.decreaseTurnLeft.bind(this);

    Array(Math.abs(diff)).fill(1).forEach((_, index) => {
        setTimeout(() => {
            incrementOrDecrement();
        }, 200 * (index + 1));
    });
  }

  onFocusTarget(index: number) {
    if (this.focusedIndices.includes(index)) {
      return;
    }
    this.focusedIndices = [this.focusedIndices[1], index];
    this.updateScores();
  }

  resetStates() {
    this.gameState = api.game.getInitialGameState({
      maxEnchant: 10,
      totalTurn: 14,
    });
    this.updateScores();
  }

  increaseTurnLeft() {
    this.gameState = {
      ...this.gameState,
      turnLeft: Math.min(
        this.gameState.config.totalTurn,
        this.gameState.turnLeft + 1
      ),
    };
    this.isDangerous = false;
    this.updateScores();
  }

  decreaseTurnLeft() {
    this.gameState = {
      ...this.gameState,
      turnLeft: Math.max(0, this.gameState.turnLeft - 1),
    };
    this.isDangerous = false;
    this.updateScores();
  }

  increaseEffectValue(index: number) {
    this.gameState = GameState.increaseEffectValue(this.gameState, index, 1);
    this.updateScores();
  }

  decreaseEffectValue(index: number) {
    this.gameState = GameState.increaseEffectValue(this.gameState, index, -1);
    this.updateScores();
  }

  setEffectValue(index: number, value: number) {
    this.gameState = GameState.setEffectValue(this.gameState, index, value);
    this.updateScores();
  }

  setEffectSealed(index: number, isSealed: boolean) {
    if (isSealed) {
      this.gameState = GameState.sealEffect(this.gameState, index);
    } else {
      this.gameState = GameState.unsealEffect(this.gameState, index);
    }
    this.updateScores();
  }

  setSageExhausted(index: number, isExhausted: boolean) {
    if (isExhausted) {
      this.gameState = GameState.exhaustSage(this.gameState, index);
    } else {
      this.gameState = {
        ...this.gameState,
        sages: this.gameState.sages.map((sage, i) =>
          i === index
            ? {
                ...sage,
                isExhausted: false,
              }
            : sage
        ),
      };
    }
  }

  setCouncil(index: number, councilId: string) {
    this.gameState = {
      ...this.gameState,
      sages: this.gameState.sages.map((sage, i) =>
        i === index
          ? {
              ...sage,
              councilId,
            }
          : sage
      ),
    };
    this.isDangerous = true;
    this.updateScores();
  }

  setTypePower(
    index: number,
    { type, power }: { type: SageType; power: number }
  ) {
    this.gameState = {
      ...this.gameState,
      sages: this.gameState.sages.map((sage, i) =>
        i === index
          ? {
              ...sage,
              type,
              power,
            }
          : sage
      ),
    };
    this.updateScores();
  }

  onResetClick() {
    const isConfirmed = window.confirm('정말 초기화하시겠습니까?');
    if (!isConfirmed) return;

    this.resetStates();
  }
}
