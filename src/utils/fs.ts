import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getTemplatesDir(): string {
    const distPath = path.join(__dirname, "..", "templates");

    if (fs.existsSync(distPath)) return distPath;

    throw new Error("Templates directory not found. Please rebuild the CLI package.");
}

export function getTemplatePath(filename: string): string {
    return path.join(getTemplatesDir(), filename);
}

export async function readTemplate(filename: string): Promise<string> {
    const templatePath = getTemplatePath(filename);
    return fs.readFile(templatePath, "utf-8");
}

export async function ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
}

export async function copyFile(
    src: string,
    dest: string,
    transform?: (content: string) => string
): Promise<void> {
    await ensureDir(path.dirname(dest));

    if (transform) {
        const content = await fs.readFile(src, "utf-8");
        const transformed = transform(content);
        await fs.writeFile(dest, transformed);
    } else {
        await fs.copy(src, dest);
    }
}

export async function fileExists(filePath: string): Promise<boolean> {
    return fs.pathExists(filePath);
}

export async function writeFile(filePath: string, content: string): Promise<void> {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
}

export async function readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, "utf-8");
}

export async function deleteFile(filePath: string): Promise<void> {
    if (await fileExists(filePath)) {
        await fs.remove(filePath);
    }
}

export function getComponentsSourceDir(): string {
    return path.join(getTemplatesDir(), "components");
}

export function getLibSourceDir(): string {
    return getTemplatesDir();
}
