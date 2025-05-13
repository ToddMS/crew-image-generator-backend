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
        this.drawDiagonalBackground();
    
        const image = await this.loadBoatImage("../assets/boats/eight.png");
    
        const imageSettings = {
            scale: 0.35,
            offsetX: 200,
            offsetY: 30
        };
    
        const imgWidth = image.width * imageSettings.scale;
        const imgHeight = image.height * imageSettings.scale;
        const imgX = imageSettings.offsetX;
        const imgY = imageSettings.offsetY;
    
        this.ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    
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

    private drawDiagonalBackground() {
        const w = this.width;
        const h = this.height;
    
        // Top-left triangle (color1)
        this.ctx.fillStyle = this.color1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(w, 0);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fill();
    
        // Bottom-right triangle (color2)
        this.ctx.fillStyle = this.color2;
        this.ctx.beginPath();
        this.ctx.moveTo(w, 0);
        this.ctx.lineTo(w, h);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fill();
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
    
        const spacingY = 26;
        const baseY = imgY + 100;
        const centerX = imgX + imgWidth / 2;
    
        this.ctx.font = "bold 14px Arial";
    
        for (let i = 1; i <= 8; i++) {
            const name = crewNames[i];
            const y = baseY + spacingY * (i - 1);
    
            const side = i % 2 === 1 ? 1 : -1;
            const x = centerX + side * 100;
    
            const textWidth = this.ctx.measureText(name).width;
            const padding = 4;
    
            const bgX = side === -1 ? x - textWidth - padding : x - padding;
            const bgY = y - 12;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = 18;
    
            // White background rectangle
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
    
            // Bold text
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = side === -1 ? "right" : "left";
            this.ctx.fillText(name, x, y);
        }
    
        // Cox name at the top center
        const cox = crewNames[0];
        const coxY = baseY - 30;
        const coxX = centerX;
        const coxWidth = this.ctx.measureText(cox).width;
        const coxPadding = 4;
    
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(coxX - coxWidth / 2 - coxPadding, coxY - 12, coxWidth + coxPadding * 2, 18);
    
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.fillText(cox, coxX, coxY);
    }
    
}
