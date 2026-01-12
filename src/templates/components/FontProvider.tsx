"use client";

import * as React from "react";

interface FontConfig {
  style?: {
    fontFamily?: string;
  };
  variable?: string;
  className?: string;
}

interface FontContextValue {
  fontFamily?: string;
  setFontFamily: (font: string) => void;
  font?: FontConfig;
  monoFont?: FontConfig;
}

/**
 * Font configuration context
 */
const FontContext = React.createContext<FontContextValue>({
  fontFamily: undefined,
  setFontFamily: () => {},
});

export function useFont() {
  const context = React.useContext(FontContext);
  if (!context) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
}

interface FontProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  font?: FontConfig;
  monoFont?: FontConfig;
  variables?: Record<string, string>;
}

/**
 * FontProvider Component
 * 
 * Provides global font configuration for the entire application.
 * Wrap your app with this provider and pass in your Next.js font.
 * 
 * @example
 * // In layout.tsx
 * import { Inter } from 'next/font/google';
 * import { FontProvider } from '@/components/ui/FontProvider';
 * 
 * const inter = Inter({ subsets: ['latin'] });
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <FontProvider font={inter}>
 *           {children}
 *         </FontProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * 
 * @example
 * // Using multiple fonts
 * import { Inter, Roboto_Mono } from 'next/font/google';
 * 
 * const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
 * const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' });
 * 
 * <FontProvider 
 *   font={inter} 
 *   monoFont={robotoMono}
 *   variables={{ heading: 'var(--font-sans)', code: 'var(--font-mono)' }}
 * >
 *   {children}
 * </FontProvider>
 */
const FontProvider = React.forwardRef<HTMLDivElement, FontProviderProps>(
  ({ 
    children, 
    font,
    monoFont,
    className: additionalClassName,
    style: additionalStyle,
    variables = {},
    ...props 
  }, ref) => {
    const [fontFamily, setFontFamily] = React.useState(font?.style?.fontFamily);

    React.useEffect(() => {
      if (font?.style?.fontFamily) {
        setFontFamily(font.style.fontFamily);
      }
    }, [font]);

    const fontClasses = [
      font?.variable,
      font?.className,
      monoFont?.variable,
      monoFont?.className,
      additionalClassName,
    ].filter(Boolean).join(" ");

    const cssVariables: React.CSSProperties = {
      ...(font?.style?.fontFamily && { "--font-sans": font.style.fontFamily } as React.CSSProperties),
      ...(monoFont?.style?.fontFamily && { "--font-mono": monoFont.style.fontFamily } as React.CSSProperties),
      ...Object.entries(variables).reduce((acc, [key, value]) => {
        (acc as Record<string, string>)[`--font-${key}`] = value;
        return acc;
      }, {} as React.CSSProperties),
      ...additionalStyle,
    };

    return (
      <FontContext.Provider value={{ fontFamily, setFontFamily, font, monoFont }}>
        <div
          ref={ref}
          className={fontClasses}
          style={cssVariables}
          {...props}
        >
          {children}
        </div>
      </FontContext.Provider>
    );
  }
);

FontProvider.displayName = "FontProvider";

export { FontProvider, FontContext };
