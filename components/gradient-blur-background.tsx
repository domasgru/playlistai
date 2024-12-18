import clsx from "clsx";
import { PropsWithChildren } from "react";

type GradientBlurBackgroundProps = PropsWithChildren<{
  className?: string;
}>;

export default function GradientBlurBackground({
  className = "",
}: GradientBlurBackgroundProps) {
  return (
    <>
      <div
        className={clsx(
          "z-5 gradient-blur pointer-events-none fixed inset-x-0 bottom-0 h-full",
          className,
        )}
      >
        <div className="z-2 mask-gradient-1 absolute inset-0 backdrop-blur-[1px]"></div>
        <div className="z-3 mask-gradient-2 absolute inset-0 backdrop-blur-[2px]"></div>
        <div className="z-4 mask-gradient-3 absolute inset-0 backdrop-blur-[4px]"></div>
        <div className="z-5 mask-gradient-4 absolute inset-0 backdrop-blur-[8px]"></div>
        <div className="z-6 mask-gradient-5 absolute inset-0 backdrop-blur-[16px]"></div>
        <div className="z-7 mask-gradient-6 absolute inset-0 backdrop-blur-[32px]"></div>
      </div>
      <style jsx>{`
        .gradient-blur::before {
          content: "";
          z-index: 1;
          backdrop-filter: blur(0.5px);
          mask: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 1) 12.5%,
            rgba(0, 0, 0, 1) 25%,
            rgba(0, 0, 0, 0) 37.5%
          );
        }
        .mask-gradient-1 {
          mask: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 12.5%,
            rgba(0, 0, 0, 1) 25%,
            rgba(0, 0, 0, 1) 37.5%,
            rgba(0, 0, 0, 0) 50%
          );
        }
        .mask-gradient-2 {
          mask: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 25%,
            rgba(0, 0, 0, 1) 37.5%,
            rgba(0, 0, 0, 1) 50%,
            rgba(0, 0, 0, 0) 62.5%
          );
        }
        .mask-gradient-3 {
          mask: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 37.5%,
            rgba(0, 0, 0, 1) 50%,
            rgba(0, 0, 0, 1) 62.5%,
            rgba(0, 0, 0, 0) 75%
          );
        }
        .mask-gradient-4 {
          mask: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 50%,
            rgba(0, 0, 0, 1) 62.5%,
            rgba(0, 0, 0, 1) 75%,
            rgba(0, 0, 0, 0) 87.5%
          );
        }
        .mask-gradient-5 {
          mask: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 62.5%,
            rgba(0, 0, 0, 1) 75%,
            rgba(0, 0, 0, 1) 87.5%,
            rgba(0, 0, 0, 0) 100%
          );
        }
        .mask-gradient-6 {
          mask: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 75%,
            rgba(0, 0, 0, 1) 87.5%,
            rgba(0, 0, 0, 1) 100%
          );
        }
        .gradient-blur::after {
          content: "";
          z-index: 8;
          backdrop-filter: blur(64px);
          mask: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 87.5%,
            rgba(0, 0, 0, 1) 100%
          );
        }
      `}</style>
    </>
  );
}
