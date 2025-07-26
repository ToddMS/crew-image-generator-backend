import { BaseCanvas } from "./baseCanvas";
import { Crew } from "../types/crew.types";
import { loadImage, Image } from "canvas";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

interface ClubIconData {
    type: 'preset' | 'upload';
    filename?: string;
    filePath?: string;
}

export class TemplateCanvas3 extends BaseCanvas {
    private color1: string;
    private color2: string;
    private clubIcon?: ClubIconData;

    constructor(color1: string, color2: string, clubIcon?: ClubIconData) {
        super(1080, 1350);
        this.color1 = color1;
        this.color2 = color2;
        this.clubIcon = clubIcon;
    }

    public async draw(crew: Crew) {
        this.drawRadialBurstBackground();
    
        const boatImagePath = this.getBoatImagePath(crew.boatType.value);
        const image = await this.loadBoatImage(boatImagePath);
    
        const imageSettings = {
            scale: 0.75,
            offsetX: (this.width - image.width * 0.75) / 2,
            offsetY: 320
          };          
    
        const imgWidth = image.width * imageSettings.scale;
        const imgHeight = image.height * imageSettings.scale;
        const imgX = imageSettings.offsetX;
        const imgY = imageSettings.offsetY;
    
        this.ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    
        // === Race, Boat Name, Boat Type ===
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = "center";
    
        this.ctx.font = "bold 42px Arial";
        this.ctx.strokeText(`${crew.raceName}`, this.width / 2, 100);
        this.ctx.fillText(`${crew.raceName}`, this.width / 2, 100);

        this.ctx.font = "32px Arial";
        this.ctx.strokeText(`${crew.name} | ${crew.boatType.value}`, this.width / 2, 150);
        this.ctx.fillText(`${crew.name} | ${crew.boatType.value}`, this.width / 2, 150);

        this.ctx.strokeText(`${crew.clubName}`, this.width / 2, 200);
        this.ctx.fillText(`${crew.clubName}`, this.width / 2, 200);

        this.drawCrewNamesAlongOars(crew, imgX, imgY, imgWidth, imgHeight);

        // === Draw club logo at bottom right ===
        await this.drawClubLogo();
    }

    private async drawClubLogo() {
        if (!this.clubIcon) {
            console.log('Template3: No club icon provided, skipping logo');
            return;
        }

        try {
            let logo: Image;
            
            if (this.clubIcon.type === 'preset' && this.clubIcon.filename) {
                // Load preset logo from club-logos directory
                const logoPath = `../assets/club-logos/${this.clubIcon.filename}`;
                console.log('Template3: Loading preset logo from:', logoPath);
                logo = await this.loadBoatImage(logoPath);
            } else if (this.clubIcon.type === 'upload' && this.clubIcon.filePath) {
                // Load uploaded logo file
                console.log('Template3: Loading uploaded logo from:', this.clubIcon.filePath);
                logo = await loadImage(this.clubIcon.filePath);
            } else {
                console.log('Template3: Invalid club icon data, skipping logo');
                return;
            }

            // Draw logo at bottom right
            const logoSize = 160;
            const logoX = this.width - logoSize - 60;
            const logoY = this.height - logoSize - 60;
            
            console.log('Template3: Drawing club logo at position:', { logoX, logoY, logoSize });
            this.ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        } catch (error) {
            console.error('Template3: Error loading club logo:', error);
            // Continue without logo
        }
    }
    

    private drawRadialBurstBackground() {
        const w = this.width;
        const h = this.height;
        const centerX = w / 2;
        const centerY = h / 2;
    
        // Radial gradient base
        const radialGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(w, h));
        radialGradient.addColorStop(0, this.color2);
        radialGradient.addColorStop(1, this.color1);
        this.ctx.fillStyle = radialGradient;
        this.ctx.fillRect(0, 0, w, h);
    
        // Burst rays
        this.ctx.fillStyle = `${this.color1}40`;
        const numRays = 24;
        const maxRadius = Math.max(w, h);
        
        for (let i = 0; i < numRays; i++) {
            const angle = (i / numRays) * Math.PI * 2;
            const rayWidth = Math.PI / 36; // Ray width in radians
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, maxRadius, angle - rayWidth, angle + rayWidth);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Central highlight
        const centerGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
        centerGradient.addColorStop(0, `${this.color2}80`);
        centerGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = centerGradient;
        this.ctx.fillRect(0, 0, w, h);
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
        
        this.ctx.font = "bold 22px Arial";

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
        const baseY = imgY + 80;
        const spacingY = (imgHeight - 160) / 7;
        const oarLength = 180;

        // Cox first
        if (crewNames[0]) {
            this.drawNameWithBurstBackground(crewNames[0], centerX, baseY - 40);
        }

        // Rowers 1-8
        for (let i = 1; i <= 8; i++) {
            const name = crewNames[i];
            if (!name) continue;
            
            const y = baseY + (i - 1) * spacingY;
            const isStarboard = i % 2 === 1;
            const x = centerX + (isStarboard ? oarLength : -oarLength);
            
            this.drawNameWithBurstBackground(name, x, y);
        }
    }

    private drawFourCrewNames(crewNames: string[], centerX: number, imgY: number, imgHeight: number, boatType: string) {
        const baseY = imgY + 60;
        const spacingY = (imgHeight - 120) / 3;
        const oarLength = 160;
        const hasCox = boatType === '4+';

        if (hasCox && crewNames[0]) {
            this.drawNameWithBurstBackground(crewNames[0], centerX, baseY - 30);
        }

        const startIdx = hasCox ? 1 : 0;
        for (let i = 0; i < 4; i++) {
            const name = crewNames[startIdx + i];
            if (!name) continue;
            
            const y = baseY + i * spacingY;
            const isStarboard = i % 2 === 0;
            const x = centerX + (isStarboard ? oarLength : -oarLength);
            
            this.drawNameWithBurstBackground(name, x, y);
        }
    }

    private drawDoubleCrewNames(crewNames: string[], centerX: number, imgY: number, imgHeight: number) {
        const baseY = imgY + imgHeight / 2;
        const oarLength = 140;

        for (let i = 0; i < 2; i++) {
            const name = crewNames[i];
            if (!name) continue;
            
            const y = baseY + (i - 0.5) * 50;
            const isStarboard = i === 0;
            const x = centerX + (isStarboard ? oarLength : -oarLength);
            
            this.drawNameWithBurstBackground(name, x, y);
        }
    }

    private drawSingleCrewName(crewNames: string[], centerX: number, imgY: number, imgHeight: number) {
        const name = crewNames[0];
        if (name) {
            this.drawNameWithBurstBackground(name, centerX, imgY + imgHeight / 2);
        }
    }

    private drawNameWithBurstBackground(name: string, x: number, y: number) {
        const textWidth = this.ctx.measureText(name).width;
        const padding = 12;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = 36;

        // Glowing background effect
        this.ctx.shadowColor = this.color1;
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        this.ctx.beginPath();
        this.ctx.roundRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, 18);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Bold border
        this.ctx.strokeStyle = this.color1;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Text
        this.ctx.fillStyle = this.color1;
        this.ctx.textAlign = "center";
        this.ctx.fillText(name, x, y + 6);
    }
    
    
}