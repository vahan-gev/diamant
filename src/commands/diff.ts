import path from "path";
import chalk from "chalk";
import * as Diff from "diff";
import { registry, getAllComponentNames } from "../utils/registry.js";
import { readConfig, configExists } from "../utils/config.js";
import { getComponentsSourceDir, fileExists, readFile } from "../utils/fs.js";
import { detectProjectType } from "../utils/tailwind.js";

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

export async function diff(component?: string): Promise<void> {
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

    const componentsDir = path.join(cwd, config.aliases.components);
    const sourceDir = getComponentsSourceDir();
    const projectType = await detectProjectType(cwd);
    const utilsImportPath = getUtilsImportPath(
        projectType,
        config.aliases.components,
        config.aliases.utils
    );

    if (component) {
        const normalizedName = component.toLowerCase();
        const componentDef = registry[normalizedName];

        if (!componentDef) {
            console.log(chalk.red(`\n✗ Unknown component: ${component}\n`));
            console.log("Run " + chalk.cyan("diamant list") + " to see available components.\n");
            return;
        }

        const localPath = path.join(componentsDir, componentDef.files[0]);

        if (!(await fileExists(localPath))) {
            console.log(chalk.yellow(`\n⚠️  Component "${componentDef.name}" is not installed.\n`));
            console.log("Run " + chalk.cyan(`diamant add ${normalizedName}`) + " to install it.\n");
            return;
        }

        await showDiff(normalizedName, localPath, sourceDir, utilsImportPath);
        return;
    }

    const installedComponents = config.installedComponents || [];

    if (installedComponents.length === 0) {
        console.log(chalk.yellow("\nNo components installed.\n"));
        return;
    }

    console.log(chalk.bold("\n📋 Component Status:\n"));

    let hasModified = false;

    for (const name of installedComponents) {
        const componentDef = registry[name];
        if (!componentDef) continue;

        const localPath = path.join(componentsDir, componentDef.files[0]);
        const sourcePath = path.join(sourceDir, componentDef.files[0]);

        if (!(await fileExists(localPath))) {
            console.log(`   ${chalk.red("✗")} ${componentDef.name} ${chalk.dim("(missing)")}`);
            continue;
        }

        try {
            const localContent = await readFile(localPath);
            let sourceContent = await readFile(sourcePath);

            sourceContent = sourceContent.replace(
                /from\s+["']\.\.\/\.\.\/lib\/utils["']/g,
                `from "${utilsImportPath}"`
            );

            if (localContent.trim() === sourceContent.trim()) {
                console.log(`   ${chalk.green("✓")} ${componentDef.name} ${chalk.dim("(up to date)")}`);
            } else {
                hasModified = true;
                const changes = Diff.diffLines(sourceContent, localContent);
                const additions = changes.filter((c) => c.added).length;
                const deletions = changes.filter((c) => c.removed).length;
                console.log(
                    `   ${chalk.yellow("~")} ${componentDef.name} ` +
                    chalk.dim(`(+${additions} -${deletions} blocks)`)
                );
            }
        } catch {
            console.log(`   ${chalk.red("!")} ${componentDef.name} ${chalk.dim("(error reading)")}`);
        }
    }

    console.log();

    if (hasModified) {
        console.log(
            chalk.dim("Run ") +
            chalk.cyan("diamant diff <component>") +
            chalk.dim(" to see detailed changes.\n")
        );
    }
}

async function showDiff(
    name: string,
    localPath: string,
    sourceDir: string,
    utilsImportPath: string
): Promise<void> {
    const componentDef = registry[name];
    const sourcePath = path.join(sourceDir, componentDef.files[0]);

    try {
        const localContent = await readFile(localPath);
        let sourceContent = await readFile(sourcePath);

        sourceContent = sourceContent.replace(
            /from\s+["']\.\.\/\.\.\/lib\/utils["']/g,
            `from "${utilsImportPath}"`
        );

        if (localContent.trim() === sourceContent.trim()) {
            console.log(chalk.green(`\n✓ ${componentDef.name} is up to date.\n`));
            return;
        }

        console.log(chalk.bold(`\n📄 Diff for ${componentDef.name}:\n`));

        const changes = Diff.diffLines(sourceContent, localContent);

        for (const part of changes) {
            if (part.added) {
                const lines = part.value.split("\n").filter((l) => l);
                for (const line of lines) {
                    console.log(chalk.green(`+ ${line}`));
                }
            } else if (part.removed) {
                const lines = part.value.split("\n").filter((l) => l);
                for (const line of lines) {
                    console.log(chalk.red(`- ${line}`));
                }
            }
        }

        console.log();
        console.log(chalk.dim("Legend: ") + chalk.green("+ your changes") + " | " + chalk.red("- latest version"));
        console.log();
    } catch (error) {
        console.error(chalk.red("Error reading files:"), error);
    }
}
