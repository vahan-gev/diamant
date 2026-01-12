import fs from "fs-extra";
import path from "path";

export interface DiamantConfig {
    $schema?: string;
    typescript: boolean;
    tailwind: {
        config: string;
        css: string;
    };
    aliases: {
        components: string;
        utils: string;
    };
    installedComponents: string[];
}

const DEFAULT_CONFIG: DiamantConfig = {
    typescript: true,
    tailwind: {
        config: "tailwind.config.js",
        css: "src/app/globals.css",
    },
    aliases: {
        components: "src/components/ui",
        utils: "src/lib",
    },
    installedComponents: [],
};

const CONFIG_FILENAME = "diamant.json";

export function getConfigPath(cwd: string = process.cwd()): string {
    return path.join(cwd, CONFIG_FILENAME);
}

export async function configExists(cwd: string = process.cwd()): Promise<boolean> {
    return fs.pathExists(getConfigPath(cwd));
}

export async function readConfig(cwd: string = process.cwd()): Promise<DiamantConfig | null> {
    const configPath = getConfigPath(cwd);

    if (!(await fs.pathExists(configPath))) {
        return null;
    }

    try {
        const content = await fs.readFile(configPath, "utf-8");
        return JSON.parse(content);
    } catch {
        return null;
    }
}

export async function writeConfig(
    config: DiamantConfig,
    cwd: string = process.cwd()
): Promise<void> {
    const configPath = getConfigPath(cwd);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
}

export function getDefaultConfig(): DiamantConfig {
    return { ...DEFAULT_CONFIG };
}

export async function addInstalledComponent(
    componentName: string,
    cwd: string = process.cwd()
): Promise<void> {
    const config = await readConfig(cwd);
    if (!config) return;

    if (!config.installedComponents.includes(componentName)) {
        config.installedComponents.push(componentName);
        config.installedComponents.sort();
        await writeConfig(config, cwd);
    }
}

export async function removeInstalledComponent(
    componentName: string,
    cwd: string = process.cwd()
): Promise<void> {
    const config = await readConfig(cwd);
    if (!config) return;

    const index = config.installedComponents.indexOf(componentName);
    if (index !== -1) {
        config.installedComponents.splice(index, 1);
        await writeConfig(config, cwd);
    }
}

export async function isComponentInstalled(
    componentName: string,
    cwd: string = process.cwd()
): Promise<boolean> {
    const config = await readConfig(cwd);
    if (!config) return false;

    return config.installedComponents.includes(componentName);
}
