type CardProps = {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
};

export default function Card({ children, className = "", glass = true }: CardProps) {
  return (
    <div
      className={`rounded-2xl ${glass ? "glass" : "bg-[var(--card)] border border-[var(--card-border)]"} ${className}`}
    >
      {children}
    </div>
  );
}
