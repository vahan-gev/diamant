import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

type ProjectType = "cra" | "nextjs" | "vite" | "unknown";

export async function detectProjectType(cwd: string = process.cwd()): Promise<ProjectType> {
  const packageJsonPath = path.join(cwd, "package.json");

  if (!(await fs.pathExists(packageJsonPath))) {
    return "unknown";
  }

  const packageJson: PackageJson = await fs.readJson(packageJsonPath);
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  if (deps?.["next"]) {
    return "nextjs";
  }

  if (deps?.["vite"]) {
    return "vite";
  }

  if (deps?.["react-scripts"]) {
    return "cra";
  }

  return "unknown";
}

export async function detectTailwind(cwd: string = process.cwd()): Promise<{
  installed: boolean;
  version: string | null;
  configPath: string | null;
}> {
  const packageJsonPath = path.join(cwd, "package.json");

  if (!(await fs.pathExists(packageJsonPath))) {
    return { installed: false, version: null, configPath: null };
  }

  const packageJson: PackageJson = await fs.readJson(packageJsonPath);
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const tailwindVersion = deps?.["tailwindcss"] || null;
  const installed = !!tailwindVersion;

  let configPath: string | null = null;
  const configNames = [
    "tailwind.config.js",
    "tailwind.config.ts",
    "tailwind.config.mjs",
    "tailwind.config.cjs",
  ];

  for (const name of configNames) {
    const fullPath = path.join(cwd, name);
    if (await fs.pathExists(fullPath)) {
      configPath = name;
      break;
    }
  }

  return { installed, version: tailwindVersion, configPath };
}

export function detectPackageManager(cwd: string = process.cwd()): "npm" | "yarn" | "pnpm" | "bun" {
  if (fs.existsSync(path.join(cwd, "bun.lockb"))) return "bun";
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

export function getInstallCommand(
  packageManager: "npm" | "yarn" | "pnpm" | "bun",
  packages: string[],
  dev: boolean = true
): string {
  const packagesStr = packages.join(" ");

  switch (packageManager) {
    case "bun":
      return `bun add ${dev ? "-d" : ""} ${packagesStr}`;
    case "pnpm":
      return `pnpm add ${dev ? "-D" : ""} ${packagesStr}`;
    case "yarn":
      return `yarn add ${dev ? "-D" : ""} ${packagesStr}`;
    case "npm":
    default:
      return `npm install ${dev ? "-D" : ""} ${packagesStr}`;
  }
}

export async function installTailwind(cwd: string = process.cwd()): Promise<boolean> {
  const packageManager = detectPackageManager(cwd);
  const projectType = await detectProjectType(cwd);
  const spinner = ora("Installing Tailwind CSS...").start();

  try {
    let packages: string[];

    if (projectType === "cra") {
      packages = ["tailwindcss@^3", "autoprefixer"];
      spinner.text = "Installing Tailwind CSS v3 for Create React App...";
    } else {
      packages = ["tailwindcss", "@tailwindcss/postcss", "postcss"];
    }

    const command = getInstallCommand(packageManager, packages, true);
    execSync(command, { cwd, stdio: "pipe" });
    spinner.succeed("Tailwind CSS installed successfully");

    return true;
  } catch (error) {
    spinner.fail("Failed to install Tailwind CSS");
    console.error(chalk.red("Please install Tailwind CSS manually."));
    return false;
  }
}

export async function createTailwindConfig(cwd: string = process.cwd()): Promise<void> {
  const projectType = await detectProjectType(cwd);

  const isModule = projectType !== "cra";

  const configContent = isModule
    ? `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
`
    : `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
`;

  await fs.writeFile(path.join(cwd, "tailwind.config.js"), configContent);
}

export async function createPostcssConfig(cwd: string = process.cwd()): Promise<void> {
  const projectType = await detectProjectType(cwd);

  let configContent: string;

  if (projectType === "cra") {
    configContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
  } else {
    configContent = `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`;
  }

  const filename = projectType === "cra" ? "postcss.config.js" : "postcss.config.mjs";
  await fs.writeFile(path.join(cwd, filename), configContent);
}

export async function promptTailwindInstall(cwd: string = process.cwd()): Promise<boolean> {
  const projectType = await detectProjectType(cwd);

  console.log(chalk.yellow("\n⚠️  Tailwind CSS not detected in your project.\n"));

  if (projectType !== "unknown") {
    console.log(chalk.dim(`Detected project type: ${projectType}\n`));
  }

  const response = await prompts({
    type: "confirm",
    name: "install",
    message: "Would you like to install and configure Tailwind CSS?",
    initial: true,
  });

  if (!response.install) {
    console.log(
      chalk.red("\nDiamant requires Tailwind CSS. Please install it manually and try again.")
    );
    return false;
  }

  const installed = await installTailwind(cwd);
  if (!installed) return false;

  const spinner = ora("Creating configuration files...").start();
  await createTailwindConfig(cwd);
  await createPostcssConfig(cwd);
  spinner.succeed("Tailwind CSS configured successfully");

  return true;
}
