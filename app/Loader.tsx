import { clsx } from "clsx";
import styles from "./Loader.module.css";

const bars = Array(12).fill(0);

export default function Loader({
  color = "#fff",
  size = 20,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <div
      className={styles.wrapper}
      style={
        {
          "--spinner-size": `${size}px`,
          "--spinner-color": color,
        } as React.CSSProperties
      }
    >
      <div className={styles.spinner}>
        {bars.map((_, i) => (
          <div className={styles.bar} key={`spinner-bar-${i}`} />
        ))}
      </div>
    </div>
  );
}
