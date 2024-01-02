import { Injectable } from '@angular/core';
import { Box } from '../models/box.model';

@Injectable()
export class CommonService {

    constructor() { }

    cutImage(imageUrl: string, box: Box): Promise<void> {

        return new Promise((resolve, reject) => {
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
                const imageData = ctx?.getImageData(box.x, box.y, box.width, box.height);

                // Create a new canvas for the cropped image
                const croppedCanvas = document.createElement('canvas');
                const croppedCtx = croppedCanvas.getContext('2d');

                // Set the dimensions of the new canvas to the size of the crop
                croppedCanvas.width = box.width;
                croppedCanvas.height = box.height;

                // Draw the cropped image on the new canvas
                croppedCtx?.putImageData(imageData!, 0, 0);
                box.image = croppedCanvas.toDataURL();
                resolve();
            }

            img.onerror = (err) => {
                console.error(err)
            }
        });
    }
}
