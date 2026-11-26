interface SaudiRiyalSymbolProps {
  className?: string;
}

/**
 * Renders the official Saudi Riyal symbol using the uploaded asset as a CSS mask
 * so it automatically inherits `currentColor` on both light cards and dark banners.
 */
export function SaudiRiyalSymbol({
  className = 'h-[0.95em] w-[0.95em]',
}: SaudiRiyalSymbolProps) {
  return (
    <span
      role="img"
      aria-label="ريال سعودي"
      className={`inline-block shrink-0 align-baseline ${className}`}
      style={{
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url('${import.meta.env.BASE_URL}images/sar-symbol.png')`,
        maskImage: `url('${import.meta.env.BASE_URL}images/sar-symbol.png')`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}
