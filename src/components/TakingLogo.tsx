import { useTheme } from "@/contexts/ThemeContext";

const LOGO_DARK = "/brand/logo-plataforma-talent.svg";
const LOGO_LIGHT = "/brand/logo-plataforma-talent-light.svg";

interface TakingLogoProps {
  className?: string;
  height?: number;
}

export function TakingLogo({ className, height = 32 }: TakingLogoProps) {
  const { theme } = useTheme();
  const src = theme === "light" ? LOGO_LIGHT : LOGO_DARK;

  return (
    <img
      src={src}
      alt="Grupo Taking"
      className={className ?? ""}
      style={{ height, width: "auto" }}
    />
  );
}
