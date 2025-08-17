import { createCanvas, CanvasRenderingContext2D, loadImage } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { 
  TemplateConfig, 
  CanvasDimensions, 
  NamePositioning, 
  BoatPositioning, 
  TextPositioning, 
  LogoPositioning,
  ClubIconData,
  BackgroundComponent,
  NameDisplayComponent
} from './interfaces.js';
import { Crew } from '../types/crew.types.js';

import { GeometricBackground } from './backgrounds/GeometricBackground.js';
import { DiagonalBackground } from './backgrounds/DiagonalBackground.js';
import { RadialBurstBackground } from './backgrounds/RadialBurstBackground.js';
import { BasicNameDisplay } from './name-displays/BasicNameDisplay.js';
import { LabeledNameDisplay } from './name-displays/LabeledNameDisplay.js';

export class TemplateGeneratorService {
  private backgroundComponents: Map<string, BackgroundComponent>;
  private nameDisplayComponents: Map<string, NameDisplayComponent>;

  constructor() {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    this.backgroundComponents = new Map([
      ['geometric', new GeometricBackground()],
      ['diagonal', new DiagonalBackground()],
      ['radial-burst', new RadialBurstBackground()]
    ]);

    this.nameDisplayComponents = new Map([
      ['basic', new BasicNameDisplay()],
      ['labeled', new LabeledNameDisplay()]
    ]);
  }

  public async generateTemplate(crew: Crew, config: TemplateConfig, clubIcon?: ClubIconData): Promise<Buffer> {
    const canvas = createCanvas(config.dimensions.width, config.dimensions.height);
    const ctx = canvas.getContext('2d');

    // 1. Draw background
    const backgroundComponent = this.backgroundComponents.get(config.background);
    if (backgroundComponent) {
      backgroundComponent.draw(ctx, config.dimensions, config.colors);
    }

    // 2. Load and position boat
    const boatPositioning = this.calculateBoatPositioning(config);
    await this.drawBoat(ctx, crew, boatPositioning);

    // 3. Draw text layout (race name, boat name, coach)
    const textPositioning = this.calculateTextPositioning(config);
    this.drawTextLayout(ctx, crew, textPositioning, config);

    // 4. Draw crew names
    const namePositioning = this.calculateNamePositioning(config, boatPositioning);
    const nameDisplayComponent = this.nameDisplayComponents.get(config.nameDisplay);
    if (nameDisplayComponent) {
      nameDisplayComponent.draw(ctx, crew, namePositioning, config.colors);
    }

    // 5. Draw club logo
    if (clubIcon && config.logo !== 'none') {
      const logoPositioning = this.calculateLogoPositioning(config);
      await this.drawClubLogo(ctx, clubIcon, logoPositioning);
    }

    return canvas.toBuffer('image/png');
  }

  private calculateBoatPositioning(config: TemplateConfig): BoatPositioning {
    const scale = config.boatStyle === 'showcase' ? 0.45 : 0.8;
    const width = 400 * scale;
    const height = 600 * scale;
    
    return {
      x: (config.dimensions.width - width) / 2,
      y: config.boatStyle === 'offset' ? 250 : 280,
      width,
      height,
      scale
    };
  }

  private calculateNamePositioning(config: TemplateConfig, boatPositioning: BoatPositioning): NamePositioning {
    const baseY = config.nameDisplay === 'labeled' ? 
      boatPositioning.y + 230 :
      boatPositioning.y + 170;
    
    const spacingY = config.nameDisplay === 'labeled' ?
      (boatPositioning.height - 200) / 9.3 :
      (boatPositioning.height - 220) / 7;

    const oarLength = config.nameDisplay === 'labeled' ? 215 : 250;

    return {
      baseY,
      spacingY,
      oarLength,
      centerX: config.dimensions.width / 2,
      imgY: boatPositioning.y,
      imgHeight: boatPositioning.height
    };
  }

  private calculateTextPositioning(config: TemplateConfig): TextPositioning {
    if (config.background === 'diagonal') {
      return {
        raceNameX: 40,
        raceNameY: 80,
        boatNameX: 40,
        boatNameY: 130,
        coachX: config.dimensions.width / 2,
        coachY: 800
      };
    } else {
      return {
        raceNameX: 60,
        raceNameY: 120,
        boatNameX: 60,
        boatNameY: 180,
        coachX: config.dimensions.width / 2,
        coachY: 800
      };
    }
  }

  private calculateLogoPositioning(config: TemplateConfig): LogoPositioning {
    const size = config.background === 'radial-burst' ? 100 : 
                config.background === 'diagonal' ? 120 : 160;
    
    return {
      x: config.dimensions.width - size - (config.background === 'geometric' ? 60 : 30),
      y: config.dimensions.height - size - (config.background === 'geometric' ? 60 : 30),
      size
    };
  }

