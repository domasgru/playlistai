import clsx from "clsx";
import { motion } from "framer-motion";

interface GenerateButtonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function GenerateButton({
  size = "md",
  className,
  onClick,
  children,
}: GenerateButtonProps) {
  const paddingClasses = {
    sm: "px-16 py-8",
    md: "px-22 py-14",
    lg: "px-36 py-23",
  }[size];

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex-shrink-0 cursor-default rounded-full border border-border-brand bg-background-brand text-baseCompact font-[600] text-foreground-dark hover:bg-background-brandHover",
        paddingClasses,
        className,
      )}
    >
      {children}
    </button>
  );
}
