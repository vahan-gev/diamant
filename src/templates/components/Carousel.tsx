"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface CarouselContextValue {
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    itemCount: number;
    setItemCount: React.Dispatch<React.SetStateAction<number>>;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    scrollPrev: () => void;
    scrollNext: () => void;
}

const CarouselContext = React.createContext<CarouselContextValue>({
    currentIndex: 0,
    setCurrentIndex: () => {},
    itemCount: 0,
    setItemCount: () => {},
    canScrollPrev: false,
    canScrollNext: false,
    scrollPrev: () => {},
    scrollNext: () => {},
});

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
    autoPlay?: boolean;
    interval?: number;
}

/**
 * Carousel Component
 */
const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
    (
        { className, children, autoPlay = false, interval = 5000, ...props },
        ref
    ) => {
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [itemCount, setItemCount] = React.useState(0);

        const canScrollPrev = currentIndex > 0;
        const canScrollNext = currentIndex < itemCount - 1;

        const scrollPrev = React.useCallback(() => {
            if (canScrollPrev) {
                setCurrentIndex((prev) => prev - 1);
            }
        }, [canScrollPrev]);

        const scrollNext = React.useCallback(() => {
            if (canScrollNext) {
                setCurrentIndex((prev) => prev + 1);
            } else if (autoPlay) {
                setCurrentIndex(0);
            }
        }, [canScrollNext, autoPlay]);

        const [touchStart, setTouchStart] = React.useState<number | null>(null);
        const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

        const minSwipeDistance = 50;

        const onTouchStart = (e: React.TouchEvent) => {
            setTouchEnd(null);
            setTouchStart(e.targetTouches[0].clientX);
        };

        const onTouchMove = (e: React.TouchEvent) => {
            setTouchEnd(e.targetTouches[0].clientX);
        };

        const onTouchEnd = () => {
            if (!touchStart || !touchEnd) return;
            const distance = touchStart - touchEnd;
            const isLeftSwipe = distance > minSwipeDistance;
            const isRightSwipe = distance < -minSwipeDistance;

            if (isLeftSwipe && canScrollNext) {
                scrollNext();
            } else if (isRightSwipe && canScrollPrev) {
                scrollPrev();
            }
        };

        React.useEffect(() => {
            if (!autoPlay) return;
            const timer = setInterval(scrollNext, interval);
            return () => clearInterval(timer);
        }, [autoPlay, interval, scrollNext]);

        return (
            <CarouselContext.Provider
                value={{
                    currentIndex,
                    setCurrentIndex,
                    itemCount,
                    setItemCount,
                    canScrollPrev,
                    canScrollNext,
                    scrollPrev,
                    scrollNext,
                }}
            >
                <div
                    ref={ref}
                    className={cn("relative group", className)}
                    role="region"
                    aria-roledescription="carousel"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    {...props}
                >
                    {children}
                </div>
            </CarouselContext.Provider>
        );
    }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { currentIndex, setItemCount } = React.useContext(CarouselContext);
    const childrenArray = React.Children.toArray(children);

    React.useEffect(() => {
        setItemCount(childrenArray.length);
    }, [childrenArray.length, setItemCount]);

    return (
        <div ref={ref} className={cn("overflow-hidden", className)} {...props}>
            <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {children}
            </div>
        </div>
    );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            role="group"
            aria-roledescription="slide"
            className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
            {...props}
        >
            {children}
        </div>
    );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    const { canScrollPrev, scrollPrev } = React.useContext(CarouselContext);

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm shadow-sm transition-all hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
                "touch-manipulation",
                className
            )}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            aria-label="Previous slide"
            {...props}
        >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
    );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    const { canScrollNext, scrollNext } = React.useContext(CarouselContext);

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm shadow-sm transition-all hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
                "touch-manipulation",
                className
            )}
            disabled={!canScrollNext}
            onClick={scrollNext}
            aria-label="Next slide"
            {...props}
        >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
    );
});
CarouselNext.displayName = "CarouselNext";

const CarouselDots = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { currentIndex, setCurrentIndex, itemCount } =
        React.useContext(CarouselContext);

    return (
        <div
            ref={ref}
            className={cn("flex justify-center gap-2 mt-4", className)}
            {...props}
        >
            {Array.from({ length: itemCount }).map((_, index) => (
                <button
                    key={index}
                    type="button"
                    className={cn(
                        "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full transition-colors touch-manipulation",
                        currentIndex === index
                            ? "bg-primary"
                            : "bg-muted hover:bg-muted-foreground/50"
                    )}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
    );
});
CarouselDots.displayName = "CarouselDots";

export {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    CarouselDots,
};
