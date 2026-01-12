"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

function getScrollbarWidth(): number {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll";
    document.body.appendChild(outer);

    const inner = document.createElement("div");
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);

    return scrollbarWidth;
}

interface SheetContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    side: "top" | "right" | "bottom" | "left";
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
    const context = React.useContext(SheetContext);
    if (!context) {
        throw new Error("Sheet components must be used within a Sheet");
    }
    return context;
}

interface SheetProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    side?: "top" | "right" | "bottom" | "left";
}

const Sheet: React.FC<SheetProps> = ({
    children,
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
    side = "right",
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = React.useCallback(
        (newOpen: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(newOpen);
            }
            onOpenChange?.(newOpen);
        },
        [isControlled, onOpenChange]
    );

    return (
        <SheetContext.Provider value={{ open, setOpen, side }}>
            {children}
        </SheetContext.Provider>
    );
};
Sheet.displayName = "Sheet";

interface SheetTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
    ({ children, asChild, onClick, ...props }, ref) => {
        const { setOpen } = useSheet();

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
            setOpen(true);
        };

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>, {
                onClick: handleClick,
            } as Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>);
        }

        return (
            <button ref={ref} onClick={handleClick} {...props}>
                {children}
            </button>
        );
    }
);
SheetTrigger.displayName = "SheetTrigger";

interface SheetPortalProps {
    children: React.ReactNode;
    container?: Element | null;
}

const SheetPortal: React.FC<SheetPortalProps> = ({ children, container }) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(children, container || document.body);
};
SheetPortal.displayName = "SheetPortal";

/**
 * Sheet Overlay
 */
const SheetOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/50",
            className
        )}
        {...props}
    />
));
SheetOverlay.displayName = "SheetOverlay";

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: "top" | "right" | "bottom" | "left";
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
    ({ className, children, side: propSide, ...props }, ref) => {
        const { open, setOpen, side: contextSide } = useSheet();
        const side = propSide || contextSide;
        const [isVisible, setIsVisible] = React.useState(false);
        const [isAnimating, setIsAnimating] = React.useState(false);

        React.useEffect(() => {
            let timer: ReturnType<typeof setTimeout>;

            if (open) {
                setIsAnimating(false);
                setIsVisible(true);
                timer = setTimeout(() => {
                    setIsAnimating(true);
                }, 50);
            } else if (isVisible) {
                setIsAnimating(false);
                timer = setTimeout(() => {
                    setIsVisible(false);
                }, 300);
            }

            return () => clearTimeout(timer);
        }, [open]);

        React.useEffect(() => {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape" && open) {
                    setOpen(false);
                }
            };
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }, [open, setOpen]);

        React.useEffect(() => {
            if (open) {
                const scrollbarWidth = getScrollbarWidth();
                const originalOverflow = document.body.style.overflow;
                const originalPaddingRight = document.body.style.paddingRight;

                document.body.style.overflow = "hidden";
                document.body.style.paddingRight = `${scrollbarWidth}px`;

                return () => {
                    document.body.style.overflow = originalOverflow;
                    document.body.style.paddingRight = originalPaddingRight;
                };
            }
        }, [open]);

        if (!isVisible) return null;

        const sideClasses = {
            top: "inset-x-0 top-0 border-b",
            bottom: "inset-x-0 bottom-0 border-t",
            left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
            right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
        };

        const getAnimationClass = (s: typeof side, animating: boolean) => {
            if (animating) {
                return "translate-x-0 translate-y-0";
            }
            switch (s) {
                case "top":
                    return "-translate-y-full";
                case "bottom":
                    return "translate-y-full";
                case "left":
                    return "-translate-x-full";
                case "right":
                    return "translate-x-full";
            }
        };

        return (
            <SheetPortal>
                <div
                    className={cn(
                        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-out",
                        isAnimating ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />

                <div
                    ref={ref}
                    className={cn(
                        "fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform duration-300 ease-out",
                        sideClasses[side],
                        getAnimationClass(side, isAnimating),
                        className
                    )}
                    {...props}
                >
                    {children}
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>
            </SheetPortal>
        );
    }
);
SheetContent.displayName = "SheetContent";

/**
 * Sheet Header
 */
const SheetHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
));
SheetHeader.displayName = "SheetHeader";

/**
 * Sheet Footer
 */
const SheetFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
));
SheetFooter.displayName = "SheetFooter";

/**
 * Sheet Title
 */
const SheetTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold text-foreground", className)}
        {...props}
    />
));
SheetTitle.displayName = "SheetTitle";

/**
 * Sheet Description
 */
const SheetDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
SheetDescription.displayName = "SheetDescription";

/**
 * Sheet Close
 */
const SheetClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const { setOpen } = useSheet();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        setOpen(false);
    };

    return (
        <button
            ref={ref}
            className={cn(className)}
            onClick={handleClick}
            {...props}
        />
    );
});
SheetClose.displayName = "SheetClose";

export {
    Sheet,
    SheetTrigger,
    SheetPortal,
    SheetOverlay,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
    SheetClose,
};
