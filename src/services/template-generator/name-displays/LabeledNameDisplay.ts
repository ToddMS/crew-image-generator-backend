import { NameDisplayComponent, NamePositioning, ColorScheme } from '../interfaces.js';
import { Crew } from '../../types/crew.types.js';

export class LabeledNameDisplay implements NameDisplayComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, positioning: NamePositioning, colors: ColorScheme): void {
    const boatType = crew.boatType.value;
    const crewNames = crew.crewNames;
    
    ctx.font = "bold 18px Arial";

    if (boatType === '8+') {
      this.drawEightCrewNames(ctx, crewNames, positioning, colors);
    } else if (boatType === '4+' || boatType === '4-' || boatType === '4x') {
      this.drawFourCrewNames(ctx, crewNames, positioning, boatType, colors);
    } else if (boatType === '2x' || boatType === '2-') {
      this.drawDoubleCrewNames(ctx, crewNames, positioning, colors);
    } else if (boatType === '1x') {
      this.drawSingleCrewName(ctx, crewNames, positioning);
    }
  }

  private drawEightCrewNames(ctx: CanvasRenderingContext2D, crewNames: string[], positioning: NamePositioning, colors: ColorScheme): void {
    const { baseY, spacingY, oarLength, centerX } = positioning;

    // Rowers: bow(1) at top, stroke(8) at bottom
    for (let seat = 1; seat <= 8; seat++) {
      const name = crewNames[seat];
      if (!name) continue;
      
      const visualPosition = 9 - seat; // seat 1 -> position 8(top), seat 8 -> position 1(bottom)
      const y = baseY + (visualPosition - 1) * spacingY;
      const isStarboard = visualPosition % 2 === 1; // visual positions 1,3,5,7 starboard
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      // Invert seat numbers: show visual position as seat number, B at top, S at bottom
      const seatLabel = visualPosition === 8 ? "S" : visualPosition === 1 ? "B" : visualPosition.toString();
      
      this.drawNameWithSeatLabel(ctx, name, x, y, seatLabel, colors);
    }

    // Cox at stern (bottom/back of boat) - moved further down
    if (crewNames[0]) {
      this.drawNameWithSeatLabel(ctx, crewNames[0], centerX, baseY + 7 * spacingY + 40, "C", colors);
    }
  }

  private drawFourCrewNames(ctx: CanvasRenderingContext2D, crewNames: string[], positioning: NamePositioning, boatType: string, colors: ColorScheme): void {
    const { baseY, spacingY, oarLength, centerX } = positioning;
    const hasCox = boatType === '4+';

    const startIdx = hasCox ? 1 : 0;
    for (let i = 0; i < 4; i++) {
      const name = crewNames[startIdx + i];
      if (!name) continue;
      
      const y = baseY + i * spacingY;
      const isStarboard = i % 2 === 0; // 0,2 = starboard (right), 1,3 = port (left)
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      // Seat numbering: 1 (bow) at top, 2, 3, 4 (stroke) at bottom
      const seatNumber = i + 1;
      const seatLabel = seatNumber === 1 ? "B" : seatNumber === 4 ? "S" : seatNumber.toString();
      
      this.drawNameWithSeatLabel(ctx, name, x, y, seatLabel, colors);
    }

    // Cox at stern (bottom/back of boat) if 4+ - moved further down
    if (hasCox && crewNames[0]) {
      this.drawNameWithSeatLabel(ctx, crewNames[0], centerX, baseY + 4 * spacingY + 50, "C", colors);
    }
  }

  private drawDoubleCrewNames(ctx: CanvasRenderingContext2D, crewNames: string[], positioning: NamePositioning, colors: ColorScheme): void {
    const { baseY, oarLength, centerX } = positioning;

    for (let i = 0; i < 2; i++) {
      const name = crewNames[i];
      if (!name) continue;
      
      const y = baseY + (i - 0.5) * 32;
      const isStarboard = i === 0; // 0 = stroke (starboard), 1 = bow (port)
      const x = centerX + (isStarboard ? oarLength : -oarLength);
      
      const seatLabel = i === 0 ? "B" : "S"; // 0 = bow (top), 1 = stroke (bottom)
      this.drawNameWithSeatLabel(ctx, name, x, y, seatLabel, colors);
    }
  }

  private drawSingleCrewName(ctx: CanvasRenderingContext2D, crewNames: string[], positioning: NamePositioning): void {
    const { centerX, imgY, imgHeight } = positioning;
    const name = crewNames[0];
    if (name) {
      // Note: Single doesn't use seat labels in current implementation
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(name, centerX, imgY + imgHeight / 2 + 80);
    }
  }

  private drawNameWithSeatLabel(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, seatLabel: string, colors: ColorScheme): void {
    // Set font for measurements
    ctx.font = "bold 16px Arial";
    
    const seatWidth = ctx.measureText(seatLabel + " ").width;
    const nameWidth = ctx.measureText(name).width;
    const totalWidth = seatWidth + nameWidth;
    const padding = 12;
    const bgWidth = totalWidth + padding * 2;
    const bgHeight = 32;

    // Rounded background
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    // @ts-ignore - roundRect is available in newer Canvas versions
    ctx.roundRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, 16);
    ctx.fill();

    // Border
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Seat label (bold, colored)
    ctx.fillStyle = colors.primary;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    const startX = x - totalWidth / 2;
    ctx.fillText(seatLabel, startX, y + 5);

    // Name (regular weight, darker)
    ctx.fillStyle = "#333333";
    ctx.font = "500 16px Arial";
    ctx.fillText(name, startX + seatWidth, y + 5);
  }
}