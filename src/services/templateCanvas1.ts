import { BaseCanvas } from "./baseCanvas";
import { Crew } from "../types/crew.types";
import { loadImage, Image } from "canvas";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

export class TemplateCanvas1 extends BaseCanvas {
    private color1: string;
    private color2: string;

    constructor(width: number, height: number, color1: string, color2: string) {
        super(width, height);
        this.color1 = color1;
        this.color2 = color2;
    }

    public async draw(crew: Crew) {
        const image = await this.loadBoatImage("../assets/boats/eight.png");

        const imageSettings = {
            scale: 0.35,
            offsetX: 200, // move image right
            offsetY: 30   // move image down
        };

        const imgWidth = image.width * imageSettings.scale;
        const imgHeight = image.height * imageSettings.scale;
        const imgX = imageSettings.offsetX;
        const imgY = imageSettings.offsetY;

        this.ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

        // Optional overlay
        this.ctx.fillStyle = this.color1;
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalAlpha = 1;

        // Crew info text
        this.ctx.fillStyle = "black";
        this.ctx.font = "bold 24px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Club: ${crew.clubName}`, 20, 40);
        this.ctx.fillText(`Crew: ${crew.name}`, 20, 70);
        this.ctx.fillText(`Race: ${crew.raceName}`, 20, 100);
        this.ctx.fillText(`Boat Type: ${crew.boatType.name}`, 20, 130);

        this.drawCrewNames(crew.crewNames, imgX, imgY, imgWidth);
    }

    private async loadBoatImage(relativePath: string): Promise<Image> {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fullPath = resolve(__dirname, relativePath);
        return await loadImage(fullPath);
    }

    private drawCrewNames(crewNames: string[], imgX: number, imgY: number, imgWidth: number) {
        const totalCrew = crewNames.length;
        if (totalCrew !== 9) {
            console.warn("Expected 9 crew members for an 8+ boat (including cox). Got:", totalCrew);
            return;
        }
    
        const spacingY = 25;
        const baseY = imgY + 95;
        const centerX = imgX + imgWidth / 2;
    
        for (let i = 1; i <= 8; i++) {
            const name = crewNames[i];
            const y = baseY + spacingY * (i - 1);
    
            // Invert alternating: stroke starts on the right
            const side = i % 2 === 1 ? 1 : -1;
            const x = centerX + side * 100;
    
            this.ctx.fillStyle = "black";
            this.ctx.font = "14px Arial";
            this.ctx.textAlign = side === -1 ? "right" : "left";
            this.ctx.fillText(name, x, y);
        }
    
        // Cox name at the top center
        this.ctx.textAlign = "center";
        this.ctx.fillText(crewNames[0], centerX, baseY - 30);
    }
    
}
