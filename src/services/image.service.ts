import { TemplateCanvas3 } from "./templateCanvas3.js";
import { TemplateCanvas1 } from "./templateCanvas1.js";
import { TemplateCanvas2 } from "./templateCanvas2.js";
import { getNextFileName } from "../utils/file.utils.js";
import { Crew } from "../types/crew.types.js";

export const generateCrewImage = async (crew: Crew, imageName: string, template: number) => {
    if (!crew || !crew.crewNames || !Array.isArray(crew.crewNames)) {
        throw new Error("Invalid crew data: 'crewNames' is missing or not an array");
    }

    const outputPath = getNextFileName(imageName, "png");

    let canvas;
    if (template === 1) {
        canvas = new TemplateCanvas1("green", "pink");
    } else if (template === 2) {
        canvas = new TemplateCanvas2(800, 400, "blue", "white");
    } else {
        canvas = new TemplateCanvas3("navy", "gold");
    }

    await canvas.draw(crew);
    canvas.save(outputPath);

    return { outputPath };
};