import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import {
    detectTailwind,
    promptTailwindInstall,
    detectPackageManager,
    getInstallCommand,
    detectProjectType,
} from "../utils/tailwind.js";
import { writeConfig, getDefaultConfig, configExists, type DiamantConfig } from "../utils/config.js";
import { getLibSourceDir, writeFile, ensureDir, fileExists } from "../utils/fs.js";
import { execSync } from "child_process";

interface InitOptions {
    yes?: boolean;
    typescript?: boolean;
    css?: string;
    components?: string;
}

export async function init(options: InitOptions): Promise<void> {
    const cwd = process.cwd();

    console.log(chalk.bold("\n✨ Initializing Diamant UI\n"));

    if (await configExists(cwd)) {
        const { overwrite } = await prompts({
            type: "confirm",
            name: "overwrite",
            message: "Diamant is already initialized. Overwrite configuration?",
            initial: false,
        });

        if (!overwrite) {
            console.log(chalk.yellow("Initialization cancelled."));
            return;
        }
    }

    const tailwindStatus = await detectTailwind(cwd);

    if (!tailwindStatus.installed) {
        const success = await promptTailwindInstall(cwd);
        if (!success) {
            process.exit(1);
        }
    } else {
        console.log(
            chalk.green(`✓ Tailwind CSS ${tailwindStatus.version} detected`)
        );
    }

    let config = getDefaultConfig();

    const hasTypeScript = await fs.pathExists(path.join(cwd, "tsconfig.json"));
    config.typescript = options.typescript ?? hasTypeScript;

    const isNextJs =
        (await fs.pathExists(path.join(cwd, "next.config.js"))) ||
        (await fs.pathExists(path.join(cwd, "next.config.ts"))) ||
        (await fs.pathExists(path.join(cwd, "next.config.mjs")));
    const hasSrcDir = await fs.pathExists(path.join(cwd, "src"));

    if (options.css) {
        config.tailwind.css = options.css;
    } else if (isNextJs) {
        config.tailwind.css = hasSrcDir ? "src/app/globals.css" : "app/globals.css";
    } else {
        config.tailwind.css = hasSrcDir ? "src/index.css" : "index.css";
    }

    if (options.components) {
        config.aliases.components = options.components;
    } else {
        config.aliases.components = hasSrcDir ? "src/components/ui" : "components/ui";
    }

    config.aliases.utils = hasSrcDir ? "src/lib" : "lib";

    const tailwindInfo = await detectTailwind(cwd);
    config.tailwind.config = tailwindInfo.configPath || "tailwind.config.js";

    if (!options.yes) {
        const responses = await prompts([
            {
                type: "text",
                name: "components",
                message: "Where should components be installed?",
                initial: config.aliases.components,
            },
            {
                type: "text",
                name: "utils",
                message: "Where should the utils file be created?",
                initial: config.aliases.utils,
            },
            {
                type: "text",
                name: "css",
                message: "Where is your global CSS file?",
                initial: config.tailwind.css,
            },
        ]);

        if (responses.components) config.aliases.components = responses.components;
        if (responses.utils) config.aliases.utils = responses.utils;
        if (responses.css) config.tailwind.css = responses.css;
    }

    const spinner = ora("Installing dependencies...").start();
    const packageManager = detectPackageManager(cwd);
    const deps = ["clsx", "tailwind-merge"];

    try {
        const command = getInstallCommand(packageManager, deps, false);
        execSync(command, { cwd, stdio: "pipe" });
        spinner.succeed("Dependencies installed");
    } catch {
        spinner.warn("Some dependencies may need manual installation");
    }

    const utilsSpinner = ora("Creating utility files...").start();
    const utilsDir = path.join(cwd, config.aliases.utils);
    const ext = config.typescript ? ".ts" : ".js";
    const utilsPath = path.join(utilsDir, `utils${ext}`);

    await ensureDir(utilsDir);

    const utilsContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
`;

    await writeFile(utilsPath, utilsContent);
    utilsSpinner.succeed(`Created ${config.aliases.utils}/utils${ext}`);

    const cssSpinner = ora("Setting up theme styles...").start();
    const themesSource = path.join(getLibSourceDir(), "themes.css");
    const userCssPath = path.join(cwd, config.tailwind.css);
    const projectType = await detectProjectType(cwd);

    try {
        const themesContent = await fs.readFile(themesSource, "utf-8");

        const tailwindImport = projectType === "cra"
            ? `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
            : `@import "tailwindcss";`;

        if (await fileExists(userCssPath)) {
            const existingContent = await fs.readFile(userCssPath, "utf-8");

            if (existingContent.includes("--background:")) {
                cssSpinner.succeed("Theme styles already present in CSS");
            } else {
                let newContent = existingContent;
                if (!existingContent.includes("@tailwind") && !existingContent.includes("tailwindcss")) {
                    newContent = tailwindImport + "\n\n" + existingContent;
                }
                newContent = newContent + "\n\n/* Diamant Theme */\n" + themesContent;
                await writeFile(userCssPath, newContent);
                cssSpinner.succeed(`Updated ${config.tailwind.css} with theme styles`);
            }
        } else {
            await ensureDir(path.dirname(userCssPath));
            const newContent = `${tailwindImport}\n\n/* Diamant Theme */\n${themesContent}`;
            await writeFile(userCssPath, newContent);
            cssSpinner.succeed(`Created ${config.tailwind.css} with theme styles`);
        }
    } catch (error) {
        cssSpinner.fail("Failed to set up themes");
        console.error(chalk.red("You may need to manually copy the theme styles."));
    }

    const configSpinner = ora("Writing configuration...").start();
    await writeConfig(config, cwd);
    configSpinner.succeed("Created diamant.json");

    console.log(chalk.green("\n✨ Diamant initialized successfully!\n"));
    console.log("Next steps:");
    console.log(chalk.cyan("  diamant add button") + " - Add a button component");
    console.log(chalk.cyan("  diamant list") + " - View all available components");
    console.log();
}
