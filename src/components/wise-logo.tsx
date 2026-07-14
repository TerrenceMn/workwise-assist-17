import type { SVGProps } from "react";

// Custom Wise mark: overlapping stacked bars evoking a "W" and a rising signal.
// Uses design tokens via currentColor so it inherits from the parent.
export function WiseLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <path
        d="M8 12L14 28L20 18L26 28L32 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand"
      />
      <circle cx="20" cy="18" r="2.2" className="fill-brand" />
    </svg>
  );
}

export function WiseWordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <WiseLogo className="h-8 w-8 shrink-0" />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
          Wise
        </span>
        <span className="truncate text-[11px] text-muted-foreground">
          Workplace Assistant
        </span>
      </div>
    </div>
  );
}
