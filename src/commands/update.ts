import path from "path";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import { registry, getAllComponentNames } from "../utils/registry.js";
import { readConfig, configExists } from "../utils/config.js";
import { getComponentsSourceDir, fileExists, readFile, writeFile } from "../utils/fs.js";
import { detectProjectType } from "../utils/tailwind.js";

interface UpdateOptions {
    yes?: boolean;
}

function getUtilsImportPath(
    projectType: string,
    componentsPath: string,
    utilsPath: string
): string {
    if (projectType === "cra") {
        const componentsDepth = componentsPath.split("/").length;
        const utilsPathParts = utilsPath.split("/");
        const upPath = "../".repeat(componentsDepth - 1);
        return upPath + utilsPathParts.slice(1).join("/") + "/utils";
    } else {
        return utilsPath.replace(/^src\//, "@/") + "/utils";
    }
}

export async function update(
    components: string[],
    options: UpdateOptions
): Promise<void> {
    const cwd = process.cwd();

    if (!(await configExists(cwd))) {
        console.log(chalk.red("\n✗ Diamant is not initialized in this project.\n"));
        console.log("Run " + chalk.cyan("diamant init") + " first.\n");
        process.exit(1);
    }

    const config = await readConfig(cwd);
    if (!config) {
        console.log(chalk.red("Failed to read diamant.json"));
        process.exit(1);
    }

    if (components.length === 0) {
        components = config.installedComponents || [];
    }

    if (components.length === 0) {
        console.log(chalk.yellow("\nNo components to update. Install some components first.\n"));
        console.log("Run " + chalk.cyan("diamant add <component>") + " to add components.\n");
        return;
    }

    const projectType = await detectProjectType(cwd);
    const utilsImportPath = getUtilsImportPath(
        projectType,
        config.aliases.components,
        config.aliases.utils
    );

    const componentsDir = path.join(cwd, config.aliases.components);
    const sourceDir = getComponentsSourceDir();
    const componentsToUpdate: Array<{ name: string; hasChanges: boolean }> = [];

    const spinner = ora("Checking for updates...").start();

    for (const name of components) {
        const normalizedName = name.toLowerCase();
        const componentDef = registry[normalizedName];

        if (!componentDef) {
            continue;
        }

        const localPath = path.join(componentsDir, componentDef.files[0]);
        const sourcePath = path.join(sourceDir, componentDef.files[0]);

        if (!(await fileExists(localPath))) {
            continue;
        }

        try {
            const localContent = await readFile(localPath);
            let sourceContent = await readFile(sourcePath);

            sourceContent = sourceContent.replace(
                /from\s+["']\.\.\/\.\.\/lib\/utils["']/g,
                `from "${utilsImportPath}"`
            );

            const hasChanges = localContent.trim() !== sourceContent.trim();
            componentsToUpdate.push({ name: normalizedName, hasChanges });
        } catch {
        }
    }

    spinner.stop();

    const updateable = componentsToUpdate.filter((c) => c.hasChanges);

    if (updateable.length === 0) {
        console.log(chalk.green("\n✓ All components are up to date!\n"));
        return;
    }

    console.log(chalk.bold("\n📦 Components with available updates:\n"));
    for (const { name } of updateable) {
        console.log(`   ${chalk.yellow("~")} ${registry[name].name}`);
    }
    console.log();

    if (!options.yes) {
        const response = await prompts({
            type: "confirm",
            name: "confirm",
            message: `Update ${updateable.length} component(s)? This will overwrite local changes.`,
            initial: true,
        });

        if (!response.confirm) {
            console.log(chalk.yellow("Update cancelled."));
            return;
        }
    }

    const updateSpinner = ora("Updating components...").start();

    for (const { name } of updateable) {
        const componentDef = registry[name];

        for (const file of componentDef.files) {
            const sourcePath = path.join(sourceDir, file);
            const destPath = path.join(componentsDir, file);

            let content = await readFile(sourcePath);

            content = content.replace(
                /from\s+["']\.\.\/\.\.\/lib\/utils["']/g,
                `from "${utilsImportPath}"`
            );

            await writeFile(destPath, content);
        }
    }

    updateSpinner.succeed(`Updated ${updateable.length} component(s)`);
    console.log();
}
