import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-[15px] font-semibold transition-smooth";
  const variants = {
    primary:
      "bg-[var(--button)] text-[var(--button-text)] hover:bg-[var(--button-hover)]",
    secondary:
      "border-2 border-[var(--foreground)]/20 bg-transparent text-[var(--foreground)] hover:bg-[var(--muted-bg)]",
    ghost:
      "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]",
  };
  const styles = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={styles} onClick={onClick}>
      {children}
    </button>
  );
}
