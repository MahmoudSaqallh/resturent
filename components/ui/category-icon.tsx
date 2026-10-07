import {
  CakeSlice,
  Coffee,
  CupSoda,
  Drumstick,
  Hamburger,
  LayoutGrid,
  Pizza,
  Sandwich,
  Tag,
  UtensilsCrossed,
  type LucideProps,
} from "lucide-react";
import type { CategoryIcon as CategoryIconName } from "@/types";

/** Fries carton drawn on Lucide's 24px grid with matching strokes. */
function Fries({ size = 24, strokeWidth = 2, className, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M7.5 10V4" />
      <path d="M10.5 10V2.5" />
      <path d="M13.5 10V3.5" />
      <path d="M16.5 10V5" />
      <path d="M4.5 10h15l-1.6 10.15a1 1 0 0 1-.99.85H7.09a1 1 0 0 1-.99-.85Z" />
      <path d="M9 14.5a3 3 0 0 0 6 0" />
    </svg>
  );
}

const ICONS: Record<CategoryIconName | "all", React.ComponentType<LucideProps>> = {
  all: LayoutGrid,
  burger: Hamburger,
  sandwich: Sandwich,
  meal: UtensilsCrossed,
  chicken: Drumstick,
  pizza: Pizza,
  fries: Fries,
  dessert: CakeSlice,
  "cold-drink": CupSoda,
  "hot-drink": Coffee,
  offer: Tag,
};

export function CategoryIcon({ name, ...props }: { name: CategoryIconName | "all" } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" {...props} />;
}
