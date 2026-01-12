#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { init } from "./commands/init.js";
import { add } from "./commands/add.js";
import { remove } from "./commands/remove.js";
import { update } from "./commands/update.js";
import { diff } from "./commands/diff.js";
import { list } from "./commands/list.js";

const program = new Command();

program
    .name("diamant")
    .description(
        chalk.bold("✨ Diamant UI") +
        " - A beautiful React component library\n\n" +
        "Add stunning UI components to your project with a single command."
    )
    .version("1.0.0");

program
    .command("init")
    .description("Initialize Diamant in your project")
    .option("-y, --yes", "Skip confirmation prompts")
    .option("--typescript", "Use TypeScript (default: auto-detect)")
    .option("--css <path>", "Path to your global CSS file")
    .option("--components <path>", "Path to install components")
    .action(init);

program
    .command("add")
    .description("Add components to your project")
    .argument("[components...]", "Components to add")
    .option("-y, --yes", "Skip confirmation prompts")
    .option("-a, --all", "Add all components")
    .option("--overwrite", "Overwrite existing components")
    .action(add);

program
    .command("remove")
    .description("Remove components from your project")
    .argument("<components...>", "Components to remove")
    .option("-y, --yes", "Skip confirmation prompts")
    .action(remove);

program
    .command("update")
    .description("Update components to the latest version")
    .argument("[components...]", "Components to update (all if empty)")
    .option("-y, --yes", "Skip confirmation prompts")
    .action(update);

program
    .command("diff")
    .description("Show differences between local and latest component versions")
    .argument("[component]", "Component to diff (shows all modified if empty)")
    .action(diff);

program
    .command("list")
    .description("List all available components")
    .option("-i, --installed", "Show only installed components")
    .action(list);

if (process.argv.length <= 2) {
    program.outputHelp();
    process.exit(0);
}

program.parse();
