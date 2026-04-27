import React from 'react';
import { Helmet } from 'react-helmet-async';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';
import { PAGE_SEO } from '../utils/seo';

export const DiningPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      heading: t('diningPage.culinaryExcellence.heading'),
      content: t('diningPage.culinaryExcellence.content')
    },
    {
      heading: t('diningPage.fineDining.heading'),
      content: [
        t('diningPage.fineDining.item1'),
        t('diningPage.fineDining.item2'),
        t('diningPage.fineDining.item3'),
      ]
    },
    {
      heading: t('diningPage.casualDining.heading'),
      content: [
        t('diningPage.casualDining.item1'),
        t('diningPage.casualDining.item2'),
        t('diningPage.casualDining.item3'),
      ]
    },
    {
      heading: t('diningPage.barsAndLounges.heading'),
      content: [
        t('diningPage.barsAndLounges.item1'),
        t('diningPage.barsAndLounges.item2'),
        t('diningPage.barsAndLounges.item3'),
      ]
    },
    {
      heading: t('diningPage.privateDining.heading'),
      content: t('diningPage.privateDining.content')
    },
    {
      heading: t('diningPage.dietaryRequirements.heading'),
      content: [
        t('diningPage.dietaryRequirements.item1'),
        t('diningPage.dietaryRequirements.item2'),
        t('diningPage.dietaryRequirements.item3'),
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.dining.title}</title>
        <meta name="description" content={PAGE_SEO.dining.description} />
        <link rel="canonical" href={PAGE_SEO.dining.canonical} />
        <meta property="og:title" content={PAGE_SEO.dining.title} />
        <meta property="og:description" content={PAGE_SEO.dining.description} />
        <meta property="og:type" content={PAGE_SEO.dining.ogType} />
        <meta property="og:url" content={PAGE_SEO.dining.canonical} />
        <meta property="og:image" content={PAGE_SEO.dining.ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_SEO.dining.title} />
        <meta name="twitter:description" content={PAGE_SEO.dining.description} />
        <meta name="twitter:image" content={PAGE_SEO.dining.ogImage} />
      </Helmet>
      <StaticPageLayout 
      title={t('diningPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
    </>
  );
};
