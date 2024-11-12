import clsx from "clsx";
import { motion } from "framer-motion";

interface GenerateButtonProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  onClick?: () => void;
}

export default function GenerateButton({
  size = "md",
  text = "Generate playlist",
  className,
  onClick,
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
        `flex-shrink-0 cursor-default rounded-full border border-border-brand bg-background-brand text-baseCompact hover:bg-background-brandHover ${paddingClasses} font-medium text-foreground-dark`,
        className,
      )}
    >
      <span>{text}</span>
    </button>
  );
}
