import { BaseCanvas } from "./baseCanvas";
import { loadImage, Image } from "canvas";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

export class TemplateCanvas2 extends BaseCanvas {
    private color1: string;
    private color2: string;

    constructor(width: number, height: number, color1: string, color2: string) {
        super(width, height);
        this.color1 = color1;
        this.color2 = color2;
    }

    public async draw(crew: any) {
        this.drawDiagonalBackground();

        const image = await this.loadBoatImage("../assets/boats/eight.png");

        const imageSettings = {
            scale: 0.5,
            offsetX: this.width / 2 - (image.width * 0.5) / 2,
            offsetY: 250
        };

        const imgWidth = image.width * imageSettings.scale;
        const imgHeight = image.height * imageSettings.scale;
        const imgX = imageSettings.offsetX;
        const imgY = imageSettings.offsetY;

        // Draw boat image
        this.ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

        // Draw programmatic oars
        this.drawOars(imgX, imgY, imgWidth, imgHeight);

        // Event and crew info
        this.ctx.font = "bold 28px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "left";
        this.ctx.fillText("Hammersmith Head 2025", 40, 50);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("M1 SENIOR MEN | Open club 8+", 40, 80);

        // Cox name
        this.ctx.textAlign = "center";
        this.ctx.fillText(`Cox: ${crew.crewNames[0]}`, this.width / 2, imgY + imgHeight + 30);

        // Race number and coaches
        this.ctx.font = "20px Arial";
        this.ctx.fillText(`Nº: 220`, this.width / 2, this.height - 180);
        this.ctx.fillText(`Coaches: Julian Smith`, this.width / 2, this.height - 150);
        this.ctx.fillText(`Aba Carboo`, this.width / 2, this.height - 125);

        // Club info + circle logo
        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 16px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText("PUTNEY TOWN", 60, this.height - 60);
        this.ctx.fillText("Rowing Club", 60, this.height - 40);

        const logoX = this.width - 60;
        const logoY = this.height - 60;
        this.ctx.beginPath();
        this.ctx.arc(logoX, logoY, 25, 0, Math.PI * 2);
        this.ctx.fillStyle = "white";
        this.ctx.fill();
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();

        // Crew names around boat
        this.drawCrewNames(crew.crewNames, imgX, imgY, imgWidth);
    }

    private drawDiagonalBackground() {
        const w = this.width;
        const h = this.height;

        this.ctx.fillStyle = this.color1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(w, 0);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = this.color2;
        this.ctx.beginPath();
        this.ctx.moveTo(w, 0);
        this.ctx.lineTo(w, h);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fill();
    }

    private drawOars(imgX: number, imgY: number, imgWidth: number, imgHeight: number) {
        const boatCenterX = imgX + imgWidth / 2;
        const baseY = imgY + 20;
        const spacingY = (imgHeight - 40) / 4;
        const oarLength = 80;

        for (let i = 0; i < 4; i++) {
            const y = baseY + i * spacingY;

            // Left
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 6;
            this.ctx.beginPath();
            this.ctx.moveTo(boatCenterX, y);
            this.ctx.lineTo(boatCenterX - oarLength, y - 10);
            this.ctx.stroke();

            // Right
            this.ctx.beginPath();
            this.ctx.moveTo(boatCenterX, y);
            this.ctx.lineTo(boatCenterX + oarLength, y - 10);
            this.ctx.stroke();
        }
    }

    private drawCrewNames(names: string[], imgX: number, imgY: number, imgWidth: number) {
        const spacingY = 30;
        const startY = imgY + 40;
        const centerX = imgX + imgWidth / 2;

        this.ctx.font = "bold 14px Arial";

        // Right side seats (B, 3, 5, 7)
        const rightSeats = [1, 3, 5, 7];
        rightSeats.forEach((i, idx) => {
            const y = startY + idx * spacingY;
            const name = names[i];
            this.drawNameBox(name, centerX + 100, y, "left");
        });

        // Left side seats (2, 4, 6, S)
        const leftSeats = [2, 4, 6, 8];
        leftSeats.forEach((i, idx) => {
            const y = startY + idx * spacingY;
            const name = names[i];
            this.drawNameBox(name, centerX - 100, y, "right");
        });
    }

    private drawNameBox(name: string, x: number, y: number, align: "left" | "right") {
        const padding = 4;
        this.ctx.font = "bold 14px Arial";
        const textWidth = this.ctx.measureText(name).width;
        const boxX = align === "left" ? x - padding : x - textWidth - padding;
        const boxY = y - 12;

        // White background
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(boxX, boxY, textWidth + padding * 2, 18);

        // Text
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = align;
        this.ctx.fillText(name, x, y);
    }

    private async loadBoatImage(relativePath: string): Promise<Image> {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const fullPath = resolve(__dirname, relativePath);
        return await loadImage(fullPath);
    }
}
