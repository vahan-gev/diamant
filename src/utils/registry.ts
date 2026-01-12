export interface ComponentDefinition {
    name: string;
    description: string;
    dependencies: string[];
    internalDependencies: string[];
    files: string[];
}

export const registry: Record<string, ComponentDefinition> = {
    accordion: {
        name: "Accordion",
        description: "A vertically stacked set of interactive headings that reveal content",
        dependencies: ["lucide-react"],
        internalDependencies: [],
        files: ["Accordion.tsx"],
    },
    alert: {
        name: "Alert",
        description: "Displays a callout for user attention",
        dependencies: ["lucide-react"],
        internalDependencies: [],
        files: ["Alert.tsx"],
    },
    alertdialog: {
        name: "AlertDialog",
        description: "A modal dialog that interrupts the user with important content",
        dependencies: ["lucide-react"],
        internalDependencies: ["button"],
        files: ["AlertDialog.tsx"],
    },
    avatar: {
        name: "Avatar",
        description: "An image element with a fallback for user profiles",
        dependencies: [],
        internalDependencies: [],
        files: ["Avatar.tsx"],
    },
    badge: {
        name: "Badge",
        description: "Displays a small badge or tag",
        dependencies: [],
        internalDependencies: [],
        files: ["Badge.tsx"],
    },
    button: {
        name: "Button",
        description: "A clickable button with multiple variants and ripple effect",
        dependencies: [],
        internalDependencies: [],
        files: ["Button.tsx"],
    },
    card: {
        name: "Card",
        description: "A container for content with header, body, and footer sections",
        dependencies: [],
        internalDependencies: [],
        files: ["Card.tsx"],
    },
    carousel: {
        name: "Carousel",
        description: "A slideshow component for cycling through elements",
        dependencies: ["lucide-react"],
        internalDependencies: ["button"],
        files: ["Carousel.tsx"],
    },
    checkbox: {
        name: "Checkbox",
        description: "A control that allows the user to toggle between checked and unchecked",
        dependencies: ["lucide-react"],
        internalDependencies: [],
        files: ["Checkbox.tsx"],
    },
    dialog: {
        name: "Dialog",
        description: "A modal dialog for displaying content",
        dependencies: ["lucide-react"],
        internalDependencies: [],
        files: ["Dialog.tsx"],
    },
    dropdown: {
        name: "Dropdown",
        description: "A menu that appears on click or hover",
        dependencies: ["lucide-react"],
        internalDependencies: [],
        files: ["Dropdown.tsx"],
    },
    fontprovider: {
        name: "FontProvider",
        description: "Provider for managing fonts across your application",
        dependencies: [],
        internalDependencies: [],
        files: ["FontProvider.tsx"],
    },
    input: {
        name: "Input",
        description: "A text input field with multiple variants",
        dependencies: [],
        internalDependencies: [],
        files: ["Input.tsx"],
    },
    label: {
        name: "Label",
        description: "A label for form elements",
        dependencies: [],
        internalDependencies: [],
        files: ["Label.tsx"],
    },
    notification: {
        name: "Notification",
        description: "Toast-style notifications that appear at screen corners",
        dependencies: ["lucide-react"],
        internalDependencies: [],
        files: ["Notification.tsx"],
    },
    progress: {
        name: "Progress",
        description: "Displays an indicator showing the completion progress of a task",
        dependencies: [],
        internalDependencies: [],
        files: ["Progress.tsx"],
    },
    radio: {
        name: "Radio",
        description: "A set of checkable buttons where only one can be selected at a time",
        dependencies: [],
        internalDependencies: [],
        files: ["Radio.tsx"],
    },
    select: {
        name: "Select",
        description: "A dropdown for selecting from a list of options",
        dependencies: ["lucide-react"],
        internalDependencies: [],
        files: ["Select.tsx"],
    },
    separator: {
        name: "Separator",
        description: "A visual divider between content",
        dependencies: [],
        internalDependencies: [],
        files: ["Separator.tsx"],
    },
    sheet: {
        name: "Sheet",
        description: "A panel that slides in from the edge of the screen",
        dependencies: ["lucide-react"],
        internalDependencies: [],
        files: ["Sheet.tsx"],
    },
    skeleton: {
        name: "Skeleton",
        description: "A placeholder for content that is loading",
        dependencies: [],
        internalDependencies: [],
        files: ["Skeleton.tsx"],
    },
    slider: {
        name: "Slider",
        description: "An input for selecting a value from a range",
        dependencies: [],
        internalDependencies: [],
        files: ["Slider.tsx"],
    },
    switch: {
        name: "Switch",
        description: "A toggle switch for boolean values",
        dependencies: [],
        internalDependencies: [],
        files: ["Switch.tsx"],
    },
    tabs: {
        name: "Tabs",
        description: "A set of layered sections of content",
        dependencies: [],
        internalDependencies: [],
        files: ["Tabs.tsx"],
    },
    textarea: {
        name: "Textarea",
        description: "A multi-line text input field",
        dependencies: [],
        internalDependencies: [],
        files: ["Textarea.tsx"],
    },
    toggle: {
        name: "Toggle",
        description: "A two-state button that can be on or off",
        dependencies: [],
        internalDependencies: [],
        files: ["Toggle.tsx"],
    },
    tooltip: {
        name: "Tooltip",
        description: "A popup that displays information related to an element",
        dependencies: [],
        internalDependencies: [],
        files: ["Tooltip.tsx"],
    },
};

export function getAllComponentNames(): string[] {
    return Object.keys(registry);
}

export function resolveComponentDependencies(
    componentNames: string[]
): string[] {
    const resolved = new Set<string>();
    const toProcess = [...componentNames];

    while (toProcess.length > 0) {
        const name = toProcess.pop()!;
        const normalizedName = name.toLowerCase();

        if (resolved.has(normalizedName)) continue;

        const component = registry[normalizedName];
        if (!component) {
            console.warn(`Unknown component: ${name}`);
            continue;
        }

        resolved.add(normalizedName);

        for (const dep of component.internalDependencies) {
            if (!resolved.has(dep)) {
                toProcess.push(dep);
            }
        }
    }

    return Array.from(resolved);
}

export function getNpmDependencies(componentNames: string[]): string[] {
    const deps = new Set<string>();

    for (const name of componentNames) {
        const component = registry[name.toLowerCase()];
        if (component) {
            for (const dep of component.dependencies) {
                deps.add(dep);
            }
        }
    }

    return Array.from(deps);
}
