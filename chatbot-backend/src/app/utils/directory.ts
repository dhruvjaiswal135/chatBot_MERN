import path from "node:path";
import fs from "node:fs";

export const getProjectRoot = () => {
    let currentDir = process.cwd();
    while (currentDir !== path.dirname(currentDir)) {
        if (fs.existsSync(path.join(currentDir, 'package.json'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    return process.cwd();
};