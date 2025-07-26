import { BaseCanvas } from "./baseCanvas";
import { loadImage, Image } from "canvas";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { Crew } from "../types/crew.types";

interface ClubIconData {
  type: 'preset' | 'upload';
  filename?: string;
  filePath?: string;
}

export class TemplateCanvas1 extends BaseCanvas {
  private color1: string;
  private color2: string;
  private clubIcon?: ClubIconData;

  constructor(color1: string, color2: string, clubIcon?: ClubIconData) {
    super(1080, 1350); // Instagram portrait
    this.color1 = color1;
    this.color2 = color2;
    this.clubIcon = clubIcon;
  }

  public async draw(crew: Crew) {
    this.drawGeometricBackground();
  
    const boatImagePath = this.getBoatImagePath(crew.boatType.value);
    const image = await this.loadBoatImage(boatImagePath);
  
    const scale = 0.8;
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (this.width - imgWidth) / 2;
    const imgY = 280;
  
    this.ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
  
    this.drawHeader(crew);
    this.drawCrewNamesAlongOars(crew, imgX, imgY, imgWidth, imgHeight);
  
    // === Draw club logo at bottom right ===
    await this.drawClubLogo();
  }

  private async drawClubLogo() {
    if (!this.clubIcon) {
      console.log('Template1: No club icon provided, skipping logo');
      return;
    }

    try {
      let logo: Image;
      
      if (this.clubIcon.type === 'preset' && this.clubIcon.filename) {
        // Load preset logo from club-logos directory
        const logoPath = `../assets/club-logos/${this.clubIcon.filename}`;
        console.log('Template1: Loading preset logo from:', logoPath);
        logo = await this.loadBoatImage(logoPath);
      } else if (this.clubIcon.type === 'upload' && this.clubIcon.filePath) {
        // Load uploaded logo file
        console.log('Template1: Loading uploaded logo from:', this.clubIcon.filePath);
        logo = await loadImage(this.clubIcon.filePath);
      } else {
        console.log('Template1: Invalid club icon data, skipping logo');
        return;
      }

      // Draw logo at bottom right
      const logoSize = 160;
      const logoX = this.width - logoSize - 60;
      const logoY = this.height - logoSize - 60;
      
      console.log('Template1: Drawing club logo at position:', { logoX, logoY, logoSize });
      this.ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    } catch (error) {
      console.error('Template1: Error loading club logo:', error);
      // Optionally draw fallback logo or continue without logo
    }
  }
  

  private drawHeader(crew: Crew) {
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "left";

    this.ctx.font = "bold 56px Arial";
    this.ctx.fillText(crew.raceName, 60, 120);

    this.ctx.font = "36px Arial";
    this.ctx.fillText(`${crew.name} | ${crew.boatType.value}`, 60, 180);
  }

