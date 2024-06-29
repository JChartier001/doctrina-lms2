
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { ContactUs, FAQs, CTASection, Features, MainHeader, Button, Footer } from "@devshop24/component-library";




const Home = () => {
  const user = {
    name: "John Doe",
    image: "https://randomuser.me/api/portraits",
    items: [{ label: "Profile",href:'/profile' }, { label: "Logout", href: '/logout' }],
    username: "johndoe",
  }

  const email = "customerservice@doctrinalms.com"

  return (
    <Stack>
      <Stack
        sx={{
          height: "100%",
          width: "100%",
          background: "linear-gradient(to top left, #104a60, #0b1a3b, #41193b)",
        }}
      >
        <MainHeader
          navigation={[
            { name: 'Home', href: '/' },
            { name: 'Instructors', href: '/membership' },
            { name: 'Students', href: '#students' },
            { name: 'Browse', href: '/browse' },
            { name: 'ContactUs', href: '#contact-us' },
          ]}
          user={user}
          navigationSx={{ color: 'primary.contrastText', fontSize: '1rem' }}
          logoImage="./logo1.png"
          logoTitle="Doctrina"
          logoSubtitle="All-in-one Education Platform"
          logoTitleSx={{ color: 'primary.contrastText' }}
          logoSubtitleSx={{ color: 'primary.contrastText', opacity: 0.5 }}
          title={
    <Stack
      key={0}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography
        variant="h1"
                sx={{ color: 'primary.contrastText', fontSize: { xs: '2rem', md: '3rem' } }}
      >
        Doctrina
      </Typography>
      <Typography
        variant="h3"
        sx={{
          color:'primary.contrastText',
       
          fontSize: { xs: '1rem', md: '2rem' },
          fontWeight: 'normal',
        }}
      >
        A New Era For Medical Aesthetics Education
      </Typography>
    </Stack>
  }
  subtitle={
    <Typography
      paragraph
      sx={{
        textAlign: 'center',
        width: '80%',
        color: 'primary.contrastText',
        opacity: 0.5,
        m: 'auto',
        mt: 2,
      }}
    >
      {' '}
      Doctrina LMS is a next-generation education platform and management system for medical aesthetic professionals. Designed from the ground up to connect educators and students with all the tools needed to make the learning experience more efficient and effective.
    </Typography>
  }
  action={
    <Stack sx={{ width: '50%', flexDirection: 'row', gap: 2 }}>
      {' '}
      <Button href='/register' variant='outlined' sx={{ width: '50%' }}>
        Try Now
      </Button>
      <Button href='/browse' variant='contained' sx={{ width: '50%' }}>
        Explore
      </Button>
    </Stack>
  }
/>

        <Features
          title={"Learn. Teach. Grow"}
          subtitle={
            "Discover a platform that adapts to your evolving educational and teaching needs in the field of medical aesthetics"
          }
          features={[
            {
              name: "Versatile Course Creation",
              description:
                "Effortlessly design and publish your courses, quizzes, and tests. Our tools make it simple to create engaging and impactful learning experiences for your students.",
            },
            {
              name: "Engaging Content Options",
              description:
                "Deliver your courses with flexibility through live streams, voice-over presentations, and private or public settings. Cater to diverse learning preferences and keep students engaged.",
            },
            {
              name: "Direct Communication Channels",
              description:
                "Build a strong learning community with built-in messaging and email support. Foster direct and meaningful interactions between you and your students.",
            },
            {
              name: "Insightful Analytics",
              description:
                "Monitor course performance and student engagement with our analytics. Use these insights to tailor your content and teaching strategies for optimal learning outcomes.",
            },
            {
              name: "Powerful Marketing & SEO",
              description:
                "Attract more students with our integrated marketing tools and built-in SEO. Use email marketing and marketing funnels to increase your course's visibility and reach.",
            },
            {
              name: "Customizable Teaching Experience",
              description:
                "Adapt the platform to your teaching style with features like live class scheduling, survey creation for feedback, and co-instructor collaboration. Create a unique and effective learning environment that meets the needs of your students.",
            },
          ]}
        />
        <CTASection
          color="primary.contrastText"
          title={"Lead the Next Generation in Medical Aesthetics"}
          href="/membership"
          description={
            "Transform your knowledge into impact on Doctrina, the go-to platform for medical aesthetic professionals. Create, manage, and sell your courses to an engaged audience across the US eager to learn. With our intuitive tools and comprehensive support, turning your expertise into a thriving online course has never been easier. Join our community of esteemed instructors and shape the future of medical aesthetics."
          }
        />
        <FAQs
          bgcolor='background.default'
          email={email}
          faqs={[
            {
              question: "Why you should use Doctrina",
              answer:
                "Doctrina is an online learning platform for medical aesthetic professionals. Our platform offers a wide range of courses and classes taught by experienced professionals in the field. Our goal is to help professionals like you stay current in the fast-paced world of medical aesthetics and advance your career.",
            },
            {
              question: "Can I sell my own courses on Doctrina?",
              answer:
                "Doctrina offers industry leaders like you the opportunity to create and sell your own courses, reaching thousands of professionals and monetizing your expertise. Our platform is easy to use and includes dedicated support. Sign up now and start earning money by sharing your knowledge.",
            },
            {
              question: "What types of courses are offered on Doctrina?",
              answer:
                "Our platform offers a wide range of courses and classes, including the latest techniques in injectables, laser technology, and much more. We pride ourselves on providing the most relevant and up-to-date content in the industry.",
            },
            {
              question: "Can I take courses on my own schedule?",
              answer:
                "Yes! Our platform allows you to take classes online, at your own pace, and on your own schedule. This means you can fit learning into your busy schedule and not have to worry about traveling to a physical location for classes.",
            },
            {
              question:
                "How do I update or manage my course content on Doctrina?",
              answer:
                "Managing and updating your courses on Doctrina is straightforward. Our platform provides instructors with intuitive tools to edit course materials, upload new content, and adjust course settings at any time. This ensures your offerings remain up-to-date and relevant to your students' needs.",
            },
            {
              question:
                "What support does Doctrina offer if I encounter technical issues?",
              answer:
                "Doctrina is here to help you navigate any technical challenges you might face. Our dedicated support team is available via email to assist with any issues, ensuring a smooth teaching and learning experience. For more immediate concerns, upgraded plans offer additional support channels, including phone assistance.",
            },
          ]}
        />
      </Stack>
      <Stack
        sx={{
          height: "100%",
          width: "100%",
          background: "linear-gradient(to top left, #41193b, #0b1a3b, #104a60)",
        }}
      >
        {" "}
        <CTASection
          color='primary.contrastText'
          title={"Learn From the Best, Shape Your Future"}
          href="/browse"
          id="students"
          description={
            "Elevate your skills in the medical aesthetics field with Doctrina's curated selection of courses. Learn from industry leaders, access cutting-edge techniques, and tailor your education to fit your schedule. Whether you're just starting or looking to advance, our platform provides the resources needed to succeed. Embark on your journey to excellence with us today."
          }
        />
        <ContactUs location="Kissimmee, FL 34746" email={email} iconSx={{ color: 'white' }} titleSx={{}} />
        <Footer navigation={{
          support: [{ name: "Pricing", href: "/membership" }],
          company: [
            { name: "Farmers", href: "/farmer" },
            { name: "Customers", href: "#" },
            { name: "Shop", href: "/store" },
            { name: "About", href: "#" },
            { name: "How it Works", href: "/#how-it-works" },
          ],
          legal: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms & Conditions", href: "/terms" },
            { name: "Farmer Terms & Conditions", href: "/farmer/terms" },
          ],
          social: [
            {
              name: "Facebook",
              href: "#",
            
            },
            {
              name: "Instagram",
              href: "#",

            },
            {
              name: "Twitter",
              href: "#",
            },
            {
              name: "YouTube",
              href: "#",
            },
          ],
        }}
          logoSrc="./logo1.png"
          iconColor='white'
          title="Doctrina"
          subtitle="All-in-one Education Platform"
          logoTitleSx={{ color: 'primary.contrastText' }}
          copyright=" &copy; 2024 Doctrina LMS, All rights reserved."
          description="Doctrina is a next-generation education platform and management system for medical aesthetic professionals. Designed from the ground up to connect educators and students with all the tools needed to make the learning experience more efficient and effective."
          logoSubtitleSx={{ color: 'primary.contrastText', opacity: 0.5 }}/>
      </Stack>
    </Stack>
  );
}

export default Home;