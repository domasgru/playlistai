"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { useRef } from "react";

interface CoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutId?: string;
  coverUrl?: string;
}

export default function CoverModal({
  isOpen,
  onClose,
  layoutId,
  coverUrl,
}: CoverModalProps) {
  const imageRef = useRef(null);
  useOnClickOutside(imageRef, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-10 flex h-full w-full cursor-zoom-out select-none items-center justify-center">
          <motion.img
            ref={imageRef}
            layoutId={layoutId}
            transition={{
              type: "spring",
              duration: 0.3,
              bounce: 0,
            }}
            src={coverUrl}
            className="aspect-square h-[640px] max-h-[90%] w-[640px] max-w-[90%] object-contain"
            alt="Playlist cover"
            onClick={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
