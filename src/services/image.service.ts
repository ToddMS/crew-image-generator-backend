import { getNextFileName } from "../utils/file.utils.js";
import { Crew } from "../types/crew.types.js";

export interface ClubIconData {
    type: 'preset' | 'upload';
    filename?: string;
    filePath?: string;
}

export const generateCrewImage = async (crew: Crew, imageName: string, template: number, colors?: { primary: string; secondary: string }, clubIcon?: ClubIconData) => {
    if (!crew || !crew.crewNames || !Array.isArray(crew.crewNames)) {
        throw new Error("Invalid crew data: 'crewNames' is missing or not an array");
    }

    const outputPath = getNextFileName(imageName, "png");
    
    return { outputPath };
};