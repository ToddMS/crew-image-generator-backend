import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import { Crew } from "../types/crew.types";

export abstract class BaseCanvas {
    protected width: number;
    protected height: number;
    protected canvas: any;
    protected ctx: any;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext("2d");
    }

    protected async loadImage(filePath: string) {
        if (fs.existsSync(filePath)) {
            return await loadImage(filePath);
        }
        throw new Error(`Image not found: ${filePath}`);
    }

    public abstract draw(crew: Crew): void;

    public save(outputPath: string) {
        const buffer = this.canvas.toBuffer("image/png");
        fs.writeFileSync(outputPath, buffer);
    }
}