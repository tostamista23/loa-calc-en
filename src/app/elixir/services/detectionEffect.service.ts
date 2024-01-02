import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import Tesseract from 'tesseract.js';
import { Box } from '../models/box.model';
import { ScreenBox } from '../models/screen.model';
import { MAX_CHAOS, MAX_LAWFUL } from 'src/app/core/elixir/data/const';
import { GetChaosCoord, GetLawfulCoord } from '../functions/sage';

@Injectable()
export class DetectionEffectService {

    constructor() { }

    start(screen: ScreenBox, img: string) {

        return Observable.create((observer: Observer<string>) => {

            const scheduler = Tesseract.createScheduler();

            const workerGen = async () => {
                const worker = await Tesseract.createWorker('eng');
                scheduler.addWorker(worker);
            }

            screen.sages.forEach(x => {
                this.cutImage(img, x).subscribe((data: any) =>  x.image = data);
            });


            const workerN = 4;
            (async () => {
                const resArr = Array(workerN);
                for (let i=0; i<workerN; i++) {
                    resArr[i] = workerGen();
                }
                await Promise.all(resArr);

                //image to text
                Promise.all(
                    screen.sages.map((box: Box) => (
                        scheduler.addJob('recognize', box.image).then((x: any) => {
                            box.text = x.data.text.replace(/[\r\n]/g, ' ').replace("forall","for all").replace("7"," to ");
                        })
                    ))
                ).then(x => {
                    //Color detection for sage
                    this.UpdateSageChaosOrbs(screen,img).subscribe((x: any) => {
                        this.UpdateSageLawfulOrbs(screen, img).subscribe((y: any) => {
                            observer.next("");
                            observer.complete();
                        })
                    }),

                    scheduler.terminate();
                });

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

    UpdateSageChaosOrbs(screen: ScreenBox, img: string) {
        
        return Observable.create((observer: Observer<string>) => {

            screen.sages.forEach(async (box: Box, index:number) => {
                
                GetChaosCoord(box.width, index).forEach((x, indexOrb) => {
                    this.cutImage(img, x).subscribe((data: any) => { 
                        x.image = data;

                        const image = new Image();
                        image.src = x.image;

                        image.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = x.width;
                            canvas.height = x.height;

                            const context = canvas.getContext('2d');
                            if (context){
                                context.drawImage(image, 0, 0, x.width, x.height);
                            }
                            x.image = canvas.toDataURL("image/png");

                            // Get the color of the middle pixel
                            const middlePixelColor = this.getMiddlePixelColor(canvas);
                    
                            if (middlePixelColor) {
                                x.text = this.getType([middlePixelColor[0],middlePixelColor[1],middlePixelColor[2]]);
                                console.log(x.text, index,indexOrb, x.image);
                                box.children?.push(x);
                            }

                            //Last
                            if (box.children?.length === MAX_CHAOS){
                                observer.next("");
                                observer.complete();
                            }
                        };
                    });
                })
            });

        });

    }

    UpdateSageLawfulOrbs(screen: ScreenBox, img: string) {
        return Observable.create((observer: Observer<string>) => {
            const index = screen.sages.findIndex(x => x.children?.every(x => x.text == "not found"));

            if (index == -1){
                alert("sage not found");
                return;
            }

            screen.sages[index].children = [];

            GetLawfulCoord(screen.sages[index].width, index).forEach((x, indexOrb) => {
                this.cutImage(img, x).subscribe((data: any) => { 
                    x.image = data;

                    const image = new Image();
                    image.src = x.image;

                    image.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = x.width;
                        canvas.height = x.height;

                        const context = canvas.getContext('2d');
                        if (context){
                            context.drawImage(image, 0, 0, x.width, x.height);
                        }
                        x.image = canvas.toDataURL("image/png");

                        // Get the color of the middle pixel
                        const middlePixelColor = this.getMiddlePixelColor(canvas);
                
                        if (middlePixelColor) {
                            x.text = this.getType([middlePixelColor[0],middlePixelColor[1],middlePixelColor[2]]);
                            console.log(x.text, index,indexOrb, x.image);
                            screen.sages[index].children?.push(x);
                        }

                        //Last
                        if (screen.sages[index].children?.length == MAX_LAWFUL){
                            observer.next("");
                            observer.complete();
                        }

                    };
                });
            })
        });

    }

    getType(pixel: [number, number, number], threshold: number = 30): string | null {
        const [red, green, blue] = pixel;
    
        // Define thresholds for purple, blue, and black
        const purpleThreshold = 200;
        const blueThreshold = 100;
        const blackThreshold = 40;
        
        // Define the specific blue color
        const specificBlue: [number, number, number] = [197, 247, 254]; // RGB value for #C5F7FE

        // Check if it's more likely to be purple, blue, black, or none of them based on color intensities
        const isPurple = red > purpleThreshold && blue > purpleThreshold && Math.abs(red - blue) < threshold && green < purpleThreshold;
        const isBlue = (blue > blueThreshold && red < blueThreshold && green < blueThreshold) || this.isColorInRange([red, green, blue], specificBlue, threshold);
        const isBlack = red < blackThreshold && green < blackThreshold && blue < blackThreshold;
    
        if (isPurple) {
            return 'chaos';
        } else if (isBlue) {
            return 'lawful';
        } else if (isBlack) {
            return 'empty';
        } else {
            return "not found";
        }
    }

    getMiddlePixelColor(canvas: HTMLCanvasElement): [number, number, number] | null {
        const context = canvas.getContext('2d');

        if (!context) {
            return null;
        }

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const middleX = Math.floor(canvas.width / 2);
        const middleY = Math.floor(canvas.height / 2);
        const index = (middleY * canvas.width + middleX) * 4;

        const red = imageData.data[index];
        const green = imageData.data[index + 1];
        const blue = imageData.data[index + 2];

        return [red, green, blue];
    }

    private isColorInRange(color: [number, number, number], targetColor: [number, number, number], threshold: number): boolean {
        return (
          Math.abs(color[0] - targetColor[0]) <= threshold &&
          Math.abs(color[1] - targetColor[1]) <= threshold &&
          Math.abs(color[2] - targetColor[2]) <= threshold
        );
      }
}
