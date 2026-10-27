"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "white"
  | "destructive"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Keep the button focusable while disabled (Base UI behavior). */
  focusableWhenDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Animate the left icon on hover. */
  leftIconMotion?: "trash" | "mail";
  /** Animate the right icon on hover. */
  rightIconMotion?: "arrow" | "download";
}

const base =
  "wensity-button relative inline-flex shrink-0 transform-gpu items-center justify-center gap-2 whitespace-nowrap rounded-[var(--primitive-radius-control,0.875rem)] shadow-none " +
  "text-sm font-medium select-none touch-manipulation " +
  "transition-[background-color,border-color,color,opacity,transform] duration-180 ease-[var(--primitive-ease,cubic-bezier(0.23,1,0.32,1))] motion-reduce:transition-[background-color,border-color,color,opacity] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primitive-ring,color-mix(in_srgb,var(--foreground)_45%,transparent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] " +
  "disabled:pointer-events-none disabled:opacity-45 data-disabled:pointer-events-none data-disabled:opacity-45 " +
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const pressable =
  "active:scale-[0.97] active:duration-100 motion-reduce:active:scale-100 disabled:active:scale-100 data-disabled:active:scale-100";

const variants: Record<ButtonVariant, string> = {
  default: cn(
    pressable,
    "border border-[color-mix(in_srgb,var(--primitive-control-solid,var(--primary))_88%,var(--background))] bg-[color:var(--primitive-control-solid,var(--primary))] text-[color:var(--primitive-control-solid-foreground,var(--primary-foreground))] " +
      "hover:border-[color-mix(in_srgb,var(--primitive-control-solid-hover,color-mix(in_srgb,var(--primary)_90%,var(--background)))_82%,var(--background))] hover:bg-[color:var(--primitive-control-solid-hover,color-mix(in_srgb,var(--primary)_90%,var(--background)))] " +
      "active:border-[color-mix(in_srgb,var(--primitive-control-solid-active,color-mix(in_srgb,var(--primary)_82%,var(--background)))_92%,var(--background))] active:bg-[color:var(--primitive-control-solid-active,color-mix(in_srgb,var(--primary)_82%,var(--background)))]",
  ),
  secondary: cn(
    pressable,
    "border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] " +
      "hover:border-[color:var(--border-strong,color-mix(in_srgb,var(--foreground)_16%,transparent))] hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))] " +
      "active:border-[color:var(--border-strong,color-mix(in_srgb,var(--foreground)_16%,transparent))] active:bg-[color:var(--primitive-surface-active,color-mix(in_srgb,var(--foreground)_8%,transparent))]",
  ),
  outline: cn(
    pressable,
    "border border-[color:var(--border-strong,color-mix(in_srgb,var(--foreground)_16%,transparent))] bg-transparent text-[var(--foreground)] " +
      "hover:border-[color-mix(in_srgb,var(--foreground)_20%,var(--background))] hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))] " +
      "active:border-[color-mix(in_srgb,var(--foreground)_26%,var(--background))] active:bg-[color:var(--primitive-surface-active,color-mix(in_srgb,var(--foreground)_8%,transparent))]",
  ),
  ghost: cn(
    pressable,
    "border border-transparent bg-transparent text-[var(--muted-foreground)] " +
      "hover:border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))] hover:text-[var(--foreground)] " +
      "active:border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] active:bg-[color:var(--primitive-surface-active,color-mix(in_srgb,var(--foreground)_8%,transparent))]",
  ),
  // Light: elevated surface; dark: shares control-solid with default (plan note).
  white: cn(
    pressable,
    "border border-[color-mix(in_srgb,var(--foreground)_10%,var(--background))] bg-[color:var(--primitive-surface-elevated,var(--card))] text-[var(--foreground)] " +
      "hover:border-[color-mix(in_srgb,var(--foreground)_14%,var(--background))] hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))] " +
      "active:border-[color-mix(in_srgb,var(--foreground)_18%,var(--background))] active:bg-[color:var(--primitive-surface-active,color-mix(in_srgb,var(--foreground)_8%,transparent))] " +
      "dark:border-[color-mix(in_srgb,var(--primitive-control-solid,var(--primary))_88%,var(--background))] dark:bg-[color:var(--primitive-control-solid,var(--primary))] dark:text-[color:var(--primitive-control-solid-foreground,var(--primary-foreground))] " +
      "dark:hover:border-[color-mix(in_srgb,var(--primitive-control-solid-hover,color-mix(in_srgb,var(--primary)_90%,var(--background)))_82%,var(--background))] dark:hover:bg-[color:var(--primitive-control-solid-hover,color-mix(in_srgb,var(--primary)_90%,var(--background)))] " +
      "dark:active:border-[color-mix(in_srgb,var(--primitive-control-solid-active,color-mix(in_srgb,var(--primary)_82%,var(--background)))_92%,var(--background))] dark:active:bg-[color:var(--primitive-control-solid-active,color-mix(in_srgb,var(--primary)_82%,var(--background)))]",
  ),
  destructive: cn(
    pressable,
    "border border-[color-mix(in_srgb,var(--primitive-destructive,var(--destructive))_78%,var(--foreground))] bg-[color:var(--primitive-destructive,var(--destructive))] text-[color:var(--primitive-destructive-foreground,#ffffff)] " +
      "hover:border-[color-mix(in_srgb,var(--primitive-destructive-hover,color-mix(in_srgb,var(--destructive)_88%,black))_82%,var(--background))] hover:bg-[color:var(--primitive-destructive-hover,color-mix(in_srgb,var(--destructive)_88%,black))] " +
      "active:border-[color-mix(in_srgb,var(--primitive-destructive-active,color-mix(in_srgb,var(--destructive)_78%,black))_92%,var(--background))] active:bg-[color:var(--primitive-destructive-active,color-mix(in_srgb,var(--destructive)_78%,black))]",
  ),
  link:
    "h-auto border border-transparent bg-transparent px-0 font-medium text-[var(--foreground)] underline-offset-4 " +
    "hover:text-[var(--muted-foreground)] hover:underline hover:decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] " +
    "active:scale-100 active:text-[var(--foreground)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-[var(--primitive-control-height-sm,2rem)] gap-1.5 px-3.5 text-xs",
  md: "h-[var(--primitive-control-height-md,2.25rem)] gap-2 px-4",
  lg: "h-[var(--primitive-control-height-lg,2.5rem)] gap-2 px-5 text-[15px]",
  icon: "h-9 w-9 gap-0 p-0",
};

