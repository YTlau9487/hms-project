import React from 'react';
import { Helmet } from 'react-helmet-async';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';
import { PAGE_SEO } from '../utils/seo';

export const CookiesPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      heading: t('cookiesPage.whatAreCookies.heading'),
      content: t('cookiesPage.whatAreCookies.content')
    },
    {
      heading: t('cookiesPage.typesOfCookies.heading'),
      content: [
        t('cookiesPage.typesOfCookies.item1'),
        t('cookiesPage.typesOfCookies.item2'),
        t('cookiesPage.typesOfCookies.item3'),
        t('cookiesPage.typesOfCookies.item4'),
      ]
    },
    {
      heading: t('cookiesPage.howWeUseCookies.heading'),
      content: [
        t('cookiesPage.howWeUseCookies.item1'),
        t('cookiesPage.howWeUseCookies.item2'),
        t('cookiesPage.howWeUseCookies.item3'),
        t('cookiesPage.howWeUseCookies.item4'),
      ]
    },
    {
      heading: t('cookiesPage.managingCookies.heading'),
      content: t('cookiesPage.managingCookies.content')
    },
    {
      heading: t('cookiesPage.thirdPartyCookies.heading'),
      content: t('cookiesPage.thirdPartyCookies.content')
    },
    {
      heading: t('cookiesPage.updates.heading'),
      content: t('cookiesPage.updates.content')
    }
  ];

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.cookies.title}</title>
        <meta name="description" content={PAGE_SEO.cookies.description} />
        <link rel="canonical" href={PAGE_SEO.cookies.canonical} />
      </Helmet>
      <StaticPageLayout 
      title={t('cookiesPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
    </>
  );
};
