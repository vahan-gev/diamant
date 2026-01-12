"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

interface AlertDialogContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(
    null
);

function useAlertDialog() {
    const context = React.useContext(AlertDialogContext);
    if (!context) {
        throw new Error(
            "AlertDialog components must be used within an AlertDialog"
        );
    }
    return context;
}

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

export interface AlertDialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
    children,
    open: controlledOpen,
    onOpenChange,
    defaultOpen = false,
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
        <AlertDialogContext.Provider value={{ open, setOpen }}>
            {children}
        </AlertDialogContext.Provider>
    );
};
AlertDialog.displayName = "AlertDialog";

export interface AlertDialogTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

const AlertDialogTrigger = React.forwardRef<
    HTMLButtonElement,
    AlertDialogTriggerProps
>(({ children, asChild, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        setOpen(true);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(
            children as React.ReactElement<
                React.ButtonHTMLAttributes<HTMLButtonElement>
            >,
            {
                onClick: handleClick,
            } as Partial<React.ButtonHTMLAttributes<HTMLButtonElement>>
        );
    }

    return (
        <button ref={ref} onClick={handleClick} {...props}>
            {children}
        </button>
    );
});
AlertDialogTrigger.displayName = "AlertDialogTrigger";

interface AlertDialogPortalProps {
    children: React.ReactNode;
    container?: Element | null;
}

const AlertDialogPortal: React.FC<AlertDialogPortalProps> = ({
    children,
    container,
}) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(children, container || document.body);
};
AlertDialogPortal.displayName = "AlertDialogPortal";

/**
 * Alert Dialog Overlay
 */
const AlertDialogOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("fixed inset-0 z-50 bg-black/50", className)}
        {...props}
    />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

export interface AlertDialogContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
}

const AlertDialogContent = React.forwardRef<
    HTMLDivElement,
    AlertDialogContentProps
>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = useAlertDialog();
    const [isVisible, setIsVisible] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            setIsAnimating(false);
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 20);
            return () => clearTimeout(timer);
        } else if (isVisible) {
            setIsAnimating(false);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 150);
            return () => clearTimeout(timer);
        }
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

    return (
        <AlertDialogPortal>
            <div
                className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150"
                style={{ opacity: isAnimating ? 1 : 0 }}
                aria-hidden="true"
            />

            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="alertdialog"
                aria-modal="true"
                onClick={() => setOpen(false)}
            >
                <div
                    ref={ref}
                    className={cn(
                        "relative w-full max-w-lg",
                        "bg-background border border-border rounded-xl shadow-2xl",
                        "transition-all duration-150 ease-out",
                        className
                    )}
                    style={{
                        opacity: isAnimating ? 1 : 0,
                        transform: isAnimating
                            ? "scale(1) translateY(0)"
                            : "scale(0.95) translateY(8px)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                    {...props}
                >
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <div className="p-6">{children}</div>

                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>
            </div>
        </AlertDialogPortal>
    );
});
AlertDialogContent.displayName = "AlertDialogContent";

/**
 * Alert Dialog Header
 */
const AlertDialogHeader = React.forwardRef<
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
AlertDialogHeader.displayName = "AlertDialogHeader";

/**
 * Alert Dialog Footer
 */
const AlertDialogFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-6",
            "gap-2 sm:gap-0",
            className
        )}
        {...props}
    />
));
AlertDialogFooter.displayName = "AlertDialogFooter";

/**
 * Alert Dialog Title
 */
const AlertDialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-lg font-semibold tracking-tight text-foreground",
            className
        )}
        {...props}
    />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

/**
 * Alert Dialog Description
 */
const AlertDialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            "text-sm text-muted-foreground leading-relaxed",
            className
        )}
        {...props}
    />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

export interface AlertDialogActionProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive";
}

const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    AlertDialogActionProps
>(({ className, variant = "default", onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialog();
    const [ripples, setRipples] = React.useState<
        Array<{ x: number; y: number; id: number; size: number }>
    >([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        const rippleSize = Math.max(rect.width, rect.height) * 2;

        setRipples((prev) => [...prev, { x, y, id, size: rippleSize }]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 500);

        onClick?.(e);
        setOpen(false);
    };

    const variantStyles = {
        default:
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive:
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
    };

    return (
        <button
            ref={ref}
            className={cn(
                "relative inline-flex items-center justify-center rounded-lg px-4 py-2.5",
                "text-sm font-medium transition-all duration-200 overflow-hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                variantStyles[variant],
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: ripple.x - ripple.size / 2,
                        top: ripple.y - ripple.size / 2,
                        width: ripple.size,
                        height: ripple.size,
                        background: "rgba(255, 255, 255, 0.3)",
                        transform: "scale(0)",
                        animation: "button-ripple 0.5s ease-out forwards",
                    }}
                />
            ))}
            {props.children}
        </button>
    );
});
AlertDialogAction.displayName = "AlertDialogAction";

/**
 * Alert Dialog Cancel Button
 */
const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialog();
    const [ripples, setRipples] = React.useState<
        Array<{ x: number; y: number; id: number; size: number }>
    >([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        const rippleSize = Math.max(rect.width, rect.height) * 2;

        setRipples((prev) => [...prev, { x, y, id, size: rippleSize }]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 500);

        onClick?.(e);
        setOpen(false);
    };

    return (
        <button
            ref={ref}
            className={cn(
                "relative inline-flex items-center justify-center rounded-lg px-4 py-2.5",
                "text-sm font-medium transition-all duration-200 overflow-hidden",
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: ripple.x - ripple.size / 2,
                        top: ripple.y - ripple.size / 2,
                        width: ripple.size,
                        height: ripple.size,
                        background: "rgba(128, 128, 128, 0.3)",
                        transform: "scale(0)",
                        animation: "button-ripple 0.5s ease-out forwards",
                    }}
                />
            ))}
            {props.children}
        </button>
    );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};
