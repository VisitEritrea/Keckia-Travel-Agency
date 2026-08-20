/**
 * The shared building blocks.
 *
 * The suite grew out of four separate systems, so the same button was written
 * a dozen slightly different ways. These are the pieces every new screen is
 * built from: one button, one field, one card, one confirmation. They are
 * sized for people who use this all day and for touch — nothing interactive is
 * smaller than 44 pixels — and the wording is plain rather than technical.
 */
import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Image as ImageIcon, Info, Loader2, Search, X } from "lucide-react";
import { readAndCompressImage } from "../../utils/imageUpload";

/* ------------------------------------------------------------------ *
 * Buttons
 * ------------------------------------------------------------------ */

type ButtonTone = "primary" | "secondary" | "ghost" | "danger" | "success";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: ButtonTone;
    size?: "sm" | "md" | "lg";
    icon?: React.ComponentType<{ className?: string }>;
    busy?: boolean;
    block?: boolean;
  }
> = ({ tone = "secondary", size = "md", icon: Icon, busy, block, className = "", children, disabled, ...rest }) => {
  const tones: Record<ButtonTone, string> = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 border border-transparent shadow-sm",
    secondary:
      "bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 border border-slate-300 shadow-xs",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent shadow-sm",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-transparent shadow-sm",
  };
  const sizes = {
    sm: "min-h-9 px-3 text-[13px] gap-1.5 rounded-lg",
    md: "min-h-11 px-4 text-sm gap-2 rounded-xl",
    lg: "min-h-12 px-5 text-[15px] gap-2 rounded-xl",
  };

  return (
    <button
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center font-semibold transition-colors duration-150 cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${tones[tone]} ${sizes[size]} ${block ? "w-full" : ""} ${className}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
};

/* ------------------------------------------------------------------ *
 * Surfaces
 * ------------------------------------------------------------------ */

export const Card: React.FC<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}> = ({ title, description, actions, icon: Icon, className = "", bodyClassName = "", children }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white shadow-xs ${className}`}>
    {(title || actions) && (
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-4.5 w-4.5" />
            </span>
          )}
          <div className="min-w-0">
            {title && <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>}
            {description && <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className={`px-5 py-5 sm:px-6 ${bodyClassName}`}>{children}</div>
  </section>
);

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* ------------------------------------------------------------------ *
 * Messages
 * ------------------------------------------------------------------ */

type BannerTone = "info" | "success" | "warning" | "danger";

export const Banner: React.FC<{
  tone?: BannerTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}> = ({ tone = "info", title, children, onDismiss, className = "" }) => {
  const tones: Record<BannerTone, { box: string; icon: React.ComponentType<{ className?: string }>; iconClass: string }> = {
    info: { box: "border-lagoon-200 bg-lagoon-50 text-lagoon-950", icon: Info, iconClass: "text-lagoon-600" },
    success: { box: "border-emerald-200 bg-emerald-50 text-emerald-950", icon: Check, iconClass: "text-emerald-600" },
    warning: { box: "border-amber-200 bg-amber-50 text-amber-950", icon: AlertTriangle, iconClass: "text-amber-600" },
    danger: { box: "border-rose-200 bg-rose-50 text-rose-950", icon: AlertTriangle, iconClass: "text-rose-600" },
  };
  const { box, icon: Icon, iconClass } = tones[tone];

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${box} ${className}`}>
      <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${iconClass}`} />
      <div className="min-w-0 flex-1 text-sm leading-relaxed">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 opacity-60 hover:bg-black/5 hover:opacity-100 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const EmptyState: React.FC<{
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
    {Icon && (
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-xs">
        <Icon className="h-5.5 w-5.5" />
      </span>
    )}
    <p className="font-display text-base font-bold text-slate-800">{title}</p>
    {description && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ------------------------------------------------------------------ *
 * Fields
 * ------------------------------------------------------------------ */

const fieldShell =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 " +
  "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:bg-slate-50 disabled:text-slate-500";

export const Field: React.FC<{
  label: React.ReactNode;
  help?: React.ReactNode;
  error?: string | null;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, help, error, htmlFor, children, className = "" }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700">
      {label}
    </label>
    {help && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{help}</p>}
    <div className="mt-1.5">{children}</div>
    {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
  </div>
);

export const TextInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }
> = ({ className = "", ...rest }) => (
  <input {...rest} className={`${fieldShell} min-h-11 py-2.5 ${className}`} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = "", children, ...rest }) => (
  <div className="relative">
    <select {...rest} className={`${fieldShell} min-h-11 appearance-none py-2.5 pr-10 ${className}`}>
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </div>
);

/**
 * A real file picker for photo fields. Every form that shows a picture — a
 * package cover, a hotel or vehicle photo, a staff avatar — takes it from the
 * user's device rather than a pasted URL, since a URL field silently accepts
 * nothing at all and quietly falls back to a stock photo, which was the bug
 * this replaced.
 */
export const ImageUploadField: React.FC<{
  label?: React.ReactNode;
  value: string;
  onChange: (dataUrl: string) => void;
  hint?: React.ReactNode;
  shape?: "wide" | "square";
  className?: string;
}> = ({ label, value, onChange, hint, shape = "wide", className = "" }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onChange(await readAndCompressImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative overflow-hidden rounded-xl border-2 border-dashed cursor-pointer transition
          ${shape === "square" ? "aspect-square w-28" : "aspect-video w-full"}
          ${dragOver ? "border-brand-500 bg-brand-50" : value ? "border-transparent" : "border-slate-300 hover:border-brand-400 bg-slate-50"}`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              <span className="text-xs font-semibold text-white">{busy ? "Processing…" : "Change photo"}</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-slate-400">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
            <span className="text-[11px] font-medium">{busy ? "Processing…" : "Click or drop an image"}</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Remove photo
          </button>
        ) : (
          <span />
        )}
        {(error || hint) && (
          <p className={`text-[11px] ${error ? "text-rose-600" : "text-slate-400"}`}>{error || hint}</p>
        )}
      </div>
    </div>
  );
};

export const SearchInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...rest }) => (
  <div className="relative">
    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input {...rest} className={`${fieldShell} min-h-11 py-2.5 pl-10 ${className}`} />
  </div>
);

export const Toggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: React.ReactNode;
  help?: React.ReactNode;
  disabled?: boolean;
}> = ({ checked, onChange, label, help, disabled }) => (
  <label
    className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
      disabled
        ? "cursor-not-allowed border-slate-200 bg-slate-50"
        : checked
        ? "cursor-pointer border-brand-200 bg-brand-50/60 hover:bg-brand-50"
        : "cursor-pointer border-slate-200 bg-white hover:bg-slate-50"
    }`}
  >
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        checked ? "bg-brand-600" : "bg-slate-300"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-slate-800">{label}</span>
      {help && <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{help}</span>}
    </span>
  </label>
);

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

export interface TabDef {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
}

export const Tabs: React.FC<{
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}> = ({ tabs, active, onChange, className = "" }) => (
  <div className={`flex gap-1.5 overflow-x-auto pb-1 ${className}`}>
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = tab.key === active;
      return (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors cursor-pointer ${
            isActive
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {tab.label}
          {tab.badge != null && tab.badge !== "" && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.badge}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ *
 * Confirmation
 * ------------------------------------------------------------------ */

/**
 * For anything that cannot be undone. The person has to type the exact word
 * before the button becomes usable — a deliberate pause rather than a reflex
 * click on "OK".
 */
export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmWord?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ open, title, body, confirmWord, confirmLabel = "Confirm", tone = "danger", busy, onCancel, onConfirm }) => {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;
  const ready = !confirmWord || typed.trim().toUpperCase() === confirmWord.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              tone === "danger" ? "bg-rose-100 text-rose-600" : "bg-brand-100 text-brand-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
            <div className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</div>
          </div>
        </div>

        {confirmWord && (
          <div className="mt-5">
            <label className="block text-sm font-semibold text-slate-700">
              Type <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-rose-700">{confirmWord}</span> to
              continue
            </label>
            <TextInput
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmWord}
              className="mt-1.5"
              autoComplete="off"
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button tone={tone === "danger" ? "danger" : "primary"} disabled={!ready} busy={busy} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Small pieces
 * ------------------------------------------------------------------ */

export const StatTile: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}> = ({ label, value, hint, tone = "default" }) => {
  const tones = {
    default: "text-slate-900",
    good: "text-emerald-700",
    warn: "text-amber-700",
    bad: "text-rose-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xs">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1.5 font-display text-2xl font-extrabold tabular-nums ${tones[tone]}`}>{value}</div>
      {hint && <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</div>}
    </div>
  );
};

export const Badge: React.FC<{
  tone?: "neutral" | "brand" | "good" | "warn" | "bad";
  children: React.ReactNode;
}> = ({ tone = "neutral", children }) => {
  const tones = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    brand: "bg-brand-50 text-brand-800 border-brand-200",
    good: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
    bad: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** A staff photo, falling back to initials rather than a stock stand-in when nobody has uploaded one yet. */
export const Avatar: React.FC<{
  src?: string;
  name: string;
  className?: string;
}> = ({ src, name, className = "w-10 h-10 rounded-xl" }) => {
  if (src) {
    return <img src={src} alt={name} className={`object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex items-center justify-center bg-slate-200 text-slate-500 font-bold ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
};
