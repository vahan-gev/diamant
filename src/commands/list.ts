import chalk from "chalk";
import { registry, getAllComponentNames } from "../utils/registry.js";
import { readConfig, configExists } from "../utils/config.js";

interface ListOptions {
    installed?: boolean;
}

export async function list(options: ListOptions): Promise<void> {
    const cwd = process.cwd();

    const allComponents = getAllComponentNames();
    let installedComponents: string[] = [];

    if (await configExists(cwd)) {
        const config = await readConfig(cwd);
        if (config) {
            installedComponents = config.installedComponents || [];
        }
    }

    const componentsToShow = options.installed
        ? allComponents.filter((name) => installedComponents.includes(name))
        : allComponents;

    if (componentsToShow.length === 0) {
        if (options.installed) {
            console.log(chalk.yellow("\nNo components installed yet.\n"));
            console.log("Run " + chalk.cyan("diamant add <component>") + " to add components.\n");
        } else {
            console.log(chalk.yellow("\nNo components available.\n"));
        }
        return;
    }

    console.log(
        chalk.bold(
            options.installed
                ? "\n📦 Installed Components:\n"
                : "\n✨ Available Diamant Components:\n"
        )
    );

    for (const name of componentsToShow) {
        const component = registry[name];
        const isInstalled = installedComponents.includes(name);

        const status = isInstalled ? chalk.green("●") : chalk.dim("○");
        const nameDisplay = isInstalled
            ? chalk.white(component.name)
            : chalk.gray(component.name);

        console.log(`   ${status} ${nameDisplay.padEnd(20)} ${chalk.dim(component.description)}`);
    }

    console.log();

    if (!options.installed) {
        const installedCount = installedComponents.length;
        const totalCount = allComponents.length;

        console.log(
            chalk.dim(`   ${installedCount}/${totalCount} components installed`)
        );
        console.log();
        console.log(chalk.dim("   Legend: ") + chalk.green("●") + " installed  " + chalk.dim("○") + " not installed");
        console.log();
    }

    console.log(chalk.dim("Usage:"));
    console.log(chalk.cyan("   diamant add button dialog") + chalk.dim(" - Add specific components"));
    console.log(chalk.cyan("   diamant add --all") + chalk.dim(" - Add all components"));
    console.log();
}
