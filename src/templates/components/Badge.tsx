import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
    base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",

    variants: {
        variant: {
            default:
                "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary:
                "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive:
                "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            success:
                "border-transparent bg-success text-success-foreground hover:bg-success/80",
            warning:
                "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
            outline: "text-foreground",
        },
    },

    defaultVariants: {
        variant: "default" as const,
    },
};

type BadgeVariant = keyof typeof badgeVariants.variants.variant;

function getBadgeClasses(variant?: BadgeVariant) {
    const { base, variants, defaultVariants } = badgeVariants;
    const selectedVariant = variant || defaultVariants.variant;

    return cn(base, variants.variant[selectedVariant]);
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
}

/**
 * Badge Component
 *
 * A small status indicator or label.
 *
 * @example
 * <Badge>Default</Badge>
 * <Badge variant="secondary">Secondary</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="success">Success</Badge>
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(getBadgeClasses(variant), className)}
                {...props}
            />
        );
    }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
