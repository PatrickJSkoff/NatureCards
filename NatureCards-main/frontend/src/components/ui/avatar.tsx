import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Avatar({
  className,
  size = "md",
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-gray-200",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export type AvatarImageProps = Omit<React.ComponentProps<typeof Image>, "fill"> & {
  src: string;
};

export function AvatarImage({ className, alt = "", src, ...props }: AvatarImageProps) {
  return (
    <Image
      className={cn("object-cover", className)}
      alt={alt}
      src={src}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      {...props}
    />
  );
}

export type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement>;

export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-full bg-gray-400 text-white text-sm font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
