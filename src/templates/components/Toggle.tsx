"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

const toggleVariants = {
    base: "relative inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-150 hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground overflow-hidden",

    variants: {
        variant: {
            default: "bg-transparent",
            outline:
                "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        },
        size: {
            default: "h-10 px-3",
            sm: "h-9 px-2.5",
            lg: "h-11 px-5",
        },
    },

    defaultVariants: {
        variant: "default" as const,
        size: "default" as const,
    },
};

type ToggleVariant = keyof typeof toggleVariants.variants.variant;
type ToggleSize = keyof typeof toggleVariants.variants.size;

export interface ToggleProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ToggleVariant;
    size?: ToggleSize;
    pressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
}

/**
 * Toggle Component
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
    (
        {
            className,
            variant,
            size,
            pressed = false,
            onPressedChange,
            children,
            onClick,
            ...props
        },
        ref
    ) => {
        const [isPressed, setIsPressed] = React.useState(pressed);
        const [ripples, setRipples] = React.useState<
            Array<{ x: number; y: number; id: number; size: number }>
        >([]);

        React.useEffect(() => {
            setIsPressed(pressed);
        }, [pressed]);

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = Date.now();
            const rippleSize = Math.max(rect.width, rect.height) * 2;

            setRipples((prev) => [...prev, { x, y, id, size: rippleSize }]);

            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== id));
            }, 500);

            const newPressed = !isPressed;
            setIsPressed(newPressed);
            onPressedChange?.(newPressed);
            onClick?.(e);
        };

        const { base, variants, defaultVariants } = toggleVariants;
        const selectedVariant = variant || defaultVariants.variant;
        const selectedSize = size || defaultVariants.size;

        return (
            <button
                ref={ref}
                type="button"
                aria-pressed={isPressed}
                data-state={isPressed ? "on" : "off"}
                className={cn(
                    base,
                    variants.variant[selectedVariant],
                    variants.size[selectedSize],
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                {ripples.map((ripple) => (
                    <span
                        key={ripple.id}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            left: ripple.x - ripple.size / 2,
                            top: ripple.y - ripple.size / 2,
                            width: ripple.size,
                            height: ripple.size,
                            background: "rgba(128, 128, 128, 0.3)",
                            transform: "scale(0)",
                            animation: "button-ripple 0.5s ease-out forwards",
                        }}
                    />
                ))}
                {children}
            </button>
        );
    }
);

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
