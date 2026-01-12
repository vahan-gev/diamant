"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface SwitchProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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

        const isControlled = controlledChecked !== undefined;
        const checked = isControlled ? controlledChecked : uncontrolledChecked;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newChecked = e.target.checked;
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
                    role="switch"
                    aria-checked={checked}
                    {...props}
                />
                <div
                    className={cn(
                        "h-6 w-11 shrink-0 rounded-full border-2 border-transparent ring-offset-background",
                        "transition-colors duration-200",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-[ring] peer-focus-visible:ring-offset-2",
                        "bg-input",
                        className
                    )}
                >
                    <div
                        className={cn(
                            "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0",
                            "transition-all duration-200 ease-out",
                            checked ? "bg-primary" : "bg-background",
                            checked ? "translate-x-5" : "translate-x-0"
                        )}
                    />
                </div>
            </label>
        );
    }
);
Switch.displayName = "Switch";

export { Switch };

