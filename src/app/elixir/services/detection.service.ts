import { Injectable } from '@angular/core';
import Tesseract from 'tesseract.js';
import { Box } from '../models/box.model';
import { ScreenBox } from '../models/screen.model';
import { CommonService } from './common.service';
import { SageService } from './sage.service';
import { EffectService } from './effect.service';

@Injectable()
export class DetectionService {

    constructor(private commonService: CommonService, private sageService: SageService, private effectService: EffectService) { }

    async start(screen: ScreenBox, img: string): Promise<void> {
        await this.sliceImages(screen, img);
        await this.imageToText(screen, img);
        await this.sageService.updateSageStacks(screen, img);
        await this.effectService.updateLevelEffects(screen, img);
    }

    async imageToText(screen: ScreenBox, img: string): Promise<void> {

        const scheduler = Tesseract.createScheduler();

        // Creates worker and adds to scheduler
        const workerGen = async () => {
            const worker = await Tesseract.createWorker('eng');
            scheduler.addWorker(worker);
        }

        const workerN = 4;
        await (async () => {
            const resArr = Array(workerN);
            for (let i=0; i<workerN; i++) {
                resArr[i] = workerGen();
            }

            await Promise.all(resArr);

            //Sages
            await Promise.all(
                screen.sages.map((box: Box) => (
                    scheduler.addJob('recognize', box.image).then((x: any) => box.text = x.data.text.replace(/[\r\n]/g, ' ').replace("forall","for all").replace("7"," to ")))
                )
            )
            
            //Effects
            await Promise.all(
                screen.effects.map((box: Box) => (
                    scheduler.addJob('recognize', box.image).then((x: any) => box.text = x.data.text.replace(/[\r\n]/g, ' ')))
                )
            )
            
            //Remaining Steps
            await Promise.all(
                await scheduler.addJob('recognize', screen.attemptsLeft.image).then((x: any) => screen.attemptsLeft.text = x.data.text.replace(/[\r\n]/g, ' '))
            )

            await scheduler.terminate();
            //await Promise.all(results);
        })();
    }

    async sliceImages(screen: ScreenBox, img: string): Promise<void> {
        const promises: Promise<void>[] = [];

        //Sages
        screen.sages.forEach((box: Box, index: number) => {
            promises.push(this.commonService.cutImage(img, box));
        });

        //Effects
        screen.effects.forEach((box: Box, index: number) => {
            promises.push(this.commonService.cutImage(img, box));
        });

        //Remaining Steps
        promises.push(this.commonService.cutImage(img, screen.attemptsLeft));

        await Promise.all(promises);
    }
}
