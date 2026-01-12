"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Check, ChevronDown } from "lucide-react";

interface SelectContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: string;
    displayValue: string;
    onValueChange: (value: string, displayValue: string) => void;
    contentId: string;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelect() {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error("Select components must be used within a Select");
    }
    return context;
}

interface SelectProps {
    children: React.ReactNode;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const Select: React.FC<SelectProps> = ({
    children,
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    open: controlledOpen,
    onOpenChange,
}) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const [displayValue, setDisplayValue] = React.useState("");
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);
    const contentId = React.useId();

    const isValueControlled = controlledValue !== undefined;
    const value = isValueControlled ? controlledValue : uncontrolledValue;

    const isOpenControlled = controlledOpen !== undefined;
    const open = isOpenControlled ? controlledOpen : uncontrolledOpen;

    const handleValueChange = React.useCallback(
        (newValue: string, newDisplayValue: string) => {
            if (!isValueControlled) {
                setUncontrolledValue(newValue);
            }
            setDisplayValue(newDisplayValue);
            onValueChange?.(newValue);
        },
        [isValueControlled, onValueChange]
    );

    const setOpen = React.useCallback(
        (newOpen: boolean) => {
            if (!isOpenControlled) {
                setUncontrolledOpen(newOpen);
            }
            onOpenChange?.(newOpen);
        },
        [isOpenControlled, onOpenChange]
    );

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [open, setOpen]);

    return (
        <SelectContext.Provider
            value={{
                open,
                setOpen,
                value,
                displayValue,
                onValueChange: handleValueChange,
                contentId,
            }}
        >
            <div ref={selectRef} className="relative inline-block w-full">
                {children}
            </div>
        </SelectContext.Provider>
    );
};
Select.displayName = "Select";

interface SelectTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, onClick, ...props }, ref) => {
        const { open, setOpen, contentId } = useSelect();

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
            setOpen(!open);
        };

        return (
            <button
                ref={ref}
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-controls={contentId}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input",
                    "bg-background px-3 py-2 text-sm ring-offset-background",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-all duration-150",
                    "[&>span]:line-clamp-1",
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                {children}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 opacity-50 transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>
        );
    }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
    placeholder?: string;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
    ({ className, placeholder, ...props }, ref) => {
        const { displayValue } = useSelect();

        return (
            <span
                ref={ref}
                className={cn(
                    displayValue ? "text-foreground" : "text-muted-foreground",
                    className
                )}
                {...props}
            >
                {displayValue || placeholder}
            </span>
        );
    }
);
SelectValue.displayName = "SelectValue";

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
    position?: "popper" | "item-aligned";
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open, contentId } = useSelect();

        if (!open) return null;

        return (
            <div
                ref={ref}
                id={contentId}
                className={cn(
                    "absolute z-50 mt-2 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-fade-in",
                    className
                )}
                {...props}
            >
                <div className="p-1">{children}</div>
            </div>
        );
    }
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({ className, children, value, disabled, onClick, ...props }, ref) => {
        const { value: selectedValue, onValueChange, setOpen } = useSelect();
        const isSelected = selectedValue === value;

        const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (disabled) return;
            onClick?.(e);
            const displayText =
                typeof children === "string"
                    ? children
                    : (e.currentTarget.textContent || value);
            onValueChange(value, displayText);
            setOpen(false);
        };

        return (
            <div
                ref={ref}
                role="option"
                aria-selected={isSelected}
                data-disabled={disabled}
                className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                    "transition-colors duration-100",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground",
                    disabled && "pointer-events-none opacity-50",
                    isSelected && "bg-accent/50",
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4" />}
                </span>
                {children}
            </div>
        );
    }
);
SelectItem.displayName = "SelectItem";

/**
 * Select Label
 */
const SelectLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
        {...props}
    />
));
SelectLabel.displayName = "SelectLabel";

/**
 * Select Separator
 */
const SelectSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props}
    />
));
SelectSeparator.displayName = "SelectSeparator";

/**
 * Select Group
 */
const SelectGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-1", className)} {...props} />
));
SelectGroup.displayName = "SelectGroup";

export {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectGroup,
};
