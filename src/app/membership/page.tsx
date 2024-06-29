'use client';
import { alpha } from '@mui/material';
import MembershipArray from '@/data/membership.json';
import { Membership } from '@devshop24/component-library';

import { ThemeContext } from '@/providers/ThemeContext';
import { useContext, useEffect, } from 'react';


const MembershipPage = () => {
  const { theme } = useContext(ThemeContext);

  const checkout = async ({ slug, trialPeriodDays, frequency }: { slug: string, trialPeriodDays: number, frequency: string }) => {
    console.log(slug);
    //   const url = await subscriptionCheckout({ slug: slug, trialPeriodDays: 0, frequency: frequency.value });

    //   window.location.assign(`${url.url}`);
  };

  useEffect(() => {
    // const getMembership = async () => {
    //   const membership = await getTiers();
    //   if (!membership) throw Error('No membership found');
    // setTiers(membership);
    // };
    // getMembership();
  }, []);

  return (
    <Membership title='Advance Your Teaching Journey with Doctrina LMS' description=' Unlock the potential of your expertise with tailored plans designed to suit every stage of your teaching career. From individual educators starting out to established institutions seeking to broaden their reach, Doctrina provides the tools and support you need to achieve your educational goals' membership={MembershipArray} chipBgColor={alpha(theme.palette.primary.main, 0.8)} trialPeriodDays={0} handleCheckout={checkout}

    />
    
  );
};

export default MembershipPage;
