import { NameDisplayComponent, NamePositioning, ColorScheme } from '../interfaces.js';
import { Crew } from '../../types/crew.types.js';

export class BasicNameDisplay implements NameDisplayComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, positioning: NamePositioning, colors: ColorScheme): void {
    const boatType = crew.boatType.value;
    const crewNames = crew.crewNames;
    
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    if (boatType === '8+') {
      this.drawEightCrewNames(ctx, crewNames, positioning);
    } else if (boatType === '4+' || boatType === '4-' || boatType === '4x') {
      this.drawFourCrewNames(ctx, crewNames, positioning, boatType);
    } else if (boatType === '2x' || boatType === '2-') {
      this.drawDoubleCrewNames(ctx, crewNames, positioning);
    } else if (boatType === '1x') {
      this.drawSingleCrewName(ctx, crewNames, positioning);
    }
  }

  private drawEightCrewNames(ctx: CanvasRenderingContext2D, crewNames: string[], positioning: NamePositioning): void {
    const { baseY, spacingY, oarLength, centerX } = positioning;

    // Cox at bottom
    if (crewNames[0]) {
      this.drawNameWithBackground(ctx, crewNames[0], centerX, baseY + 7 * spacingY + 20);
    }

    // Rowers: bow(1) at top, stroke(8) at bottom  
    for (let seat = 1; seat <= 8; seat++) {
      const name = crewNames[seat];
      if (!name) continue;
      
      const visualPosition = 9 - seat; // seat 1 -> position 8(top), seat 8 -> position 1(bottom)
      const y = baseY + (visualPosition - 1) * spacingY;
      const isStarboard = visualPosition % 2 === 1; // visual positions 1,3,5,7 starboard
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      this.drawNameWithBackground(ctx, name, x, y);
    }
  }

  private drawFourCrewNames(ctx: CanvasRenderingContext2D, crewNames: string[], positioning: NamePositioning, boatType: string): void {
    const { baseY, spacingY, oarLength, centerX } = positioning;
    const hasCox = boatType === '4+';

    if (hasCox && crewNames[0]) {
      this.drawNameWithBackground(ctx, crewNames[0], centerX, baseY + 4 * spacingY + 10);
    }

    const startIdx = hasCox ? 1 : 0;
    for (let i = 0; i < 4; i++) {
      const name = crewNames[startIdx + i];
      if (!name) continue;
      
      const y = baseY + i * spacingY;
      const isStarboard = i % 2 === 0;
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      this.drawNameWithBackground(ctx, name, x, y);
    }
  }

  private drawDoubleCrewNames(ctx: CanvasRenderingContext2D, crewNames: string[], positioning: NamePositioning): void {
    const { baseY, oarLength, centerX } = positioning;

    for (let i = 0; i < 2; i++) {
      const name = crewNames[i];
      if (!name) continue;
      
      const y = baseY + (i - 0.5) * 60;
      const isStarboard = i === 0;
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      this.drawNameWithBackground(ctx, name, x, y);
    }
  }

  private drawSingleCrewName(ctx: CanvasRenderingContext2D, crewNames: string[], positioning: NamePositioning): void {
    const { centerX, imgY, imgHeight } = positioning;
    const name = crewNames[0];
    if (name) {
      this.drawNameWithBackground(ctx, name, centerX, imgY + imgHeight / 2 + 80);
    }
  }

  private drawNameWithBackground(ctx: CanvasRenderingContext2D, name: string, x: number, y: number): void {
    const textWidth = ctx.measureText(name).width;
    const padding = 8;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = 32;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight);

    // Text
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(name, x, y + 6);
  }
}