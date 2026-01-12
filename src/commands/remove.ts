import path from "path";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import { registry, getAllComponentNames } from "../utils/registry.js";
import { readConfig, removeInstalledComponent, configExists } from "../utils/config.js";
import { deleteFile, fileExists } from "../utils/fs.js";

interface RemoveOptions {
    yes?: boolean;
}

export async function remove(
    components: string[],
    options: RemoveOptions
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

    const validComponents: string[] = [];
    const invalidComponents: string[] = [];

    for (const name of components) {
        const normalizedName = name.toLowerCase();
        if (registry[normalizedName]) {
            validComponents.push(normalizedName);
        } else {
            invalidComponents.push(name);
        }
    }

    if (invalidComponents.length > 0) {
        console.log(chalk.yellow("\n⚠️  Unknown components:\n"));
        for (const name of invalidComponents) {
            console.log(`   - ${name}`);
        }
        console.log();
    }

    if (validComponents.length === 0) {
        console.log(chalk.red("No valid components to remove."));
        return;
    }

    const componentsDir = path.join(cwd, config.aliases.components);
    const installedComponents: string[] = [];

    for (const name of validComponents) {
        const componentDef = registry[name];
        const componentPath = path.join(componentsDir, componentDef.files[0]);
        if (await fileExists(componentPath)) {
            installedComponents.push(name);
        }
    }

    if (installedComponents.length === 0) {
        console.log(chalk.yellow("\nNone of the specified components are installed."));
        return;
    }

    const dependentComponents: string[] = [];
    const allInstalled = config.installedComponents || [];

    for (const name of installedComponents) {
        for (const [otherName, otherDef] of Object.entries(registry)) {
            if (
                otherDef.internalDependencies.includes(name) &&
                allInstalled.includes(otherName) &&
                !installedComponents.includes(otherName)
            ) {
                dependentComponents.push(otherName);
            }
        }
    }

    if (dependentComponents.length > 0) {
        console.log(chalk.yellow("\n⚠️  The following components depend on components being removed:\n"));
        for (const name of dependentComponents) {
            console.log(`   - ${registry[name].name}`);
        }
        console.log();
    }

    if (!options.yes) {
        console.log(chalk.bold("\n🗑️  The following components will be removed:\n"));
        for (const name of installedComponents) {
            console.log(`   - ${registry[name].name}`);
        }
        console.log();

        const response = await prompts({
            type: "confirm",
            name: "confirm",
            message: "Are you sure you want to remove these components?",
            initial: false,
        });

        if (!response.confirm) {
            console.log(chalk.yellow("Removal cancelled."));
            return;
        }
    }

    const spinner = ora("Removing components...").start();

    for (const name of installedComponents) {
        const componentDef = registry[name];

        for (const file of componentDef.files) {
            const filePath = path.join(componentsDir, file);
            await deleteFile(filePath);
        }

        await removeInstalledComponent(name, cwd);
    }

    spinner.succeed(`Removed ${installedComponents.length} component(s)`);
    console.log();
}
