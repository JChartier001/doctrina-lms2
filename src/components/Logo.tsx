import { Logo as LogoComponent } from "@devshop24/component-library";
import { SxProps } from "@mui/material";

const Logo = ({ color, sx }: { color: string, sx?: SxProps }) => {
  return (
    <LogoComponent
      title="Doctrina"
      subtitle="All-in-one Education Platform"
      imageSrc="/logo1.png"
      imageAlt="Doctrina"
      avatarSx={{ width: 50, height: 50 }}
      mobileDisplay="flex"
      sx={{...sx}}
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
