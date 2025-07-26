import { TemplateCanvas3 } from "./templateCanvas3.js";
import { TemplateCanvas1 } from "./templateCanvas1.js";
import { TemplateCanvas2 } from "./templateCanvas2.js";
import { getNextFileName } from "../utils/file.utils.js";
import { Crew } from "../types/crew.types.js";

interface ClubIconData {
    type: 'preset' | 'upload';
    filename?: string;
    filePath?: string;
}

export const generateCrewImage = async (crew: Crew, imageName: string, template: number, colors?: { primary: string; secondary: string }, clubIcon?: ClubIconData) => {
    if (!crew || !crew.crewNames || !Array.isArray(crew.crewNames)) {
        throw new Error("Invalid crew data: 'crewNames' is missing or not an array");
    }

    const outputPath = getNextFileName(imageName, "png");

    // Use provided colors or defaults
    const primaryColor = colors?.primary || "#5E98C2";
    const secondaryColor = colors?.secondary || "#ffffff";

    console.log('Image Service: Creating template with club icon:', clubIcon);

    let canvas;
    if (template === 1) {
        canvas = new TemplateCanvas1(primaryColor, secondaryColor, clubIcon);
    } else if (template === 2) {
        canvas = new TemplateCanvas2(800, 400, primaryColor, secondaryColor, clubIcon);
    } else {
        canvas = new TemplateCanvas3(primaryColor, secondaryColor, clubIcon);
    }

    await canvas.draw(crew);
    canvas.save(outputPath);

    return { outputPath };
};