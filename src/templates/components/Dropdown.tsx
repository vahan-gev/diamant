"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface DropdownContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue>({
    open: false,
    setOpen: () => { },
});

/**
 * Dropdown Component
 */
const Dropdown = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const mergedRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            dropdownRef.current = node;
            if (typeof ref === "function") {
                ref(node);
            } else if (ref) {
                (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
        },
        [ref]
    );

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <DropdownContext.Provider value={{ open, setOpen }}>
            <div
                ref={mergedRef}
                className={cn("relative inline-block", className)}
                {...props}
            >
                {children}
            </div>
        </DropdownContext.Provider>
    );
});
Dropdown.displayName = "Dropdown";

const DropdownTrigger = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DropdownContext);

    return (
        <div
            ref={ref}
            className={cn("cursor-pointer", className)}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownTrigger.displayName = "DropdownTrigger";

interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: "start" | "center" | "end";
}

const DropdownContent = React.forwardRef<HTMLDivElement, DropdownContentProps>(
    ({ className, align = "start", children, ...props }, ref) => {
        const { open } = React.useContext(DropdownContext);

        if (!open) return null;

        return (
            <div
                ref={ref}
                className={cn(
                    "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-fade-in",
                    align === "start" && "left-0",
                    align === "center" && "left-1/2 -translate-x-1/2",
                    align === "end" && "right-0",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
DropdownContent.displayName = "DropdownContent";

interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
}

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
    ({ className, disabled, children, ...props }, ref) => {
        const { setOpen } = React.useContext(DropdownContext);

        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    disabled && "pointer-events-none opacity-50",
                    className
                )}
                onClick={() => !disabled && setOpen(false)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
DropdownItem.displayName = "DropdownItem";

const DropdownSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-border", className)}
        {...props}
    />
));
DropdownSeparator.displayName = "DropdownSeparator";

const DropdownLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", className)}
        {...props}
    />
));
DropdownLabel.displayName = "DropdownLabel";

export {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownLabel,
};
