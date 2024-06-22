import Logo from "@/components/Logo";
import Stack from "@mui/material/Stack";

// import { getCurrentUser } from '@/actions/user';

import { Avatar } from "@devshop24/component-library";
import { LoginButtons } from "@devshop24/component-library";
import { Box, Link } from "@mui/material";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Instructors", href: "/membership" },
  { name: "Students", href: "#students" },
  { name: "Browse", href: "/browse" },
  { name: "ContactUs", href: "#contact-us" },
];

interface HeaderProps {
  title: React.ReactNode;
  subtitle: React.ReactNode | string;
  action: JSX.Element;
  action2?: JSX.Element;
}

const Header = async ({ title, subtitle, action }: HeaderProps) => {
  // const user = await getCurrentUser();
  const user = { name: "John Doe", image: "https://randomuser.me/api/portait" };
  return (
    <Stack sx={{ height: 600, px: 1 }}>
      <Stack
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          zIndex: 10,
        }}
      >
        <Logo color="white" />

        <Stack
          sx={{ flexDirection: "row", gap: { xs: 3, lg: 10 }, zIndex: 10 }}
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              sx={{ color: "white", fontSize: "1rem", textDecoration: "none" }}
            >
              {item.name}
            </Link>
          ))}
        </Stack>
        <Stack>
          {!user ? (
            <>
              <LoginButtons textColor="white" />
            </>
          ) : (
            <Avatar name={user.name as string} image={user.image as string} />
          )}
        </Stack>
      </Stack>
      <Stack sx={{ margin: "auto" }}>
        {title}
        {subtitle}
        <Box
          sx={{
            mt: "2.5rem",
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            mx: "1.25rem",
          }}
        >
          {action}
        </Box>
      </Stack>

      <Box
        sx={{
          position: "absolute",
          insetX: 0,
          top: { xs: "[calc(100%-13rem)]", sm: "[calc(100%-30rem)]" },
          zIndex: -10,
          overflow: "hidden",
          transform: "translateZ(0)",
          filter: "blur(48px)",
        }}
      ></Box>
    </Stack>
  );
};
export default Header;