const ICON_SHELL = "relative z-10 inline-flex shrink-0";

const ICON_MOTION_SHELL = "btn-icon-motion inline-flex shrink-0 origin-center transform-gpu";

const leftIconMotionClass = {
  trash: cn(ICON_MOTION_SHELL, "btn-icon-motion--trash"),
  mail: cn(ICON_MOTION_SHELL, "btn-icon-motion--mail"),
} as const;

const rightIconMotionClass = {
  arrow: cn(ICON_MOTION_SHELL, "btn-icon-motion--arrow"),
  download: cn(ICON_MOTION_SHELL, "btn-icon-motion--download"),
} as const;

const BUTTON_ICON_KEYFRAMES_ID = "button-icon-keyframes";

function ensureButtonIconKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(BUTTON_ICON_KEYFRAMES_ID)) return;

  const style = document.createElement("style");
  style.id = BUTTON_ICON_KEYFRAMES_ID;
  style.textContent = `
    @keyframes button-trash-shake {
      0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
      24% { transform: translate3d(-0.5px, -1px, 0) rotate(-4deg); }
      48% { transform: translate3d(0.5px, -1px, 0) rotate(3deg); }
      72% { transform: translate3d(-0.25px, -0.5px, 0) rotate(-1.5deg); }
    }
    @keyframes button-mail-lift {
      0% { transform: translate3d(0, 0, 0) rotate(0deg); }
      46% { transform: translate3d(2px, -2px, 0) rotate(-5deg); }
      100% { transform: translate3d(0, 0, 0) rotate(0deg); }
    }
    @keyframes button-download-tick {
      0%, 100% { transform: translate3d(0, 0, 0); }
      46% { transform: translate3d(0, 2.5px, 0); }
    }
    .btn-icon-motion--arrow {
      transition: transform 160ms var(--primitive-ease, cubic-bezier(0.23, 1, 0.32, 1));
    }
    @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
      .wensity-button:hover .btn-icon-motion--trash {
        animation: button-trash-shake 340ms var(--primitive-ease, cubic-bezier(0.23, 1, 0.32, 1)) both;
      }
      .wensity-button:hover .btn-icon-motion--mail {
        animation: button-mail-lift 320ms var(--primitive-ease, cubic-bezier(0.23, 1, 0.32, 1)) both;
      }
      .wensity-button:hover .btn-icon-motion--arrow {
        transform: translate3d(2px, 0, 0);
      }
      .wensity-button:active .btn-icon-motion--arrow {
        transform: translate3d(1px, 0, 0);
      }
      .wensity-button:hover .btn-icon-motion--download {
        animation: button-download-tick 300ms var(--primitive-ease, cubic-bezier(0.23, 1, 0.32, 1)) both;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .btn-icon-motion {
        animation: none !important;
        transition: none !important;
        transform: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function buttonVariants({
  variant = "default",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      asChild = false,
      loading = false,
      disabled = false,
      focusableWhenDisabled,
      leftIcon,
      rightIcon,
      leftIconMotion,
      rightIconMotion,
      children,
      type,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const hasIconMotion = Boolean(leftIconMotion || rightIconMotion);

    React.useLayoutEffect(() => {
      if (hasIconMotion) ensureButtonIconKeyframes();
    }, [hasIconMotion]);

    const composedClassName = buttonVariants({
      variant,
      size,
      className: cn(hasIconMotion && "group", className),
    });

    const content = (
      <>
        {loading ? <ButtonSpinner /> : null}
        {!loading && leftIcon ? (
          <span className={cn(ICON_SHELL, leftIconMotion && leftIconMotionClass[leftIconMotion])}>{leftIcon}</span>
        ) : null}
        {size === "icon" && !loading && !leftIcon && !rightIcon ? (
          <span className={cn(ICON_SHELL, "items-center justify-center")}>{children}</span>
        ) : (
          <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
        )}
        {!loading && rightIcon ? (
          <span className={cn(ICON_SHELL, rightIconMotion && rightIconMotionClass[rightIconMotion])}>{rightIcon}</span>
        ) : null}
      </>
    );

    if (asChild && React.isValidElement(children)) {
      // Compose Base UI Button props onto the provided child element (e.g. <a>).
      // The child owns the DOM tag; wrapped content still renders through its children.
      return (
        <BaseButton
          data-wensity-primitive=""
          ref={ref as React.Ref<HTMLElement>}
          disabled={isDisabled}
          focusableWhenDisabled={focusableWhenDisabled}
          nativeButton={false}
          className={composedClassName}
          aria-busy={loading ? true : undefined}
          data-loading={loading ? "" : undefined}
          render={children as React.ReactElement}
          {...props}
        />
      );
    }

    return (
      <BaseButton
        data-wensity-primitive=""
        ref={ref}
        disabled={isDisabled}
        focusableWhenDisabled={focusableWhenDisabled}
        type={type ?? "button"}
        className={composedClassName}
        aria-busy={loading ? true : undefined}
        data-loading={loading ? "" : undefined}
        {...props}
      >
        {content}
      </BaseButton>
    );
  },
);

Button.displayName = "Button";

function ButtonSpinner() {
  return (
    <span
      aria-hidden="true"
      className="relative z-10 size-3.5 shrink-0 rounded-full border-2 border-current border-r-transparent opacity-80 motion-safe:animate-spin"
    />
  );
}
