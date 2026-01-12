import * as React from "react";
import { cn } from "../../lib/utils";

const inputVariants = {
    base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",

    variants: {
        variant: {
            default: "",
            error: "border-destructive focus-visible:ring-destructive",
            success: "border-success focus-visible:ring-success",
        },
        inputSize: {
            default: "h-10",
            sm: "h-8 text-xs",
            lg: "h-12 text-base",
        },
    },

    defaultVariants: {
        variant: "default" as const,
        inputSize: "default" as const,
    },
};

type InputVariant = keyof typeof inputVariants.variants.variant;
type InputSize = keyof typeof inputVariants.variants.inputSize;

function getInputClasses(variant?: InputVariant, inputSize?: InputSize) {
    const { base, variants, defaultVariants } = inputVariants;
    const selectedVariant = variant || defaultVariants.variant;
    const selectedSize = inputSize || defaultVariants.inputSize;

    return cn(
        base,
        variants.variant[selectedVariant],
        variants.inputSize[selectedSize]
    );
}

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: InputVariant;
    inputSize?: InputSize;
}

/**
 * Input Component
 *
 * A styled input field with variants for different states.
 *
 * @example
 * <Input type="email" placeholder="Email" />
 * <Input variant="error" placeholder="Invalid input" />
 * <Input inputSize="lg" placeholder="Large input" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, variant, inputSize, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(getInputClasses(variant, inputSize), className)}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export { Input, inputVariants };
