"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface AvatarContextValue {
    imageLoaded: boolean;
    setImageLoaded: (loaded: boolean) => void;
    imageError: boolean;
    setImageError: (error: boolean) => void;
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null);

function useAvatar() {
    const context = React.useContext(AvatarContext);
    if (!context) {
        throw new Error("Avatar components must be used within an Avatar");
    }
    return context;
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, children, ...props }, ref) => {
        const [imageLoaded, setImageLoaded] = React.useState(false);
        const [imageError, setImageError] = React.useState(false);

        return (
            <AvatarContext.Provider
                value={{ imageLoaded, setImageLoaded, imageError, setImageError }}
            >
                <div
                    ref={ref}
                    className={cn(
                        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </AvatarContext.Provider>
        );
    }
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
    ({ className, src, alt, onLoad, onError, ...props }, ref) => {
        const { setImageLoaded, setImageError, imageError } = useAvatar();

        const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
            setImageLoaded(true);
            onLoad?.(e);
        };

        const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
            setImageError(true);
            onError?.(e);
        };

        if (imageError) return null;

        return (
            <img
                ref={ref}
                src={src}
                alt={alt}
                className={cn(
                    "aspect-square h-full w-full object-cover",
                    "animate-fade-in",
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        );
    }
);
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
    delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
    ({ className, delayMs = 600, children, ...props }, ref) => {
        const { imageLoaded, imageError } = useAvatar();
        const [showFallback, setShowFallback] = React.useState(false);

        React.useEffect(() => {
            if (imageError) {
                setShowFallback(true);
                return;
            }

            if (!imageLoaded) {
                const timer = setTimeout(() => {
                    setShowFallback(true);
                }, delayMs);
                return () => clearTimeout(timer);
            }
        }, [imageLoaded, imageError, delayMs]);

        if (imageLoaded && !imageError) return null;
        if (!showFallback) return null;

        return (
            <div
                ref={ref}
                className={cn(
                    "flex h-full w-full items-center justify-center rounded-full bg-muted",
                    "animate-fade-in",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };

