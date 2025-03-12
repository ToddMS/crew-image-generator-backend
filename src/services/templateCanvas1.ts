import { BaseCanvas } from "./baseCanvas";
import { Crew } from "../types/crew.types";

export class TemplateCanvas1 extends BaseCanvas {
    private color1: string;
    private color2: string;

    constructor(width: number, height: number, color1: string, color2: string) {
        super(width, height);
        this.color1 = color1;
        this.color2 = color2;
    }

    public async draw(crew: Crew) {
        this.ctx.fillStyle = this.color1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.width, 0);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = this.color2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.width, 0);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
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

        this.drawBoatAndOars(crew);
    }

    private drawBoatAndOars(crew: Crew) {
        const boatWidth = 20;
        const boatHeight = 200;
        const oarLength = 100;
        const oarWidth = 10;
        const boatX = (this.width - boatWidth) / 2;
        const boatY = this.height - boatHeight - 20;

        this.ctx.fillStyle = "brown";
        this.ctx.fillRect(boatX, boatY, boatWidth, boatHeight);

        const crewNames = crew.crewNames;
        const totalCrew = crewNames.length;
        const hasCox = totalCrew % 2 !== 0;
        const halfCrew = Math.floor(totalCrew / 2);
        const yOffset = (boatHeight / (totalCrew + (hasCox ? 1 : 0))) + 10;

        let currentY = boatY + yOffset / 2;

        if (hasCox) {
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = "center";
            this.ctx.fillText(crewNames[0], boatX + boatWidth / 2, currentY - 30);
            currentY += yOffset;
        }

        for (let i = 0; i < halfCrew; i++) {
            this.ctx.fillStyle = "gray";
            this.ctx.fillRect(boatX - oarLength, currentY - oarWidth / 2, oarLength, oarWidth);
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = "right";
            this.ctx.fillText(crewNames[2 * i + (hasCox ? 1 : 0)], boatX - oarLength - 10, currentY + 5);

            this.ctx.fillStyle = "gray";
            this.ctx.fillRect(boatX + boatWidth, currentY - oarWidth / 2, oarLength, oarWidth);
            this.ctx.fillStyle = "black";
            this.ctx.textAlign = "left";
            this.ctx.fillText(crewNames[2 * i + 1 + (hasCox ? 1 : 0)], boatX + boatWidth + oarLength + 10, currentY + 5);

            currentY += yOffset;
        }
    }
}