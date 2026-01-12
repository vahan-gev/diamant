"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
    base: "relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden cursor-pointer",

    variants: {
        variant: {
            default:
                "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
            destructive:
                "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
            outline:
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
            secondary:
                "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        },
    },

    defaultVariants: {
        variant: "default" as const,
        size: "default" as const,
    },
};

type ButtonVariant = keyof typeof buttonVariants.variants.variant;
type ButtonSize = keyof typeof buttonVariants.variants.size;

function getButtonClasses(variant?: ButtonVariant, size?: ButtonSize) {
    const { base, variants, defaultVariants } = buttonVariants;
    const selectedVariant = variant || defaultVariants.variant;
    const selectedSize = size || defaultVariants.size;

    return cn(
        base,
        variants.variant[selectedVariant],
        variants.size[selectedSize]
    );
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
}

/**
 * Button Component
 *
 * A customizable button with multiple variants and sizes.
 * Features Android-style click ripple effect.
 *
 * @example
 * <Button variant="default" size="default">Click me</Button>
 * <Button variant="destructive">Delete</Button>
 * <Button variant="outline" size="sm">Small Outline</Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, onClick, ...props }, ref) => {
        const [ripples, setRipples] = React.useState<
            Array<{ x: number; y: number; id: number; size: number }>
        >([]);

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

            onClick?.(e);
        };

        return (
            <button
                className={cn(getButtonClasses(variant, size), className)}
                ref={ref}
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
                {props.children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
