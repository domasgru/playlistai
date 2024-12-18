"use client";

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import clsx from "clsx";
import GenerateButton from "@/components/generate-button";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import GradientBlurBackground from "@/components/gradient-blur-background";
import Loader from "@/components/loader";

interface PlaylistInputProps {
  onChange: (value: string) => void;
  onSubmit: (description: string) => void;
  onClickOutside?: () => void;
  onMouseLeave?: () => void;
  onEscape?: () => void;
  value: string;
  submitButtonText?: string;
  placeholderText?: string;
  isLoading: boolean;
  collapsable?: boolean;
  backgroundColor?: "dark" | "gray";
  className?: string;
}

const PlaylistInput = forwardRef<HTMLTextAreaElement, PlaylistInputProps>(
  (
    {
      onChange,
      onSubmit,
      onClickOutside,
      onMouseLeave,
      onEscape,
      value,
      submitButtonText = "Generate playlist",
      placeholderText = "Describe what would you like to listen...",
      isLoading,
      collapsable = false,
      backgroundColor = "dark",
      className,
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => textareaRef.current!);

    const [isFocused, setIsFocused] = useState(false);
    const isCollapsed = collapsable && !isFocused;

    function handleTextareaFocus() {
      setIsFocused(true);
      focusEndOfTextarea();
    }

    function handleMouseLeave() {
      if (collapsable) {
        setIsFocused(false);
        textareaRef.current?.blur();
      }

      onMouseLeave?.();
    }

    function focusEndOfTextarea() {
      const length = textareaRef.current?.value.length || 0;
      textareaRef.current?.setSelectionRange(length, length);
    }

    function handleSubmit() {
      onSubmit(value);
      setIsFocused(false);
    }

    useOnClickOutside(rootRef, () => {
      setIsFocused(false);
      onClickOutside?.();
    });

    // TODO: check if this is needed
    useEffect(() => {
      if (!collapsable && textareaRef.current) {
        textareaRef.current.focus();
        focusEndOfTextarea();
      }
    }, [collapsable, textareaRef.current]);

    useEffect(() => {
      if (!isCollapsed) {
        window.requestAnimationFrame(() => {
          focusEndOfTextarea();
        });
      }
    }, [isCollapsed]);

    return (
      <div
        ref={rootRef}
        className={clsx(
          "flex flex-col items-center gap-20 overflow-hidden rounded",
          isCollapsed && "pointer-events-none",
          className,
        )}
        onMouseLeave={handleMouseLeave}
      >
        {collapsable && (
          <GradientBlurBackground
            className={clsx(
              "absolute bottom-[0] top-0 h-full",
              isCollapsed && "pointer-events-none",
            )}
          />
        )}

        <motion.div
          layout
          className={clsx(
            "pointer-events-auto relative flex w-full max-w-full cursor-text flex-col overflow-hidden rounded border border-input px-[24px] shadow-elevationWithInnerGlow will-change-transform",
            "perspective-1000 backface-hidden transform-gpu",
            collapsable && isCollapsed ? "py-[16px]" : "pb-[20px] pt-[16px]",
            !collapsable && isLoading && "pb-[21px] pt-[21px]",
            backgroundColor === "dark" ? "bg-gray-800" : "bg-[#303030]",
          )}
          transition={{
            layout: {
              duration: 0.25,
              type: "spring",
              bounce: 0,
            },
            layoutChildren: {
              duration: 0.25,
              type: "spring",
              bounce: 0,
            },
          }}
          style={{
            translateZ: 0,
            borderRadius: "16px",
            transformStyle: "preserve-3d",
          }}
          onClick={() => textareaRef.current?.focus()}
        >
          {isLoading && (
            <motion.div
              layout="position"
              className="flex h-32 items-center gap-12"
            >
              <Loader color="white" size={22} />
              <p className="text-base text-foreground-light">
                Generating playlist...
              </p>
            </motion.div>
          )}
          {!isLoading && (
            <motion.textarea
              layout="position"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange(e.target.value)
              }
              onFocus={handleTextareaFocus}
              ref={textareaRef}
              rows={isCollapsed ? 1 : 2}
              placeholder={placeholderText}
              className={clsx(
                "w-full resize-none bg-[inherit] leading-[32px] text-foreground-light placeholder-gray-300 focus:outline-none",
                isCollapsed ? "h-[32px]" : "mb-64 h-64",
              )}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                } else if (e.key === "Escape" && onEscape) {
                  e.preventDefault();
                  onEscape();
                }
              }}
            />
          )}
          <AnimatePresence initial={false}>
            {!isCollapsed && !isLoading && (
              <motion.div
                layout
                className="absolute"
                initial={{
                  opacity: 0,
                  bottom: -20,
                }}
                animate={{
                  opacity: 1,
                  bottom: 16,
                }}
                exit={{
                  bottom: -50,
                }}
                transition={{
                  duration: 0.35,
                  type: "spring",
                  bounce: 0,
                }}
                style={{
                  right: 20,
                  zIndex: 1000000,
                  willChange: "transform",
                }}
              >
                <GenerateButton onClick={handleSubmit} size="sm">
                  {submitButtonText}
                </GenerateButton>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  },
);

PlaylistInput.displayName = "PlaylistInput";

export default PlaylistInput;
