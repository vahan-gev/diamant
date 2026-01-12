"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

const progressVariants = {
    base: "relative h-4 w-full overflow-hidden rounded-full bg-secondary",

    variants: {
        variant: {
            default: "",
            success: "",
            warning: "",
            destructive: "",
        },
        size: {
            default: "h-4",
            sm: "h-2",
            lg: "h-6",
        },
    },

    indicatorVariants: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        destructive: "bg-destructive",
    },

    defaultVariants: {
        variant: "default" as const,
        size: "default" as const,
    },
};

type ProgressVariant = keyof typeof progressVariants.variants.variant;
type ProgressSize = keyof typeof progressVariants.variants.size;

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    variant?: ProgressVariant;
    size?: ProgressSize;
    showValue?: boolean;
}

/**
 * Progress Component
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    (
        { className, value = 0, variant, size, showValue = false, ...props },
        ref
    ) => {
        const { base, variants, indicatorVariants, defaultVariants } =
            progressVariants;
        const selectedVariant = variant || defaultVariants.variant;
        const selectedSize = size || defaultVariants.size;
        const clampedValue = Math.min(100, Math.max(0, value));

        return (
            <div className="w-full">
                <div
                    ref={ref}
                    className={cn(base, variants.size[selectedSize], className)}
                    role="progressbar"
                    aria-valuenow={clampedValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    {...props}
                >
                    <div
                        className={cn(
                            "h-full w-full flex-1 transition-all duration-300 ease-in-out",
                            indicatorVariants[selectedVariant]
                        )}
                        style={{
                            transform: `translateX(-${100 - clampedValue}%)`,
                        }}
                    />
                </div>
                {showValue && (
                    <div className="mt-1 text-sm text-muted-foreground text-right">
                        {clampedValue}%
                    </div>
                )}
            </div>
        );
    }
);

Progress.displayName = "Progress";

export { Progress, progressVariants };
