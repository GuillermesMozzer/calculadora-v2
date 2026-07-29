const LOGO_SRC = "/brand/logo-plataforma-talent.svg";

interface TakingLogoProps {
  className?: string;
  height?: number;
}

export function TakingLogo({ className, height = 32 }: TakingLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="Grupo Taking"
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
