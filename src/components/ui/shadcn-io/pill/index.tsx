import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "utils";

export type PillProps = ComponentProps<typeof Badge> & {
  themed?: boolean;
};

export const Pill = ({
  variant = "secondary",
  themed: _themed = false,
  className,
  ...props
}: PillProps) => (
  <Badge
    className={cn("gap-2 rounded-full px-3 py-1.5 font-normal", className)}
    variant={variant}
    {...(props as Record<string, unknown>)}
  />
);

export type PillAvatarProps = ComponentProps<typeof AvatarImage> & {
  fallback?: string;
};

export const PillAvatar = ({ fallback, className, ...props }: PillAvatarProps) => (
  <Avatar className={cn("-ml-1 size-4", className)}>
    <AvatarImage {...(props as Record<string, unknown>)} />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
);

export type PillButtonProps = ComponentProps<typeof Button>;

export const PillButton = ({ className, ...props }: PillButtonProps) => (
  <Button
    className={cn(
      `
        -my-2 -mr-2 size-6 rounded-full p-0.5
        hover:bg-foreground/5
      `,
      className
    )}
    size="icon"
    variant="ghost"
    {...(props as Record<string, unknown>)}
  />
);

export interface PillStatusProps {
  children: ReactNode;
  className?: string;
}

export const PillStatus = ({ children, className, ...props }: PillStatusProps) => (
  <div
    className={cn("flex items-center gap-2 border-r pr-2 font-medium", className)}
    {...(props as Record<string, unknown>)}
  >
    {children}
  </div>
);

export interface PillIndicatorProps {
  variant?: "success" | "error" | "warning" | "info";
  pulse?: boolean;
}

export const PillIndicator = ({ variant = "success", pulse = false }: PillIndicatorProps) => (
  <span className="relative flex size-2">
    {pulse && (
      <span
        className={cn(
          `absolute inline-flex size-full animate-ping rounded-full opacity-75`,
          variant === "success" && "bg-emerald-400",
          variant === "error" && "bg-rose-400",
          variant === "warning" && "bg-amber-400",
          variant === "info" && "bg-sky-400"
        )}
      />
    )}
    <span
      className={cn(
        "relative inline-flex size-2 rounded-full",
        variant === "success" && "bg-emerald-500",
        variant === "error" && "bg-rose-500",
        variant === "warning" && "bg-amber-500",
        variant === "info" && "bg-sky-500"
      )}
    />
  </span>
);

export interface PillDeltaProps {
  className?: string;
  delta: number;
}

export const PillDelta = ({ className, delta }: PillDeltaProps) => {
  if (!delta) {
    return <MinusIcon className={cn("size-3 text-muted-foreground", className)} />;
  }

  if (delta > 0) {
    return <ChevronUpIcon className={cn("size-3 text-emerald-500", className)} />;
  }

  return <ChevronDownIcon className={cn("size-3 text-rose-500", className)} />;
};

export interface PillIconProps {
  icon: typeof ChevronUpIcon;
  className?: string;
}

export const PillIcon = ({ icon: Icon, className, ...props }: PillIconProps) => (
  <Icon
    className={cn("size-3 text-muted-foreground", className)}
    size={12}
    {...(props as Record<string, unknown>)}
  />
);

export interface PillAvatarGroupProps {
  children: ReactNode;
  className?: string;
}

export const PillAvatarGroup = ({ children, className, ...props }: PillAvatarGroupProps) => (
  <div
    className={cn(
      "flex items-center -space-x-1",
      `
        [&>*:not(:first-of-type)]:mask-[radial-gradient(circle_9px_at_-4px_50%,transparent_99%,white_100%)]
      `,
      className
    )}
    {...(props as Record<string, unknown>)}
  >
    {children}
  </div>
);
