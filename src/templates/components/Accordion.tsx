"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface AccordionContextValue {
    value: string[];
    onValueChange: (value: string) => void;
    type: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue>({
    value: [],
    onValueChange: () => {},
    type: "single",
});

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: "single" | "multiple";
    defaultValue?: string | string[];
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
    ({ className, type = "single", defaultValue, children, ...props }, ref) => {
        const [value, setValue] = React.useState<string[]>(
            type === "single"
                ? defaultValue
                    ? [defaultValue as string]
                    : []
                : (defaultValue as string[]) || []
        );

        const onValueChange = (itemValue: string) => {
            if (type === "single") {
                setValue(value.includes(itemValue) ? [] : [itemValue]);
            } else {
                setValue(
                    value.includes(itemValue)
                        ? value.filter((v) => v !== itemValue)
                        : [...value, itemValue]
                );
            }
        };

        return (
            <AccordionContext.Provider value={{ value, onValueChange, type }}>
                <div
                    ref={ref}
                    className={cn("space-y-1", className)}
                    {...props}
                >
                    {children}
                </div>
            </AccordionContext.Provider>
        );
    }
);
Accordion.displayName = "Accordion";

const AccordionItemContext = React.createContext<{ value: string }>({
    value: "",
});

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ className, value, children, ...props }, ref) => {
        return (
            <AccordionItemContext.Provider value={{ value }}>
                <div ref={ref} className={cn("border-b", className)} {...props}>
                    {children}
                </div>
            </AccordionItemContext.Provider>
        );
    }
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { value, onValueChange } = React.useContext(AccordionContext);
    const { value: itemValue } = React.useContext(AccordionItemContext);
    const isOpen = value.includes(itemValue);

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "flex flex-1 w-full items-center justify-between py-4 font-medium transition-all hover:underline",
                className
            )}
            onClick={() => onValueChange(itemValue)}
            aria-expanded={isOpen}
            {...props}
        >
            {children}
            <ChevronDown
                className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                )}
            />
        </button>
    );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { value } = React.useContext(AccordionContext);
    const { value: itemValue } = React.useContext(AccordionItemContext);
    const isOpen = value.includes(itemValue);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [height, setHeight] = React.useState<number | undefined>(undefined);

    React.useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [children]);

    return (
        <div
            ref={ref}
            className={cn(
                "overflow-hidden transition-all duration-200 ease-in-out",
                className
            )}
            style={{
                height: isOpen ? height : 0,
                opacity: isOpen ? 1 : 0,
            }}
            {...props}
        >
            <div ref={contentRef} className="pb-4 pt-0">
                {children}
            </div>
        </div>
    );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
