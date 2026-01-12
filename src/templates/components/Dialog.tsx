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

interface DialogContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog() {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error("Dialog components must be used within a Dialog");
    }
    return context;
}

interface DialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
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
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
};
Dialog.displayName = "Dialog";

interface DialogTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
    ({ children, asChild, onClick, ...props }, ref) => {
        const { setOpen } = useDialog();

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
DialogTrigger.displayName = "DialogTrigger";

interface DialogPortalProps {
    children: React.ReactNode;
    container?: Element | null;
}

const DialogPortal: React.FC<DialogPortalProps> = ({ children, container }) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(children, container || document.body);
};
DialogPortal.displayName = "DialogPortal";

const DialogOverlay = React.forwardRef<
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
DialogOverlay.displayName = "DialogOverlay";

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    showCloseButton?: boolean;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, showCloseButton = true, ...props }, ref) => {
        const { open, setOpen } = useDialog();
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
            <DialogPortal>
                <div
                    className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150"
                    style={{ opacity: isAnimating ? 1 : 0 }}
                    aria-hidden="true"
                />

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setOpen(false)}
                >
                    <div
                        ref={ref}
                        className={cn(
                            "relative w-full max-w-lg max-h-[85vh] overflow-auto",
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

                        {showCloseButton && (
                            <button
                                onClick={() => setOpen(false)}
                                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        )}

                        <div className="p-6">{children}</div>

                        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                    </div>
                </div>
            </DialogPortal>
        );
    }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
));
DialogHeader.displayName = "DialogHeader";

/**
 * Dialog Footer
 */
const DialogFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
            className
        )}
        {...props}
    />
));
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

const DialogClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const { setOpen } = useDialog();

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
DialogClose.displayName = "DialogClose";

export {
    Dialog,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
};
