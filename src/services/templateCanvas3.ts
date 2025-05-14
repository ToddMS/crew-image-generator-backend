import { BaseCanvas } from "./baseCanvas";
import { Crew } from "../types/crew.types";
import { loadImage, Image } from "canvas";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

export class TemplateCanvas3 extends BaseCanvas {
    private color1: string;
    private color2: string;

    constructor(color1: string, color2: string) {
        super(1080, 1350);
        this.color1 = color1;
        this.color2 = color2;
    }

    public async draw(crew: Crew) {
        this.drawDiagonalBackground();
    
        const image = await this.loadBoatImage("../assets/boats/eight.png");
    
        const imageSettings = {
            scale: 0.65, // ↑ from 0.5
            offsetX: (this.width - image.width * 0.65) / 2,
            offsetY: 260
          };          
    
        const imgWidth = image.width * imageSettings.scale;
        const imgHeight = image.height * imageSettings.scale;
        const imgX = imageSettings.offsetX;
        const imgY = imageSettings.offsetY;
    
        this.ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    
        // === Race, Boat Name, Boat Type ===
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "left";
    
        this.ctx.font = "bold 48px Arial"; // ↑ from 24px
        this.ctx.fillText(`${crew.raceName}`, 40, 80); // ↑ slightly lower to make space

        this.ctx.font = "36px Arial"; // ↑ from 20px
        this.ctx.fillText(`${crew.name} | ${crew.boatType.value}`, 40, 130);


        this.drawCrewNames(crew.crewNames, imgX, imgY, imgWidth);
    }
    

    private drawDiagonalBackground() {
        const w = this.width;
        const h = this.height;
    
        // Diagonal from top-left to bottom-right
        // Triangle 1 (top-left half)
        this.ctx.fillStyle = this.color1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(w, 0);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fill();
    
        // Triangle 2 (bottom-right half)
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
    
        const spacingY = 38;
        const baseY = imgY + 100;
        const centerX = imgX + imgWidth / 2;
    
        this.ctx.font = "bold 22px Arial";
    
        for (let i = 1; i <= 8; i++) {
            const name = crewNames[i];
            const y = baseY + spacingY * (i - 1);
    
            const side = i % 2 === 1 ? 1 : -1;
            const x = centerX + side * 130; // increased name offset
    
            const textWidth = this.ctx.measureText(name).width;
            const padding = 8;
            const bgX = side === -1 ? x - textWidth - padding : x - padding;
            const bgY = y - 18;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = 32;
    
            // Name text
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = side === -1 ? "right" : "left";
            this.ctx.fillText(name, x, y);
        }
    
        // Cox name
        const cox = crewNames[0];
        const coxY = baseY - 45;
        const coxX = centerX;
    
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.fillText(cox, coxX, coxY);
    }
    
    
}