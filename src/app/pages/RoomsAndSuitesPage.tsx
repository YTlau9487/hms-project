import React from 'react';
import { Helmet } from 'react-helmet-async';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';
import { PAGE_SEO } from '../utils/seo';

export const RoomsAndSuitesPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      heading: t('roomsAndSuitesPage.luxuryAccommodations.heading'),
      content: t('roomsAndSuitesPage.luxuryAccommodations.content')
    },
    {
      heading: t('roomsAndSuitesPage.standardRooms.heading'),
      content: [
        t('roomsAndSuitesPage.standardRooms.item1'),
        t('roomsAndSuitesPage.standardRooms.item2'),
        t('roomsAndSuitesPage.standardRooms.item3'),
      ]
    },
    {
      heading: t('roomsAndSuitesPage.luxuryRooms.heading'),
      content: [
        t('roomsAndSuitesPage.luxuryRooms.item1'),
        t('roomsAndSuitesPage.luxuryRooms.item2'),
        t('roomsAndSuitesPage.luxuryRooms.item3'),
      ]
    },
    {
      heading: t('roomsAndSuitesPage.suites.heading'),
      content: [
        t('roomsAndSuitesPage.suites.item1'),
        t('roomsAndSuitesPage.suites.item2'),
        t('roomsAndSuitesPage.suites.item3'),
      ]
    },
    {
      heading: t('roomsAndSuitesPage.businessRooms.heading'),
      content: [
        t('roomsAndSuitesPage.businessRooms.item1'),
        t('roomsAndSuitesPage.businessRooms.item2'),
        t('roomsAndSuitesPage.businessRooms.item3'),
      ]
    },
    {
      heading: t('roomsAndSuitesPage.amenities.heading'),
      content: [
        t('roomsAndSuitesPage.amenities.item1'),
        t('roomsAndSuitesPage.amenities.item2'),
        t('roomsAndSuitesPage.amenities.item3'),
        t('roomsAndSuitesPage.amenities.item4'),
        t('roomsAndSuitesPage.amenities.item5'),
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.roomsAndSuites.title}</title>
        <meta name="description" content={PAGE_SEO.roomsAndSuites.description} />
        <link rel="canonical" href={PAGE_SEO.roomsAndSuites.canonical} />
        <meta property="og:title" content={PAGE_SEO.roomsAndSuites.title} />
        <meta property="og:description" content={PAGE_SEO.roomsAndSuites.description} />
        <meta property="og:type" content={PAGE_SEO.roomsAndSuites.ogType} />
        <meta property="og:url" content={PAGE_SEO.roomsAndSuites.canonical} />
        <meta property="og:image" content={PAGE_SEO.roomsAndSuites.ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_SEO.roomsAndSuites.title} />
        <meta name="twitter:description" content={PAGE_SEO.roomsAndSuites.description} />
        <meta name="twitter:image" content={PAGE_SEO.roomsAndSuites.ogImage} />
      </Helmet>
      <StaticPageLayout 
      title={t('roomsAndSuitesPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
    </>
  );
};
