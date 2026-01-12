"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface TabsContextValue {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used within a Tabs");
    }
    return context;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    (
        { className, value: controlledValue, defaultValue, onValueChange, children, ...props },
        ref
    ) => {
        const [uncontrolledValue, setUncontrolledValue] = React.useState(
            defaultValue || ""
        );

        const isControlled = controlledValue !== undefined;
        const value = isControlled ? controlledValue : uncontrolledValue;

        const handleValueChange = React.useCallback(
            (newValue: string) => {
                if (!isControlled) {
                    setUncontrolledValue(newValue);
                }
                onValueChange?.(newValue);
            },
            [isControlled, onValueChange]
        );

        return (
            <TabsContext.Provider
                value={{ value, onValueChange: handleValueChange }}
            >
                <div ref={ref} className={cn("w-full", className)} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        );
    }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
            className
        )}
        role="tablist"
        {...props}
    />
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, onClick, ...props }, ref) => {
        const { value: selectedValue, onValueChange } = useTabs();
        const isActive = selectedValue === value;
        const [ripples, setRipples] = React.useState<
            Array<{ x: number; y: number; id: number }>
        >([]);

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = Date.now();
            setRipples((prev) => [...prev, { x, y, id }]);
            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== id));
            }, 600);

            onClick?.(e);
            onValueChange(value);
        };

        return (
            <button
                ref={ref}
                role="tab"
                aria-selected={isActive}
                data-state={isActive ? "active" : "inactive"}
                className={cn(
                    "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5",
                    "text-sm font-medium ring-offset-background transition-all duration-200 overflow-hidden",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "active:scale-[0.98] transform",
                    isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "hover:bg-background/50 hover:text-foreground",
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                {ripples.map((ripple) => (
                    <span
                        key={ripple.id}
                        className="absolute rounded-full bg-foreground/20 pointer-events-none animate-ripple"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: 10,
                            height: 10,
                            marginLeft: -5,
                            marginTop: -5,
                        }}
                    />
                ))}
                {props.children}
            </button>
        );
    }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, ...props }, ref) => {
        const { value: selectedValue } = useTabs();
        const isActive = selectedValue === value;

        if (!isActive) return null;

        return (
            <div
                ref={ref}
                role="tabpanel"
                data-state={isActive ? "active" : "inactive"}
                className={cn(
                    "mt-2 ring-offset-background",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "animate-fade-in",
                    className
                )}
                {...props}
            />
        );
    }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };

