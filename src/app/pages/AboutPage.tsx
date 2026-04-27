import React from 'react';
import { Helmet } from 'react-helmet-async';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';
import { PAGE_SEO } from '../utils/seo';

export const AboutPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      heading: t('aboutPage.ourStory.heading'),
      content: t('aboutPage.ourStory.content')
    },
    {
      heading: t('aboutPage.ourMission.heading'),
      content: t('aboutPage.ourMission.content')
    },
    {
      heading: t('aboutPage.ourValues.heading'),
      content: [
        t('aboutPage.ourValues.item1'),
        t('aboutPage.ourValues.item2'),
        t('aboutPage.ourValues.item3'),
        t('aboutPage.ourValues.item4'),
      ]
    },
    {
      heading: t('aboutPage.whyChooseUs.heading'),
      content: [
        t('aboutPage.whyChooseUs.item1'),
        t('aboutPage.whyChooseUs.item2'),
        t('aboutPage.whyChooseUs.item3'),
        t('aboutPage.whyChooseUs.item4'),
      ]
    },
    {
      heading: t('aboutPage.contact.heading'),
      content: t('aboutPage.contact.content')
    }
  ];

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.about.title}</title>
        <meta name="description" content={PAGE_SEO.about.description} />
        <link rel="canonical" href={PAGE_SEO.about.canonical} />
        <meta property="og:title" content={PAGE_SEO.about.title} />
        <meta property="og:description" content={PAGE_SEO.about.description} />
        <meta property="og:type" content={PAGE_SEO.about.ogType} />
        <meta property="og:url" content={PAGE_SEO.about.canonical} />
        <meta property="og:image" content={PAGE_SEO.about.ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_SEO.about.title} />
        <meta name="twitter:description" content={PAGE_SEO.about.description} />
        <meta name="twitter:image" content={PAGE_SEO.about.ogImage} />
      </Helmet>
      <StaticPageLayout 
      title={t('aboutPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
    </>
  );
};
