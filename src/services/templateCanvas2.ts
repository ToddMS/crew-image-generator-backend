import { BaseCanvas } from "./baseCanvas";
import fs from "fs";

export class TemplateCanvas2 extends BaseCanvas {
    private color1: string;
    private color2: string;

    constructor(width: number, height: number, color1: string, color2: string) {
        super(width, height);
        this.color1 = color1;
        this.color2 = color2;
    }

    public async draw(crew: { crewNames?: string[] }) {
        this.ctx.fillStyle = this.color1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = this.color2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(this.width, 0);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(10, 10, 50, 50);

        this.ctx.font = "bold 24px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";

        const startX = this.width / 2;
        let startY = 100;
        const yOffset = 40;

        crew.crewNames?.forEach((name, index) => {
            this.ctx.fillText(name, startX, startY + index * yOffset);
        });
    }
}