import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface LoadingSkeletonProps {
  // Add variant type for different skeleton layouts
  variant?: "text" | "button" | "card" | "full";
  lines?: number;
  height?: string;
  width?: string;
  className?: string;
}

/**
 * A reusable loading skeleton component with predefined variants.
 *
 * @example
 * ```tsx
 * // Text with multiple lines
 * <LoadingSkeleton variant="text" lines={2} />
 *
 * // Button skeleton
 * <LoadingSkeleton variant="button" />
 *
 * // Card skeleton
 * <LoadingSkeleton variant="card" />
 *
 * // Custom sizing
 * <LoadingSkeleton width="200px" height="24px" />
 * ```
 */
export const LoadingSkeleton: FC<LoadingSkeletonProps> = ({
  variant = "text",
  lines = 1,
  height,
  width,
  className = "",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "button":
        return {
          height: "38px",
          width: "120px",
          className: "rounded",
        };
      case "card":
        return {
          height: "100px",
          width: "100%",
          className: "rounded-lg",
        };
      case "text":
        return {
          height: "24px",
          width: lines === 1 ? "200px" : "100%",
          className: "rounded",
        };
      case "full":
        return {
          height: "100%",
          width: "100%",
          className: "rounded",
        };
      default:
        return {
          height: height || "24px",
          width: width || "100%",
          className: "rounded",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={styles.height}
          width={styles.width}
          className={styles.className}
          baseColor="#e2e8f0"
          highlightColor="#f8fafc"
        />
      ))}
    </div>
  );
};
