import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import { execSync } from "child_process";
import {
    registry,
    resolveComponentDependencies,
    getNpmDependencies,
    getAllComponentNames,
} from "../utils/registry.js";
import { readConfig, addInstalledComponent, configExists } from "../utils/config.js";
import { getComponentsSourceDir, fileExists, ensureDir, readFile, writeFile } from "../utils/fs.js";
import { detectPackageManager, getInstallCommand, detectProjectType } from "../utils/tailwind.js";

interface AddOptions {
    yes?: boolean;
    all?: boolean;
    overwrite?: boolean;
}

export async function add(
    components: string[],
    options: AddOptions
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

    if (options.all) {
        components = getAllComponentNames();
    }

    if (components.length === 0) {
        const allComponents = getAllComponentNames();
        const choices = allComponents.map((name) => ({
            title: registry[name].name,
            description: registry[name].description,
            value: name,
            selected: config.installedComponents.includes(name),
        }));

        const response = await prompts({
            type: "multiselect",
            name: "components",
            message: "Select components to add",
            choices,
            hint: "Space to select. Return to submit.",
        });

        if (!response.components || response.components.length === 0) {
            console.log(chalk.yellow("No components selected."));
            return;
        }

        components = response.components;
    }

    const resolvedComponents = resolveComponentDependencies(components);

    const componentsDir = path.join(cwd, config.aliases.components);
    const existingComponents: string[] = [];
    const newComponents: string[] = [];

    for (const name of resolvedComponents) {
        const componentDef = registry[name];
        if (!componentDef) continue;

        const componentPath = path.join(componentsDir, componentDef.files[0]);
        if (await fileExists(componentPath)) {
            existingComponents.push(name);
        } else {
            newComponents.push(name);
        }
    }

    if (existingComponents.length > 0 && !options.overwrite) {
        console.log(
            chalk.yellow("\n⚠️  The following components already exist:\n")
        );
        for (const name of existingComponents) {
            console.log(`   - ${registry[name].name}`);
        }

        if (!options.yes) {
            const response = await prompts({
                type: "confirm",
                name: "overwrite",
                message: "Overwrite existing components?",
                initial: false,
            });

            if (!response.overwrite) {
                if (newComponents.length === 0) {
                    console.log(chalk.yellow("\nNo new components to add."));
                    return;
                }
            } else {
                options.overwrite = true;
            }
        }
    }

    const componentsToAdd = options.overwrite
        ? resolvedComponents
        : newComponents;

    if (componentsToAdd.length === 0) {
        console.log(chalk.green("\n✓ All components are already installed."));
        return;
    }

    console.log(chalk.bold("\n✨ Adding components:\n"));
    for (const name of componentsToAdd) {
        const isNew = !existingComponents.includes(name);
        const isDep = !components.map((c) => c.toLowerCase()).includes(name);
        console.log(
            `   ${isNew ? chalk.green("+") : chalk.yellow("~")} ${registry[name].name}${isDep ? chalk.dim(" (dependency)") : ""}`
        );
    }
    console.log();

    const npmDeps = getNpmDependencies(componentsToAdd);
    if (npmDeps.length > 0) {
        const spinner = ora("Installing npm dependencies...").start();
        const packageManager = detectPackageManager(cwd);

        try {
            const command = getInstallCommand(packageManager, npmDeps, false);
            execSync(command, { cwd, stdio: "pipe" });
            spinner.succeed(`Installed ${npmDeps.join(", ")}`);
        } catch {
            spinner.warn("Some dependencies may need manual installation");
        }
    }

    const spinner = ora("Copying component files...").start();
    const sourceDir = getComponentsSourceDir();
    const projectType = await detectProjectType(cwd);

    await ensureDir(componentsDir);

    for (const name of componentsToAdd) {
        const componentDef = registry[name];
        if (!componentDef) continue;

        for (const file of componentDef.files) {
            const sourcePath = path.join(sourceDir, file);
            const destPath = path.join(componentsDir, file);

            try {
                let content = await readFile(sourcePath);

                let utilsImportPath: string;

                if (projectType === "cra") {
                    const componentsPath = config.aliases.components;
                    const utilsPath = config.aliases.utils;

                    const componentsDepth = componentsPath.split("/").length;
                    const utilsPathParts = utilsPath.split("/");

                    const upPath = "../".repeat(componentsDepth - 1);
                    utilsImportPath = upPath + utilsPathParts.slice(1).join("/") + "/utils";
                } else {
                    utilsImportPath = config.aliases.utils.replace(/^src\//, "@/") + "/utils";
                }

                content = content.replace(
                    /from\s+["']\.\.\/\.\.\/lib\/utils["']/g,
                    `from "${utilsImportPath}"`
                );

                await writeFile(destPath, content);
                await addInstalledComponent(name, cwd);
            } catch (err) {
                spinner.fail(`Failed to copy ${file}`);
                console.error(err);
                process.exit(1);
            }
        }
    }

    spinner.succeed("Components added successfully");

    console.log(chalk.green(`\n✨ Added ${componentsToAdd.length} component(s)\n`));
    console.log("Components are located in:", chalk.cyan(config.aliases.components));
    console.log();
}
