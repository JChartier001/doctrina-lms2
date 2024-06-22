import { Logo as LogoComponent } from "@devshop24/component-library";

const Logo = ({ color }: { color: string }) => {
  return (
    <LogoComponent
      title="Doctrina"
      subtitle="All-in-one Education Platform"
      imageSrc="/logo1.png"
      imageAlt="Doctrina"
      avatarSx={{ width: 50, height: 50 }}
      titleSx={{
        color: color,
      }}
      subtitleSx={{
        color: color,
      }}
    />
  );
};

export default Logo;
