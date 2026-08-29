import * as React from "react";

export function BrandLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Porizayi"
      className={className ?? "h-9 w-auto"}
    />
  );
}
