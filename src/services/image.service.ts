import { TemplateCanvas1 } from "./templateCanvas1";
import { TemplateCanvas2 } from "./templateCanvas2";
import { getNextFileName } from "../utils/file.utils.js";
import { Crew } from "../types/crew.types";

export const generateCrewImage = async (crew: Crew, imageName: string, template: number) => {
    if (!crew || !crew.crewNames || !Array.isArray(crew.crewNames)) {
        throw new Error("Invalid crew data: 'crewNames' is missing or not an array");
    }

    const outputPath = getNextFileName(imageName, "png");

    let canvas;
    if (template === 1) {
        canvas = new TemplateCanvas1(800, 400, "green", "pink");
    } else {
        canvas = new TemplateCanvas2(800, 400, "blue", "white");
    }

    await canvas.draw(crew);
    canvas.save(outputPath);

    return { outputPath };
};