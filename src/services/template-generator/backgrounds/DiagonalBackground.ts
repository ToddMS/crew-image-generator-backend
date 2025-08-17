import { BackgroundComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';

export class DiagonalBackground implements BackgroundComponent {
  draw(ctx: CanvasRenderingContext2D, dimensions: CanvasDimensions, colors: ColorScheme): void {
    const { width: w, height: h } = dimensions;

    // Fill entire canvas with primary color (golden background)
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, w, h);

    // Calculate diagonal for truly parallel lines (same slope/direction)
    const diagonalOffset = 60; // Height difference for the diagonal
    const topLineY = 200; // Top line position - made bigger for larger text
    const bottomLineY = h - 200; // Bottom line position - made bigger for larger text
    
    // Top section - Dark header with diagonal cut
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(0, 0); // Top left
    ctx.lineTo(w, 0); // Top right  
    ctx.lineTo(w, topLineY - diagonalOffset); // Right edge higher
    ctx.lineTo(0, topLineY); // Left edge lower
    ctx.closePath();
    ctx.fill();

    // Bottom section - Dark footer with diagonal cut (same slope as top)
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(0, bottomLineY); // Left edge lower (same pattern as top)
    ctx.lineTo(w, bottomLineY - diagonalOffset); // Right edge higher (same slope as top)
    ctx.lineTo(w, h); // Bottom right
    ctx.lineTo(0, h); // Bottom left
    ctx.closePath();
    ctx.fill();

    // Thick white diagonal separator lines (truly parallel - same slope)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 12; // Much thicker to match original
    
    // Top diagonal line
    ctx.beginPath();
    ctx.moveTo(0, topLineY); // Left lower
    ctx.lineTo(w, topLineY - diagonalOffset); // Right higher
    ctx.stroke();
    
    // Bottom diagonal line (exact same slope as top line)
    ctx.beginPath();
    ctx.moveTo(0, bottomLineY); // Left lower
    ctx.lineTo(w, bottomLineY - diagonalOffset); // Right higher (same slope)
    ctx.stroke();
  }
}