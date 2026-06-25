import { cn } from "@/lib/utils";

export function DocsToc({ className, items }) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-soft backdrop-blur",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        On this page
      </p>

      {items?.length ? (
        <nav className="mt-4 space-y-1">
          {items.map((item) => (
            <a
              className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              href={item.url}
              key={item.url}
              style={{ paddingLeft: `${12 + Math.max((item.depth ?? 2) - 2, 0) * 12}px` }}
            >
              {item.title}
            </a>
          ))}
        </nav>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          This page does not expose a generated table of contents yet.
        </p>
      )}
    </div>
  );
}