  private drawGeometricBackground() {
    const w = this.width;
    const h = this.height;

    // Base background
    this.ctx.fillStyle = this.color2;
    this.ctx.fillRect(0, 0, w, h);

    // Geometric hexagon pattern
    this.ctx.fillStyle = this.color1;
    const hexSize = 80;
    const hexSpacing = hexSize * 1.5;
    
    for (let x = -hexSize; x < w + hexSize; x += hexSpacing) {
      for (let y = -hexSize; y < h + hexSize; y += hexSpacing * 0.866) {
        const offsetX = (y / (hexSpacing * 0.866)) % 2 === 0 ? 0 : hexSpacing / 2;
        this.drawHexagon(x + offsetX, y, hexSize * 0.3);
      }
    }

    // Gradient overlay
    const gradient = this.ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, `${this.color1}20`);
    gradient.addColorStop(1, `${this.color2}40`);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, w, h);
  }

  private drawHexagon(x: number, y: number, size: number) {
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private getBoatImagePath(boatType: string): string {
    const boatImageMap: { [key: string]: string } = {
      '8+': '../assets/boats/eight.png',
      '4+': '../assets/boats/four.png',
      '4-': '../assets/boats/four.png',
      '4x': '../assets/boats/quad.png',
      '2x': '../assets/boats/double.png',
      '2-': '../assets/boats/pair.png',
      '1x': '../assets/boats/single.png'
    };
    
    return boatImageMap[boatType] || '../assets/boats/eight.png'; // fallback to eight
  }

  private async loadBoatImage(relativePath: string): Promise<Image> {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const fullPath = resolve(__dirname, relativePath);
    return await loadImage(fullPath);
  }

  private drawCrewNamesAlongOars(crew: Crew, imgX: number, imgY: number, imgWidth: number, imgHeight: number) {
    const boatType = crew.boatType.value;
    const crewNames = crew.crewNames;
    const centerX = imgX + imgWidth / 2;
    
    this.ctx.font = "bold 24px Arial";
    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 3;

    if (boatType === '8+') {
      this.drawEightCrewNames(crewNames, centerX, imgY, imgHeight);
    } else if (boatType === '4+' || boatType === '4-' || boatType === '4x') {
      this.drawFourCrewNames(crewNames, centerX, imgY, imgHeight, boatType);
    } else if (boatType === '2x' || boatType === '2-') {
      this.drawDoubleCrewNames(crewNames, centerX, imgY, imgHeight);
    } else if (boatType === '1x') {
      this.drawSingleCrewName(crewNames, centerX, imgY, imgHeight);
    }
  }

  private drawEightCrewNames(crewNames: string[], centerX: number, imgY: number, imgHeight: number) {
    const baseY = imgY + 100;
    const spacingY = (imgHeight - 200) / 7;
    const oarLength = 200;

    // Cox first
    if (crewNames[0]) {
      this.drawNameWithBackground(crewNames[0], centerX, baseY - 50);
    }

    // Rowers 1-8 (crewNames[1] to crewNames[8])
    for (let i = 1; i <= 8; i++) {
      const name = crewNames[i];
      if (!name) continue;
      
      const y = baseY + (i - 1) * spacingY;
      const isStarboard = i % 2 === 1; // 1,3,5,7 starboard (right), 2,4,6,8 port (left)
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      this.drawNameWithBackground(name, x, y);
    }
  }

  private drawFourCrewNames(crewNames: string[], centerX: number, imgY: number, imgHeight: number, boatType: string) {
    const baseY = imgY + 80;
    const spacingY = (imgHeight - 160) / 3;
    const oarLength = 180;
    const hasCox = boatType === '4+';

    if (hasCox && crewNames[0]) {
      this.drawNameWithBackground(crewNames[0], centerX, baseY - 40);
    }

    const startIdx = hasCox ? 1 : 0;
    for (let i = 0; i < 4; i++) {
      const name = crewNames[startIdx + i];
      if (!name) continue;
      
      const y = baseY + i * spacingY;
      const isStarboard = i % 2 === 0;
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      this.drawNameWithBackground(name, x, y);
    }
  }

  private drawDoubleCrewNames(crewNames: string[], centerX: number, imgY: number, imgHeight: number) {
    const baseY = imgY + imgHeight / 2;
    const oarLength = 160;

    for (let i = 0; i < 2; i++) {
      const name = crewNames[i];
      if (!name) continue;
      
      const y = baseY + (i - 0.5) * 60;
      const isStarboard = i === 0;
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      this.drawNameWithBackground(name, x, y);
    }
  }

  private drawSingleCrewName(crewNames: string[], centerX: number, imgY: number, imgHeight: number) {
    const name = crewNames[0];
    if (name) {
      this.drawNameWithBackground(name, centerX, imgY + imgHeight / 2);
    }
  }

  private drawNameWithBackground(name: string, x: number, y: number) {
    const textWidth = this.ctx.measureText(name).width;
    const padding = 8;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = 32;

    // Background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight);

    // Text
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.fillText(name, x, y + 6);
  }
  
  
}
