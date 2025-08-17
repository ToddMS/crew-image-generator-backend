import { CanvasRenderingContext2D } from 'canvas';
import { Crew } from '../../types/crew.types.js';

export interface TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, data: any, config: any): void;
}

export interface BackgroundComponent {
  draw(ctx: CanvasRenderingContext2D, dimensions: CanvasDimensions, colors: ColorScheme): void;
}

export interface NameDisplayComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, positioning: NamePositioning, colors: ColorScheme): void;
}

export interface BoatStyleComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, positioning: BoatPositioning, colors: ColorScheme): void;
}

export interface TextLayoutComponent extends TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, crew: Crew, positioning: TextPositioning, colors: ColorScheme): void;
}

export interface LogoComponent extends TemplateComponent {
  draw(ctx: CanvasRenderingContext2D, logoData: ClubIconData, positioning: LogoPositioning): void;
}

// Data interfaces
export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
}

export interface NamePositioning {
  baseY: number;
  spacingY: number;
  oarLength: number;
  centerX: number;
  imgY: number;
  imgHeight: number;
}

export interface BoatPositioning {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface TextPositioning {
  raceNameX: number;
  raceNameY: number;
  boatNameX: number;
  boatNameY: number;
  coachX: number;
  coachY: number;
}

export interface LogoPositioning {
  x: number;
  y: number;
  size: number;
}

export interface ClubIconData {
  type: 'preset' | 'upload';
  filename?: string;
  filePath?: string;
  base64?: string;
}

// Template configuration
export interface TemplateConfig {
  background: BackgroundType;
  nameDisplay: NameDisplayType;
  boatStyle: BoatStyleType;
  textLayout: TextLayoutType;
  logo: LogoType;
  dimensions: CanvasDimensions;
  colors: ColorScheme;
}

export type BackgroundType = 'geometric' | 'diagonal' | 'radial-burst' | 'solid' | 'gradient';
export type NameDisplayType = 'basic' | 'labeled' | 'burst' | 'minimal' | 'boxed';
export type BoatStyleType = 'centered' | 'offset' | 'showcase';
export type TextLayoutType = 'header-left' | 'header-center' | 'minimal';
export type LogoType = 'bottom-right' | 'top-right' | 'bottom-left' | 'none';