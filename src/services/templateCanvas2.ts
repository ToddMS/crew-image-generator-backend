import { BaseCanvas } from "./baseCanvas";
import { loadImage, Image } from "canvas";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

interface ClubIconData {
    type: 'preset' | 'upload';
    filename?: string;
    filePath?: string;
}

export class TemplateCanvas2 extends BaseCanvas {
    private color1: string;
    private color2: string;
    private clubIcon?: ClubIconData;

    constructor(width: number, height: number, color1: string, color2: string, clubIcon?: ClubIconData) {
        super(width, height);
        this.color1 = color1;
        this.color2 = color2;
        this.clubIcon = clubIcon;
    }

    public async draw(crew: any) {
        this.drawWaveBackground();

        const boatImagePath = this.getBoatImagePath(crew.boatType.value);
        const image = await this.loadBoatImage(boatImagePath);

        const imageSettings = {
            scale: 0.6,
            offsetX: this.width / 2 - (image.width * 0.6) / 2,
            offsetY: 200
        };

        const imgWidth = image.width * imageSettings.scale;
        const imgHeight = image.height * imageSettings.scale;
        const imgX = imageSettings.offsetX;
        const imgY = imageSettings.offsetY;

        // Draw boat image
        this.ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

        // Event and crew info
        this.ctx.font = "bold 24px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2;
        this.ctx.textAlign = "left";
        
        this.ctx.strokeText(crew.raceName, 40, 50);
        this.ctx.fillText(crew.raceName, 40, 50);
        
        this.ctx.font = "18px Arial";
        this.ctx.strokeText(`${crew.name} | ${crew.boatType.value}`, 40, 80);
        this.ctx.fillText(`${crew.name} | ${crew.boatType.value}`, 40, 80);

        // Club info
        this.ctx.font = "bold 16px Arial";
        this.ctx.textAlign = "left";
        this.ctx.strokeText(crew.clubName, 40, this.height - 40);
        this.ctx.fillText(crew.clubName, 40, this.height - 40);

        // Crew names along oars
        this.drawCrewNamesAlongOars(crew, imgX, imgY, imgWidth, imgHeight);

        // === Draw club logo at bottom right ===
        await this.drawClubLogo();
    }

    private async drawClubLogo() {
        if (!this.clubIcon) {
            console.log('Template2: No club icon provided, skipping logo');
            return;
        }

        try {
            let logo: Image;
            
            if (this.clubIcon.type === 'preset' && this.clubIcon.filename) {
                // Load preset logo from club-logos directory
                const logoPath = `../assets/club-logos/${this.clubIcon.filename}`;
                console.log('Template2: Loading preset logo from:', logoPath);
                logo = await this.loadBoatImage(logoPath);
            } else if (this.clubIcon.type === 'upload' && this.clubIcon.filePath) {
                // Load uploaded logo file
                console.log('Template2: Loading uploaded logo from:', this.clubIcon.filePath);
                logo = await loadImage(this.clubIcon.filePath);
            } else {
                console.log('Template2: Invalid club icon data, skipping logo');
                return;
            }

            // Draw logo at bottom right (smaller for this template)
            const logoSize = 80;
            const logoX = this.width - logoSize - 30;
            const logoY = this.height - logoSize - 30;
            
            console.log('Template2: Drawing club logo at position:', { logoX, logoY, logoSize });
            this.ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        } catch (error) {
            console.error('Template2: Error loading club logo:', error);
            // Continue without logo
        }
    }

    private drawWaveBackground() {
        const w = this.width;
        const h = this.height;

        // Base gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(1, this.color2);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);

        // Draw wave patterns
        this.ctx.fillStyle = `${this.color2}60`;
        for (let i = 0; i < 5; i++) {
            this.drawWave(h * 0.2 * i, 40 + i * 20, 0.8 - i * 0.1);
        }

        // Overlay pattern
        this.ctx.fillStyle = `${this.color1}30`;
        for (let i = 0; i < 3; i++) {
            this.drawWave(h * 0.3 * i + 100, 60, 0.6, true);
        }
    }

    private drawWave(yOffset: number, amplitude: number, opacity: number, reverse = false) {
        const w = this.width;
        this.ctx.globalAlpha = opacity;
        this.ctx.beginPath();
        this.ctx.moveTo(0, yOffset);
        
        for (let x = 0; x <= w; x += 10) {
            const y = yOffset + Math.sin((x / w) * Math.PI * 4) * amplitude * (reverse ? -1 : 1);
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.lineTo(w, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
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

    private drawCrewNamesAlongOars(crew: any, imgX: number, imgY: number, imgWidth: number, imgHeight: number) {
        const boatType = crew.boatType.value;
        const crewNames = crew.crewNames;
        const centerX = imgX + imgWidth / 2;
        
        this.ctx.font = "bold 18px Arial";

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
        const baseY = imgY + 60;
        const spacingY = (imgHeight - 120) / 7;
        const oarLength = 140;

        // Cox first
        if (crewNames[0]) {
            this.drawNameWithWaveBackground(crewNames[0], centerX, baseY - 30);
        }

        // Rowers 1-8
        for (let i = 1; i <= 8; i++) {
            const name = crewNames[i];
            if (!name) continue;
            
            const y = baseY + (i - 1) * spacingY;
            const isStarboard = i % 2 === 1;
            const x = centerX + (isStarboard ? oarLength : -oarLength);
            
            this.drawNameWithWaveBackground(name, x, y);
        }
    }

    private drawFourCrewNames(crewNames: string[], centerX: number, imgY: number, imgHeight: number, boatType: string) {
        const baseY = imgY + 50;
        const spacingY = (imgHeight - 100) / 3;
        const oarLength = 120;
        const hasCox = boatType === '4+';

        if (hasCox && crewNames[0]) {
            this.drawNameWithWaveBackground(crewNames[0], centerX, baseY - 25);
        }

        const startIdx = hasCox ? 1 : 0;
        for (let i = 0; i < 4; i++) {
            const name = crewNames[startIdx + i];
            if (!name) continue;
            
            const y = baseY + i * spacingY;
            const isStarboard = i % 2 === 0;
            const x = centerX + (isStarboard ? oarLength : -oarLength);
            
            this.drawNameWithWaveBackground(name, x, y);
        }
    }

    private drawDoubleCrewNames(crewNames: string[], centerX: number, imgY: number, imgHeight: number) {
        const baseY = imgY + imgHeight / 2;
        const oarLength = 100;

        for (let i = 0; i < 2; i++) {
            const name = crewNames[i];
            if (!name) continue;
            
            const y = baseY + (i - 0.5) * 40;
            const isStarboard = i === 0;
            const x = centerX + (isStarboard ? oarLength : -oarLength);
            
            this.drawNameWithWaveBackground(name, x, y);
        }
    }

    private drawSingleCrewName(crewNames: string[], centerX: number, imgY: number, imgHeight: number) {
        const name = crewNames[0];
        if (name) {
            this.drawNameWithWaveBackground(name, centerX, imgY + imgHeight / 2);
        }
    }

    private drawNameWithWaveBackground(name: string, x: number, y: number) {
        const textWidth = this.ctx.measureText(name).width;
        const padding = 10;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = 28;

        // Rounded background
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        this.ctx.beginPath();
        this.ctx.roundRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, 14);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = this.color1;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Text
        this.ctx.fillStyle = this.color1;
        this.ctx.textAlign = "center";
        this.ctx.fillText(name, x, y + 4);
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
}
