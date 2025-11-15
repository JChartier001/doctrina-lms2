import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { Grid } from '@mui/material';

interface FAQProps {
  faqs: {
    question: string;
    answer: string;
  }[];
}

const FAQs = ({ faqs }: FAQProps) => {
  return (
    <Stack sx={{ px: { xs: 8, sm: 20 }, py: 8, bgcolor: 'white' }}>
      <Stack m="auto" textAlign={'center'} gap={3} mb={5}>
        <Typography variant="h3">Frequently asked questions</Typography>
        <Typography
          paragraph
          sx={{ width: { xs: '100%', lg: '80%' }, m: 'auto' }}
        >
          Have a different question and can’t find the answer you’re looking
          for? Reach out to our support team by
          <Link href="#" underline="none">
            {' '}
            sending us an email{' '}
          </Link>
          and we’ll get back to you as soon as we can.
        </Typography>
      </Stack>

      <Grid container spacing={2} justifyContent="center">
        {faqs.map((faq, i) => (
          <Grid item xs={12} md={6} lg={4} key={i}>
            <Typography
              paragraph
              sx={{ fontWeight: 'bold', height: { lg: 50 } }}
            >
              {faq.question}
            </Typography>
            <Typography variant="body2">{faq.answer}</Typography>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default FAQs;
