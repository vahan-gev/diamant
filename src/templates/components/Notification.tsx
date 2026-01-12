"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

type NotificationVariant = "default" | "success" | "warning" | "destructive";

type NotificationPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

export interface NotificationProps {
    children?: React.ReactNode;
    title?: string;
    trigger: React.ReactNode;
    position?: NotificationPosition;
    variant?: NotificationVariant;
    className?: string;
    duration?: number;
}

const variantStyles: Record<NotificationVariant, { bg: string; border: string; icon: React.ReactNode; text: string }> = {
    default: {
        bg: "bg-background",
        border: "border-border",
        icon: <Info className="h-5 w-5 text-primary" />,
        text: "text-foreground",
    },
    success: {
        bg: "bg-background",
        border: "border-success/50 dark:border-success",
        icon: <CheckCircle className="h-5 w-5 text-success" />,
        text: "text-success",
    },
    warning: {
        bg: "bg-background",
        border: "border-warning/50 dark:border-warning",
        icon: <AlertTriangle className="h-5 w-5 text-warning" />,
        text: "text-warning",
    },
    destructive: {
        bg: "bg-background",
        border: "border-destructive/50 dark:border-destructive",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
        text: "text-destructive",
    },
};

const positionStyles: Record<NotificationPosition, string> = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
};

const animationStyles: Record<NotificationPosition, { hidden: string; visible: string }> = {
    "top-left": { hidden: "-translate-x-full opacity-0", visible: "translate-x-0 opacity-100" },
    "top-right": { hidden: "translate-x-full opacity-0", visible: "translate-x-0 opacity-100" },
    "bottom-left": { hidden: "-translate-x-full opacity-0", visible: "translate-x-0 opacity-100" },
    "bottom-right": { hidden: "translate-x-full opacity-0", visible: "translate-x-0 opacity-100" },
};

const Notification = ({
    children,
    title,
    trigger,
    position = "top-right",
    variant = "default",
    className,
    duration,
}: NotificationProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setIsAnimating(true));
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen && duration && duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration]);

    const toggleOpen = () => setIsOpen(!isOpen);
    const handleClose = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsAnimating(false);
        setTimeout(() => setIsOpen(false), 300);
    };

    const styles = variantStyles[variant];
    const posClass = positionStyles[position];
    const animClass = isAnimating ? animationStyles[position].visible : animationStyles[position].hidden;

    const notificationContent = (
        <div
            className={cn(
                "fixed z-50 w-[400px] min-w-[320px] max-w-[600px] transition-all duration-300 ease-out",
                posClass,
                animClass
            )}
        >
            <div
                className={cn(
                    "relative w-full rounded-lg border p-4 shadow-lg",
                    styles.bg,
                    styles.border,
                    className
                )}
            >
                <button
                    onClick={handleClose}
                    className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground/60 transition-all hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                        {styles.icon}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                        {title && (
                            <div className={cn(
                                "font-medium leading-none tracking-tight truncate",
                                styles.text
                            )}>
                                {title}
                            </div>
                        )}
                        {children && (
                            <div className="mt-1 text-sm text-muted-foreground truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div onClick={toggleOpen} className="inline-block cursor-pointer">
                {trigger}
            </div>
            {isMounted && isOpen && createPortal(notificationContent, document.body)}
        </>
    );
};

export { Notification };
