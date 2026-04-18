import type { HTMLAttributes } from "react";

type Elevation = "flat" | "raised";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside" | "ul" | "ol";
  elevation?: Elevation;
};

const elevations: Record<Elevation, string> = {
  flat: "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40",
  raised:
    "border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40",
};

export function Card({
  as: Tag = "div",
  elevation = "raised",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <Tag
      className={`rounded-xl ${elevations[elevation]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
