import fs from 'fs';
import path from 'path';
import os from 'os';

export const getNextFileName = (baseName: string, extension: string) => {
    const downloadsFolder = path.join(os.homedir(), 'Downloads');
    let fileName = `${baseName}.${extension}`;
    let filePath = path.join(downloadsFolder, fileName);
    let counter = 1;

    while (fs.existsSync(filePath)) {
        fileName = `${baseName}_${counter}.${extension}`;
        filePath = path.join(downloadsFolder, fileName);
        counter++;
    }

    return filePath;
};