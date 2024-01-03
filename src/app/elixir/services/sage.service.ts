import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Box } from '../models/box.model';
import { ScreenBox } from '../models/screen.model';
import { MAX_CHAOS, MAX_LAWFUL } from 'src/app/core/elixir/data/const';
import { GetChaosCoord, GetLawfulCoord } from '../functions/sage';
import { CommonService } from './common.service';

@Injectable()
export class SageService {
    constructor(private commonService: CommonService) { }

    async updateSageStacks(screen: ScreenBox, img: string) {
        await this.UpdateSageChaosOrbs(screen, img);
        await this.UpdateSageLawfulOrbs(screen, img);
    }

    async UpdateSageChaosOrbs(screen: ScreenBox, img: string): Promise<void> {
        
        const promises: Promise<void>[] = [];

        screen.sages.forEach((box: Box, index: number) => {
            const chaosCoordPromises = GetChaosCoord(box.width, index).map(async (x, indexOrb) => {
                return new Promise<void>(async (resolve) => {
                    await this.commonService.cutImage(img, x);

                    const image = new Image();
                    image.src = x.image;

                    image.onload = () => {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');

                        canvas.width = x.width;
                        canvas.height = x.height;

                        if (context){
                            context.drawImage(image, 0, 0, x.width, x.height);
                        }

                        // Get the color of the middle pixel
                        const middlePixelColor = this.commonService.getMiddlePixelColor(canvas);
                
                        if (middlePixelColor) {
                            x.text = this.getTypeSage([middlePixelColor[0],middlePixelColor[1],middlePixelColor[2]]);
                            //console.log(x.text, index,indexOrb, x.image);
                            if (x.text !== "not found"){
                                box.children?.push(x);
                            }
                        }
                        resolve();

                    };
                });
            });

            promises.push(...chaosCoordPromises);

        });

        await Promise.all(promises);

    }

    UpdateSageLawfulOrbs(screen: ScreenBox, img: string) {
        return new Promise<void>(async (resolve, reject) => {
            const index = screen.sages.findIndex(x => !x.children || x.children.length == 0);

            if (index == -1){
                alert("sage not found");
                resolve();
            }

            screen.sages[index].children = [];

            await GetLawfulCoord(screen.sages[index].width, index).forEach(async (x, indexOrb) => {
                await this.commonService.cutImage(img, x)

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
                    const middlePixelColor = this.commonService.getMiddlePixelColor(canvas);
            
                    if (middlePixelColor) {
                        x.text = this.getTypeSage([middlePixelColor[0],middlePixelColor[1],middlePixelColor[2]]);
                        console.log(x.text, index,indexOrb, x.image);
                        screen.sages[index].children?.push(x);
                    }

                    //Last
                    if (screen.sages[index].children?.length == MAX_LAWFUL){
                        resolve();
                    }

                };
            })
        });

    }

    getTypeSage(pixel: [number, number, number], threshold: number = 30): string | null {
        const [red, green, blue] = pixel;
    
        // Define thresholds for purple, blue, and black
        const purpleThreshold = 200;
        const blueThreshold = 100;
        const blackThreshold = 40;
        
        // Define the specific blue color
        const specificBlue: [number, number, number] = [197, 247, 254]; // RGB value for #C5F7FE

        // Check if it's more likely to be purple, blue, black, or none of them based on color intensities
        const isPurple = red > purpleThreshold && blue > purpleThreshold && Math.abs(red - blue) < threshold && green < purpleThreshold;
        const isBlue = (blue > blueThreshold && red < blueThreshold && green < blueThreshold) || this.commonService.isColorInRange([red, green, blue], specificBlue, threshold);
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
}