  private async drawBoat(ctx: CanvasRenderingContext2D, crew: Crew, positioning: BoatPositioning): Promise<void> {
    const boatImagePath = this.getBoatImagePath(crew.boatType.value);
    const image = await this.loadBoatImage(boatImagePath);
    
    ctx.drawImage(image, positioning.x, positioning.y, positioning.width, positioning.height);
  }

  private drawTextLayout(ctx: CanvasRenderingContext2D, crew: Crew, positioning: TextPositioning, config: TemplateConfig): void {
    ctx.fillStyle = config.background === 'diagonal' ? "white" : "black";
    ctx.strokeStyle = config.background === 'diagonal' ? "black" : undefined;
    ctx.textAlign = "left";
    
    if (config.background === 'diagonal') {
      ctx.font = "bold 56px Arial";
      ctx.lineWidth = 3;
      ctx.strokeText(crew.raceName, positioning.raceNameX, positioning.raceNameY);
      ctx.fillText(crew.raceName, positioning.raceNameX, positioning.raceNameY);
      
      ctx.font = "bold 32px Arial";
      ctx.strokeText(`${crew.name} | ${crew.boatType.value}`, positioning.boatNameX, positioning.boatNameY);
      ctx.fillText(`${crew.name} | ${crew.boatType.value}`, positioning.boatNameX, positioning.boatNameY);
    } else {
      ctx.font = "bold 56px Arial";
      ctx.fillText(crew.raceName, positioning.raceNameX, positioning.raceNameY);
      
      ctx.font = "36px Arial";
      ctx.fillText(`${crew.name} | ${crew.boatType.value}`, positioning.boatNameX, positioning.boatNameY);
    }

    if (crew.coachName && crew.coachName.trim()) {
      ctx.font = "bold 18px Arial";
      ctx.fillStyle = config.background === 'diagonal' ? "white" : "black";
      ctx.textAlign = "center";
      
      if (config.background === 'diagonal') {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeText(`Coach: ${crew.coachName}`, positioning.coachX, positioning.coachY);
      }
      ctx.fillText(`Coach: ${crew.coachName}`, positioning.coachX, positioning.coachY);
    }
  }

  private async drawClubLogo(ctx: CanvasRenderingContext2D, clubIcon: ClubIconData, positioning: LogoPositioning): Promise<void> {
    try {
      let logo;
      
      if (clubIcon.type === 'preset' && clubIcon.filename) {
        const logoPath = `../../assets/club-logos/${clubIcon.filename}`;
        logo = await this.loadBoatImage(logoPath);
      } else if (clubIcon.type === 'upload' && clubIcon.filePath) {
        logo = await loadImage(clubIcon.filePath);
      } else if (clubIcon.type === 'upload' && clubIcon.base64) {
        logo = await loadImage(clubIcon.base64);
      }

      ctx.drawImage(logo, positioning.x, positioning.y, positioning.size, positioning.size);
    } catch (error) {
      console.error('Error loading club logo:', error);
    }
  }

  private getBoatImagePath(boatType: string): string {
    const boatImageMap: { [key: string]: string } = {
      '8+': '../../assets/boats/eight.svg',
      '4+': '../../assets/boats/four.svg',
      '4-': '../../assets/boats/four.svg',
      '4x': '../../assets/boats/quad.svg',
      '2x': '../../assets/boats/double.svg',
      '2-': '../../assets/boats/pair.svg',
      '1x': '../../assets/boats/single.svg'
    };
    
    return boatImageMap[boatType] || '../../assets/boats/eight.svg';
  }

  private async loadBoatImage(relativePath: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const fullPath = resolve(__dirname, relativePath);
    return await loadImage(fullPath);
  }

  public static getTemplateConfigs(): Record<string, TemplateConfig> {
    const baseDimensions: CanvasDimensions = { width: 1080, height: 1350 };
    
    return {
      template1: {
        background: 'geometric',
        nameDisplay: 'basic',
        boatStyle: 'centered',
        textLayout: 'header-left',
        logo: 'bottom-right',
        dimensions: baseDimensions,
        colors: { primary: '#DAA520', secondary: '#2C3E50' }
      },
      template2: {
        background: 'diagonal',
        nameDisplay: 'labeled',
        boatStyle: 'offset',
        textLayout: 'header-left',
        logo: 'bottom-right',
        dimensions: baseDimensions,
        colors: { primary: '#DAA520', secondary: '#2C3E50' }
      },
      template3: {
        background: 'radial-burst',
        nameDisplay: 'basic',
        boatStyle: 'showcase',
        textLayout: 'header-center',
        logo: 'bottom-right',
        dimensions: baseDimensions,
        colors: { primary: '#DAA520', secondary: '#2C3E50' }
      }
    };
  }
}