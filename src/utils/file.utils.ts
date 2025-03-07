import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOADS_DIR = path.join(os.homedir(), "Downloads");

export const ensureDirectoryExists = () => {
    if (!fs.existsSync(DOWNLOADS_DIR)) {
        fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
    }
};

export const getNextFileName = (fileName: string, extension: string): string => {
    ensureDirectoryExists();

    let count = 1;
    let newFilePath = path.join(DOWNLOADS_DIR, `${fileName}.${extension}`);

    while (fs.existsSync(newFilePath)) {
        newFilePath = path.join(DOWNLOADS_DIR, `${fileName}_${count}.${extension}`);
        count++;
    }
    return newFilePath;
};
