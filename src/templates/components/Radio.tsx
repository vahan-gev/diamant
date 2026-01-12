"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface RadioGroupContextValue {
    value: string;
    onValueChange: (value: string) => void;
    name: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
    null
);

function useRadioGroup() {
    const context = React.useContext(RadioGroupContext);
    if (!context) {
        throw new Error("RadioGroupItem must be used within a RadioGroup");
    }
    return context;
}

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    (
        {
            className,
            value: controlledValue,
            defaultValue = "",
            onValueChange,
            name: providedName,
            children,
            ...props
        },
        ref
    ) => {
        const generatedId = React.useId();
        const name = providedName || `radio-group-${generatedId}`;
        const [uncontrolledValue, setUncontrolledValue] =
            React.useState(defaultValue);

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
            <RadioGroupContext.Provider
                value={{ value, onValueChange: handleValueChange, name }}
            >
                <div
                    ref={ref}
                    role="radiogroup"
                    className={cn("grid gap-2", className)}
                    {...props}
                >
                    {children}
                </div>
            </RadioGroupContext.Provider>
        );
    }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({ className, value, disabled, ...props }, ref) => {
        const { value: groupValue, onValueChange, name } = useRadioGroup();
        const isChecked = groupValue === value;
        const [isAnimating, setIsAnimating] = React.useState(false);

        const handleChange = () => {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 200);
            onValueChange(value);
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
                    type="radio"
                    ref={ref}
                    name={name}
                    value={value}
                    checked={isChecked}
                    disabled={disabled}
                    onChange={handleChange}
                    className="sr-only peer"
                    {...props}
                />
                <div
                    className={cn(
                        "flex items-center justify-center h-4 w-4 rounded-full border border-primary text-primary ring-offset-background",
                        "transition-all duration-200",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                        isAnimating && "scale-110",
                        className
                    )}
                >
                    <div
                        className={cn(
                            "h-2 w-2 rounded-full bg-primary",
                            "transition-all duration-200",
                            isChecked
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-0"
                        )}
                    />
                </div>
            </label>
        );
    }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
