import * as React from "react";
import { cn } from "../../lib/utils";

const alertVariants = {
    base: "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",

    variants: {
        variant: {
            default: "bg-background text-foreground",
            destructive:
                "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
            success:
                "border-success/50 text-success dark:border-success [&>svg]:text-success",
            warning:
                "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
        },
    },

    defaultVariants: {
        variant: "default" as const,
    },
};

type AlertVariant = keyof typeof alertVariants.variants.variant;

function getAlertClasses(variant?: AlertVariant) {
    const { base, variants, defaultVariants } = alertVariants;
    const selectedVariant = variant || defaultVariants.variant;

    return cn(base, variants.variant[selectedVariant]);
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
}

/**
 * Alert Component
 *
 * A component for displaying important messages or notifications.
 *
 * @example
 * <Alert>
 *   <AlertTitle>Heads up!</AlertTitle>
 *   <AlertDescription>
 *     You can add components to your app using the cli.
 *   </AlertDescription>
 * </Alert>
 *
 * <Alert variant="destructive">
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>Something went wrong.</AlertDescription>
 * </Alert>
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            role="alert"
            className={cn(getAlertClasses(variant), className)}
            {...props}
        />
    )
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn(
            "mb-1 font-medium leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed", className)}
        {...props}
    />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
