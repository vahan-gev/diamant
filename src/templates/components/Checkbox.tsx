"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            className,
            checked: controlledChecked,
            defaultChecked,
            onCheckedChange,
            disabled,
            ...props
        },
        ref
    ) => {
        const [uncontrolledChecked, setUncontrolledChecked] = React.useState(
            defaultChecked || false
        );
        const [isAnimating, setIsAnimating] = React.useState(false);

        const isControlled = controlledChecked !== undefined;
        const checked = isControlled ? controlledChecked : uncontrolledChecked;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newChecked = e.target.checked;
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 200);

            if (!isControlled) {
                setUncontrolledChecked(newChecked);
            }
            onCheckedChange?.(newChecked);
        };

        return (
            <label
                className={cn(
                    "relative inline-flex items-center",
                    disabled && "cursor-not-allowed opacity-50",
                    !disabled && "cursor-pointer"
                )}
            >
                <input
                    type="checkbox"
                    ref={ref}
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                    className="sr-only peer"
                    {...props}
                />
                <div
                    className={cn(
                        "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
                        "transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                        checked
                            ? "bg-primary text-primary-foreground"
                            : "bg-background",
                        isAnimating && "scale-110",
                        className
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center justify-center text-current",
                            "transition-all duration-200",
                            checked
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-50"
                        )}
                    >
                        <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                </div>
            </label>
        );
    }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

