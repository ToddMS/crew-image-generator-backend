import { BackgroundComponent, CanvasDimensions, ColorScheme } from '../interfaces.js';

export class RadialBurstBackground implements BackgroundComponent {
  draw(ctx: CanvasRenderingContext2D, dimensions: CanvasDimensions, colors: ColorScheme): void {
    const { width: w, height: h } = dimensions;
    const centerX = w / 2;
    const centerY = h / 2;

    // Radial gradient base
    const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(w, h));
    radialGradient.addColorStop(0, colors.secondary);
    radialGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, w, h);

    // Burst rays
    ctx.fillStyle = `${colors.primary}40`;
    const numRays = 24;
    const maxRadius = Math.max(w, h);
    
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      const rayWidth = Math.PI / 36; // Ray width in radians
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, angle - rayWidth, angle + rayWidth);
      ctx.closePath();
      ctx.fill();
    }

    // Central highlight
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
    centerGradient.addColorStop(0, `${colors.secondary}80`);
    centerGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGradient;
    ctx.fillRect(0, 0, w, h);
  }
}