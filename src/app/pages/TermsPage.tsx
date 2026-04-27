import React from 'react';
import { Helmet } from 'react-helmet-async';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';
import { PAGE_SEO } from '../utils/seo';

export const TermsPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      heading: t('termsPage.acceptanceOfTerms.heading'),
      content: t('termsPage.acceptanceOfTerms.content')
    },
    {
      heading: t('termsPage.descriptionOfService.heading'),
      content: t('termsPage.descriptionOfService.content')
    },
    {
      heading: t('termsPage.userResponsibilities.heading'),
      content: [
        t('termsPage.userResponsibilities.item1'),
        t('termsPage.userResponsibilities.item2'),
        t('termsPage.userResponsibilities.item3'),
        t('termsPage.userResponsibilities.item4'),
      ]
    },
    {
      heading: t('termsPage.bookingAndCancellation.heading'),
      content: [
        t('termsPage.bookingAndCancellation.item1'),
        t('termsPage.bookingAndCancellation.item2'),
        t('termsPage.bookingAndCancellation.item3'),
      ]
    },
    {
      heading: t('termsPage.limitationOfLiability.heading'),
      content: t('termsPage.limitationOfLiability.content')
    },
    {
      heading: t('termsPage.modifications.heading'),
      content: t('termsPage.modifications.content')
    },
    {
      heading: t('termsPage.governingLaw.heading'),
      content: t('termsPage.governingLaw.content')
    }
  ];

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.terms.title}</title>
        <meta name="description" content={PAGE_SEO.terms.description} />
        <link rel="canonical" href={PAGE_SEO.terms.canonical} />
      </Helmet>
      <StaticPageLayout 
      title={t('termsPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
    </>
  );
};
