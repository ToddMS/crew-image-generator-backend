import { BackgroundComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';

export class GeometricBackground implements BackgroundComponent {
  draw(ctx: CanvasRenderingContext2D, dimensions: CanvasDimensions, colors: ColorScheme): void {
    const { width: w, height: h } = dimensions;

    // Base background
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(0, 0, w, h);

    // Geometric hexagon pattern
    ctx.fillStyle = colors.primary;
    const hexSize = 80;
    const hexSpacing = hexSize * 1.5;
    
    for (let x = -hexSize; x < w + hexSize; x += hexSpacing) {
      for (let y = -hexSize; y < h + hexSize; y += hexSpacing * 0.866) {
        const offsetX = (y / (hexSpacing * 0.866)) % 2 === 0 ? 0 : hexSpacing / 2;
        this.drawHexagon(ctx, x + offsetX, y, hexSize * 0.3);
      }
    }

    // Gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, `${colors.primary}20`);
    gradient.addColorStop(1, `${colors.secondary}40`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}