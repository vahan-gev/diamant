"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

interface TooltipContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltip() {
    const context = React.useContext(TooltipContext);
    if (!context) {
        throw new Error("Tooltip components must be used within a Tooltip");
    }
    return context;
}

interface TooltipProviderProps {
    children: React.ReactNode;
    delayDuration?: number;
}

const TooltipProvider: React.FC<TooltipProviderProps> = ({
    children,
}) => {
    return <>{children}</>;
};
TooltipProvider.displayName = "TooltipProvider";

interface TooltipProps {
    children: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    delayDuration?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
    children,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    delayDuration = 300,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const triggerRef = React.useRef<HTMLElement | null>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = React.useCallback(
        (newOpen: boolean) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (newOpen) {
                timeoutRef.current = setTimeout(() => {
                    if (!isControlled) {
                        setUncontrolledOpen(true);
                    }
                    onOpenChange?.(true);
                }, delayDuration);
            } else {
                if (!isControlled) {
                    setUncontrolledOpen(false);
                }
                onOpenChange?.(false);
            }
        },
        [isControlled, onOpenChange, delayDuration]
    );

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <TooltipContext.Provider value={{ open, setOpen, triggerRef }}>
            {children}
        </TooltipContext.Provider>
    );
};
Tooltip.displayName = "Tooltip";

interface TooltipTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
    ({ children, asChild }, ref) => {
        const { setOpen, triggerRef } = useTooltip();
        const localRef = React.useRef<HTMLElement | null>(null);

        const setRefs = React.useCallback(
            (node: HTMLElement | null) => {
                localRef.current = node;
                triggerRef.current = node;
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            },
            [ref, triggerRef]
        );

        const handleMouseEnter = () => setOpen(true);
        const handleMouseLeave = () => setOpen(false);

        React.useEffect(() => {
            if (asChild && localRef.current) {
                triggerRef.current = localRef.current;
            }
        }, [asChild, triggerRef]);

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                ref: setRefs,
            } as Partial<React.HTMLAttributes<HTMLElement>>);
        }

        return (
            <span
                ref={setRefs as React.Ref<HTMLSpanElement>}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </span>
        );
    }
);
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: "top" | "right" | "bottom" | "left";
    sideOffset?: number;
    align?: "start" | "center" | "end";
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
    (
        {
            className,
            side = "top",
            sideOffset = 8,
            align = "center",
            children,
            ...props
        },
        ref
    ) => {
        const { open, triggerRef } = useTooltip();
        const [position, setPosition] = React.useState({ top: 0, left: 0 });
        const [mounted, setMounted] = React.useState(false);
        const contentRef = React.useRef<HTMLDivElement | null>(null);

        React.useEffect(() => {
            setMounted(true);
        }, []);

        React.useEffect(() => {
            if (open && triggerRef.current && contentRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const contentRect = contentRef.current.getBoundingClientRect();

                let top = 0;
                let left = 0;

                switch (side) {
                    case "top":
                        top = triggerRect.top - contentRect.height - sideOffset;
                        left =
                            triggerRect.left +
                            triggerRect.width / 2 -
                            contentRect.width / 2;
                        break;
                    case "bottom":
                        top = triggerRect.bottom + sideOffset;
                        left =
                            triggerRect.left +
                            triggerRect.width / 2 -
                            contentRect.width / 2;
                        break;
                    case "left":
                        top =
                            triggerRect.top +
                            triggerRect.height / 2 -
                            contentRect.height / 2;
                        left = triggerRect.left - contentRect.width - sideOffset;
                        break;
                    case "right":
                        top =
                            triggerRect.top +
                            triggerRect.height / 2 -
                            contentRect.height / 2;
                        left = triggerRect.right + sideOffset;
                        break;
                }

                if (side === "top" || side === "bottom") {
                    if (align === "start") {
                        left = triggerRect.left;
                    } else if (align === "end") {
                        left = triggerRect.right - contentRect.width;
                    }
                }

                setPosition({ top, left });
            }
        }, [open, side, sideOffset, align, triggerRef]);

        if (!mounted || !open) return null;

        return createPortal(
            <div
                ref={(node) => {
                    contentRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                className={cn(
                    "z-[100] fixed px-3 py-1.5 text-sm text-popover-foreground",
                    "bg-popover border border-border rounded-md shadow-md",
                    "animate-fade-in",
                    className
                )}
                style={{
                    top: position.top,
                    left: position.left,
                }}
                {...props}
            >
                {children}
            </div>,
            document.body
        );
    }
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
