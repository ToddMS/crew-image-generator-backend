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

    public async draw(crew: any) {
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
        this.ctx.fillRect(10, 10, 100, 100);

        this.ctx.font = "bold 24px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Club: ${crew.clubName}`, 120, 40);
        this.ctx.fillText(`Crew: ${crew.name}`, 120, 70);
        this.ctx.fillText(`Race: ${crew.raceName}`, 120, 100);
        this.ctx.fillText(`Boat Type: ${crew.boatType.name}`, 120, 130);

        this.ctx.textAlign = "center";
        const startX = this.width / 2;
        let startY = 200;
        const yOffset = 40;

        const crewNames = crew.crewNames;
        const totalCrew = crewNames.length;
        const hasCox = totalCrew % 2 !== 0;
        const halfCrew = Math.floor(totalCrew / 2);

        if (hasCox) {
            this.ctx.fillText(crewNames[0], startX, startY);
            startY += yOffset;
        }

        for (let i = 0; i < halfCrew; i++) {
            this.ctx.fillText(crewNames[2 * i + (hasCox ? 1 : 0)], startX - 100, startY + i * yOffset);
            this.ctx.fillText(crewNames[2 * i + 1 + (hasCox ? 1 : 0)], startX + 100, startY + i * yOffset);
        }
    }
}