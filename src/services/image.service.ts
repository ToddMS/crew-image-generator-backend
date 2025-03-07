import { createCanvas, loadImage } from "canvas";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getNextFileName, ensureDirectoryExists } from "../utils/file.utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsPath = path.join(__dirname, "../assets");
if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true });
}

export const generateCrewImage = async (crew: { crewNames?: string[]}) => {
    if (!crew || !crew.crewNames || !Array.isArray(crew.crewNames)) {
        throw new Error("Invalid crew data: 'crewNames' is missing or not an array");
    }

    const width = 800, height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    const boatImagePath = path.join(__dirname, "../assets/boat.png");

    if (fs.existsSync(boatImagePath)) {
        console.log("Boat image exists, using it as a background...");
        const boatImage = await loadImage(boatImagePath);
        ctx.drawImage(boatImage, 0, 0, width, height);
    }

    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    const startX = width / 2;
    let startY = 50; 
    const yOffset = 40; 

    crew.crewNames.forEach((name, index) => {
        ctx.fillText(name, startX, startY + index * yOffset);
    });

    ensureDirectoryExists();

    const outputPath = getNextFileName("boat", "png");

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`Image saved in Downloads: ${outputPath}`);

    return { buffer, outputPath };
};
