import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import Tesseract from 'tesseract.js';
import { Box } from '../models/box.model';
import { ScreenBox } from '../models/screen.model';

@Injectable()
export class DetectionService {

    public game: ScreenBox = new ScreenBox();

    constructor() {}

    start(img: string) {
        return Observable.create((observer: Observer<string>) => {

            const scheduler = Tesseract.createScheduler();

            const workerGen = async () => {
                const worker = await Tesseract.createWorker('eng');
                scheduler.addWorker(worker);
            }

            this.game.sages.forEach(x => {
                this.cutImage(img, x).subscribe((data: any) =>  x.image = data);
            });

            const workerN = 4;
            (async () => {
                const resArr = Array(workerN);
                for (let i=0; i<workerN; i++) {
                    resArr[i] = workerGen();
                }
                await Promise.all(resArr);

                const results = await Promise.all(this.game.sages.map((img: Box) => (
                    scheduler.addJob('recognize', img.image).then((x: any) => {
                        img.text = x.data.text.replace(/[\r\n]/g, ' ').replace("forall","for all").replace("7"," to ");
                        console.log(img.text)
                    })
                )))

                observer.next("");
                observer.complete();
                await scheduler.terminate(); // It also terminates all workers.
            })();
        })
    }

    cutImage(imageUrl: string, sizes: Box) {

        return Observable.create((observer: Observer<string>) => {
            const img = new Image();
            img.src = imageUrl;

            img.onload = () => {
                // Set up a canvas to manipulate the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set the canvas dimensions to the desired dimensions (e.g., 100x100)
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the image on the canvas (this automatically scales to the canvas size)
                ctx?.drawImage(img, 0,0);

                // Crop the desired part of the image
                const imageData = ctx?.getImageData(sizes.x, sizes.y, sizes.width, sizes.height);

                // Create a new canvas for the cropped image
                const croppedCanvas = document.createElement('canvas');
                const croppedCtx = croppedCanvas.getContext('2d');

                // Set the dimensions of the new canvas to the size of the crop
                croppedCanvas.width = sizes.width;
                croppedCanvas.height = sizes.height;

                // Draw the cropped image on the new canvas
                croppedCtx?.putImageData(imageData!, 0, 0);
                observer.next(croppedCanvas.toDataURL());
                observer.complete();
            }
        });
    }
}
