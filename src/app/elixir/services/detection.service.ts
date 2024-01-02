import { Injectable } from '@angular/core';
import Tesseract from 'tesseract.js';
import { Box } from '../models/box.model';
import { ScreenBox } from '../models/screen.model';
import { CommonService } from './common.service';
import { GetChaosCoord } from '../functions/sage';
import { SageService } from './sage.service';

@Injectable()
export class DetectionService {

    constructor(private commonService: CommonService, private sageService: SageService) { }

    async start(screen: ScreenBox, img: string): Promise<void> {
        await this.sliceImages(screen, img);
        await this.imageToText(screen, img);
        await this.sageService.updateSageStacks(screen, img);
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
            /** Add 10 recognition jobs */
            const results = await Promise.all(screen.sages.map((box: Box) => (
                scheduler.addJob('recognize', box.image).then((x: any) => box.text = x.data.text.replace(/[\r\n]/g, ' ').replace("forall","for all").replace("7"," to ")))
            ))
            await scheduler.terminate(); // It also terminates all workers.
            await Promise.all(results); // <-- This is where we await everything.
        })();
    }

    async sliceImages(screen: ScreenBox, img: string): Promise<void> {
        const promises: Promise<void>[] = [];

        screen.sages.forEach((box: Box, index: number) => {
            //Sages
            promises.push(this.commonService.cutImage(img, box));
        });

        await Promise.all(promises);
    }
}
