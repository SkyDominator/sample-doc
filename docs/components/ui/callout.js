import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const CALLOUT_STYLES = {
  info: {
    icon: Info,
    wrapper: "border-sky-200 bg-sky-50/80 text-sky-950",
    iconWrap: "bg-sky-100 text-sky-700",
  },
  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-200 bg-emerald-50/80 text-emerald-950",
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-amber-200 bg-amber-50/80 text-amber-950",
    iconWrap: "bg-amber-100 text-amber-700",
  },
  highlight: {
    icon: Sparkles,
    wrapper: "border-primary/20 bg-primary/10 text-slate-950",
    iconWrap: "bg-primary/15 text-primary",
  },
};

export function Callout({
  className,
  title,
  type = "info",
  children,
  ...props
}) {
  const preset = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info;
  const Icon = preset.icon;

  return (
    <div
      className={cn(
        "my-6 flex items-start gap-4 rounded-[1.5rem] border p-4 shadow-soft",
        preset.wrapper,
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          preset.iconWrap
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        {title ? <p className="m-0 text-sm font-semibold">{title}</p> : null}
        <div className="mt-1 text-sm leading-6 text-current/85">{children}</div>
      </div>
    </div>
  );
}
