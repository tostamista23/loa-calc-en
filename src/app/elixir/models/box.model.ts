export class Box {
    width: number;
    height: number;
    x: number;
    y: number;
    value: number;
    text?: any;
    image?: any;

    //Chaos/Lawful and level of effects
    children?: Box[];

    //Seal or Exhaust
    child!: Box;

    constructor(width: number, height: number, x:number, y:number, text?:any) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.text = text;
        this.value = 0;
        this.children = [];
    }

    //Corrections
    replacesSages(){
        const toReplace: [string | RegExp, string][] = [
            [/[\r\n]/g, ' '],
            ["forall", "for all"],
            ["7", " to "],
            [/\s+$/, ''],
            ["Iwill", "I will"],
            ["Twill", "I will"],
            ["[2 - 12", "[-2 to +2]"],
            [" eve", " level"],
            ["I change", "I'll change"],
            ["Exposives", "Explosives"],
            ["inrease", "increase"],
            [" ate", " rate"],
            [" he ", " the "],
            [" ffect ", " effect "],
            [" Selec ", " selected "],
            [" al ", " all "],
            [" remaining.", " remaining"],
            ["tranemutation", "transmutation"],
            ["‘", ""],
            [" to % ", " 7%"],
            ["1€", "It's"],
            ["stp", "step"],
            [":", "."],
            [" Il ", " I'll "],
            [" te ", " the "],
            [" Stages ", " Stagger "],
            [" Stagsee ", " Stagger "],
            ["1¢'s", "It's"],
            [" over ", " over. "],
            [" finish it ", " finish it. "],
            [" step now ", " step now. "],
            ["%f", "% f"],
            ["  ", " "],
            ["it. now", "it now"],
            [" to 0%", " 70%"],
            ["Ili", "I'll i"],
            ["levell", "level"],
            ["Your", "your"],
            ["1 will", "I will"],
            ["1level","1 level"],
            ["attemps", "attempts"],
            ["I'l ","I'll "],
            ["Bis of Life", "Blessing of Life"],
            [" sal "," seal "],
            [" 4", ""],
            ["Let’ ", "Let's "],
            ["it now,", "it now."],
            ["1¢s", "It's"],
            ["by 3 levels", "by 2 levels"], //doesnt exist 3
            ["I'llincrease","I'll increase"], //I'llincrease the level of the Critical (Chaos) effect by [2 +2]
            ["[2 +2]","[-2 to +2]"], //I'llincrease the level of the Critical (Chaos) effect by [2 +2]
            ["[will","I will"], //This time, [will transmute 2 effects
            ["transmate","transmute"], //This time, I will transmate 2 effects at the same time.
            ["transmaute","transmute"], //This time, I will transmaute 2 effects at the same time.
          ];
          
        for (const [pattern, replacement] of toReplace) {
            this.text = this.text.replace(pattern, replacement);
        }


        if (this.text.startsWith("will")){
            this.text = "I " + this.text
        }
    }

    replacesEffect(){
        if (this.text.endsWith('.')) {
            this.text = this.text.slice(0, -1);
        }
    }

}