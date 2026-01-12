"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    value?: number[];
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    (
        {
            className,
            value: controlledValue,
            defaultValue = [0],
            min = 0,
            max = 100,
            step = 1,
            disabled,
            onValueChange,
            ...props
        },
        ref
    ) => {
        const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
        const trackRef = React.useRef<HTMLDivElement>(null);
        const [isDragging, setIsDragging] = React.useState(false);
        const [activeThumb, setActiveThumb] = React.useState<number | null>(null);

        const isControlled = controlledValue !== undefined;
        const value = isControlled ? controlledValue : uncontrolledValue;

        const getPercentage = (val: number) => {
            return ((val - min) / (max - min)) * 100;
        };


        const handleMouseDown = (e: React.MouseEvent, thumbIndex: number) => {
            if (disabled) return;
            e.preventDefault();
            setIsDragging(true);
            setActiveThumb(thumbIndex);
        };

        const getValueFromPositionMemo = React.useCallback(
            (clientX: number) => {
                if (!trackRef.current) return value[0];
                const rect = trackRef.current.getBoundingClientRect();
                const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                const rawValue = min + percentage * (max - min);
                const steppedValue = Math.round(rawValue / step) * step;
                return Math.max(min, Math.min(max, steppedValue));
            },
            [min, max, step, value]
        );

        const updateValueMemo = React.useCallback(
            (newVal: number, index: number) => {
                const newValue = [...value];
                newValue[index] = newVal;
                if (newValue.length > 1) {
                    newValue.sort((a, b) => a - b);
                }
                if (!isControlled) {
                    setUncontrolledValue(newValue);
                }
                onValueChange?.(newValue);
            },
            [value, isControlled, onValueChange]
        );

        const handleTrackClick = React.useCallback((e: React.MouseEvent) => {
            if (disabled) return;
            const newVal = getValueFromPositionMemo(e.clientX);
            
            let closestIndex = 0;
            let closestDistance = Math.abs(value[0] - newVal);
            
            value.forEach((v, i) => {
                const distance = Math.abs(v - newVal);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                }
            });

            updateValueMemo(newVal, closestIndex);
        }, [disabled, getValueFromPositionMemo, value, updateValueMemo]);

        React.useEffect(() => {
            const handleMouseMove = (e: MouseEvent) => {
                if (!isDragging || activeThumb === null) return;
                const newVal = getValueFromPositionMemo(e.clientX);
                updateValueMemo(newVal, activeThumb);
            };

            const handleMouseUp = () => {
                setIsDragging(false);
                setActiveThumb(null);
            };

            if (isDragging) {
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
                return () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                };
            }
        }, [isDragging, activeThumb, getValueFromPositionMemo, updateValueMemo]);

        const rangeStart = value.length > 1 ? getPercentage(value[0]) : 0;
        const rangeEnd = getPercentage(value[value.length - 1]);

        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex w-full touch-none select-none items-center",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                {...props}
            >
                <div
                    ref={trackRef}
                    className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary cursor-pointer"
                    onClick={handleTrackClick}
                >
                    <div
                        className="absolute h-full bg-primary transition-all duration-100"
                        style={{
                            left: `${rangeStart}%`,
                            width: `${rangeEnd - rangeStart}%`,
                        }}
                    />
                </div>

                {value.map((val, index) => (
                    <div
                        key={index}
                        className={cn(
                            "absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background",
                            "transition-all duration-100",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "cursor-grab active:cursor-grabbing",
                            isDragging && activeThumb === index && "scale-110 shadow-lg",
                            disabled && "cursor-not-allowed"
                        )}
                        style={{
                            left: `calc(${getPercentage(val)}% - 10px)`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                        tabIndex={disabled ? -1 : 0}
                        role="slider"
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={val}
                    />
                ))}
            </div>
        );
    }
);
Slider.displayName = "Slider";

export { Slider };

