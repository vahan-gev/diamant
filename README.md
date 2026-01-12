<div align="center">

# ✨ Diamant

**Beautiful React UI components, one command away**

[![npm version](https://img.shields.io/npm/v/diamant?style=flat-square&color=CB3837)](https://www.npmjs.com/package/diamant)
[![npm downloads](https://img.shields.io/npm/dm/diamant?style=flat-square&color=blue)](https://www.npmjs.com/package/diamant)
[![GitHub stars](https://img.shields.io/github/stars/vahan-gev/diamant?style=flat-square&color=gold)](https://github.com/vahan-gev/diamant)
[![License](https://img.shields.io/npm/l/diamant?style=flat-square&color=green)](LICENSE)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat-square)](https://diamant-demo.vercel.app/)

Add stunning, accessible UI components to your React and Next.js projects.<br/>
Inspired by [shadcn/ui](https://ui.shadcn.com) — own your components, customize everything.

[Live Demo](https://diamant-demo.vercel.app/) •
[Getting Started](#-getting-started) •
[Components](#-components) •
[Commands](#-commands) •
[Configuration](#-configuration)

</div>

---

## 🚀 Getting Started

Get up and running in seconds with a single command:

```bash
npx diamant init
```

This will automatically:

-   🎨 Detect or install Tailwind CSS
-   🎭 Set up theme variables and animations
-   🔧 Create the `cn()` utility function
-   📝 Generate `diamant.json` configuration

---

## 📦 Adding Components

```bash
# Add specific components
npx diamant add button dialog card

# Add all components at once
npx diamant add --all

# Interactive picker (prompts you to select)
npx diamant add
```

---

## 🧩 Components

A carefully curated collection of **25+ accessible, customizable components**:

| Component      | Description                       |
| -------------- | --------------------------------- |
| `accordion`    | Collapsible content sections      |
| `alert`        | Static callout messages           |
| `alertdialog`  | Modal confirmation dialogs        |
| `avatar`       | User profile images with fallback |
| `badge`        | Small status indicators           |
| `button`       | Click actions with ripple effect  |
| `card`         | Content containers                |
| `carousel`     | Image/content slideshows          |
| `checkbox`     | Boolean form inputs               |
| `dialog`       | Modal dialogs                     |
| `dropdown`     | Click/hover menus                 |
| `input`        | Text input fields                 |
| `label`        | Form labels                       |
| `notification` | Toast notifications               |
| `progress`     | Progress indicators               |
| `radio`        | Single-select options             |
| `select`       | Dropdown selection                |
| `separator`    | Visual dividers                   |
| `sheet`        | Slide-in panels                   |
| `skeleton`     | Loading placeholders              |
| `slider`       | Range inputs                      |
| `switch`       | Toggle switches                   |
| `tabs`         | Tabbed interfaces                 |
| `textarea`     | Multi-line inputs                 |
| `toggle`       | Two-state buttons                 |
| `tooltip`      | Hover information                 |

<br />

## ⌨️ Commands

| Command                              | Description                          |
| ------------------------------------ | ------------------------------------ |
| `npx diamant init`                   | Initialize Diamant in your project   |
| `npx diamant add [components...]`    | Add one or more components           |
| `npx diamant remove <components...>` | Remove installed components          |
| `npx diamant update [components...]` | Update components to latest versions |
| `npx diamant diff [component]`       | View local changes vs. original      |
| `npx diamant list`                   | List all available components        |

<br />

## ⚙️ Configuration

After running `init`, a `diamant.json` file is created in your project root:

```json
{
    "typescript": true,
    "tailwind": {
        "config": "tailwind.config.js",
        "css": "src/app/globals.css"
    },
    "aliases": {
        "components": "src/components/ui",
        "utils": "src/lib"
    }
}
```

You can customize:

-   **TypeScript support** — toggle `.ts`/`.tsx` or `.js`/`.jsx` output
-   **Tailwind paths** — point to your config and global CSS files
-   **Component aliases** — define where components and utilities live

<br />

## 📋 Requirements

| Requirement  | Version    |
| ------------ | ---------- |
| Node.js      | 18+        |
| React        | 18+        |
| Tailwind CSS | 3.4+ or 4+ |

<br />

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br />

## 📄 License

[MIT](LICENSE) © Vahan Gevorgyan

<br />

<div align="center">

**Made with ❤️ for the React community**

</div>
