import { BaseCanvas } from "./baseCanvas";
import { loadImage, Image } from "canvas";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { Crew } from "../types/crew.types";

export class TemplateCanvas1 extends BaseCanvas {
  private color1: string;
  private color2: string;

  constructor(color1: string, color2: string) {
    super(1080, 1350); // Instagram portrait
    this.color1 = color1;
    this.color2 = color2;
  }

  public async draw(crew: Crew) {
    this.drawDiagonalBackground();
  
    const image = await this.loadBoatImage("../assets/boats/eight.png");
    const logo = await this.loadBoatImage("../assets/logo/aklogo.jpg");
  
    const scale = 0.8;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (this.width - imgWidth) / 2;
    const imgY = 230; // move the boat slightly up
  
    this.ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
  
    this.drawHeader(crew);
    this.drawCrewNames(crew.crewNames, imgX, imgY, imgWidth);
  
    // === Draw club logo at bottom center ===
    const logoSize = 160;
    const logoX = this.width - logoSize - 60; // 60px from right edge
    const logoY = this.height - logoSize - 60; // 60px from bottom edge     
  
    this.ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  }
  

  private drawHeader(crew: Crew) {
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "left";

    this.ctx.font = "bold 56px Arial";
    this.ctx.fillText(crew.raceName, 60, 120);

    this.ctx.font = "36px Arial";
    this.ctx.fillText(`${crew.name} | ${crew.boatType.value}`, 60, 180);
  }

  private drawDiagonalBackground() {
    const w = this.width;
    const h = this.height;

    // Diagonal split: top-left (color1), bottom-right (color2)
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

  private async loadBoatImage(relativePath: string): Promise<Image> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const fullPath = resolve(__dirname, relativePath);
    return await loadImage(fullPath);
  }

  private drawCrewNames(crewNames: string[], imgX: number, imgY: number, imgWidth: number) {
    if (crewNames.length !== 9) {
      console.warn("Expected 9 crew members (8 rowers + cox). Got:", crewNames.length);
      return;
    }
  
    const centerX = imgX + imgWidth / 2;
    const baseY = imgY + 250;
    const spacingY = 48;
    const nameOffset = 230;
  
    this.ctx.font = "bold 28px Arial";
    this.ctx.fillStyle = "black";
  
    for (let i = 1; i <= 8; i++) {
      const name = crewNames[i];
      const seat = 9 - i;
      const baseNameY = baseY + (i - 1) * spacingY;
      const side = i % 2 === 0 ? "right" : "left";
  
      const nameY = side === "right" ? baseNameY - 20 : baseNameY + 20;
      const nameX = side === "right" ? centerX + nameOffset : centerX - nameOffset;
  
      // Name
      this.ctx.textAlign = side === "right" ? "left" : "right";
      this.ctx.fillText(name, nameX, nameY);
  
      // Seat number
      this.ctx.textAlign = "center";
      this.ctx.fillText(`${seat}`, centerX, baseNameY);
    }
  
    // Cox
    const cox = crewNames[0];
    const coxX = centerX + 85;
    const coxY = baseY - 75;
  
    this.ctx.textAlign = "center";
    this.ctx.fillText(cox, coxX, coxY);
  }
  
  
}
