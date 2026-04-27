import React from 'react';
import { Helmet } from 'react-helmet-async';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';
import { PAGE_SEO } from '../utils/seo';

export const MeetingsEventsPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      heading: t('meetingsEventsPage.versatileSpaces.heading'),
      content: t('meetingsEventsPage.versatileSpaces.content')
    },
    {
      heading: t('meetingsEventsPage.meetingRooms.heading'),
      content: [
        t('meetingsEventsPage.meetingRooms.item1'),
        t('meetingsEventsPage.meetingRooms.item2'),
        t('meetingsEventsPage.meetingRooms.item3'),
      ]
    },
    {
      heading: t('meetingsEventsPage.conferenceFacilities.heading'),
      content: [
        t('meetingsEventsPage.conferenceFacilities.item1'),
        t('meetingsEventsPage.conferenceFacilities.item2'),
        t('meetingsEventsPage.conferenceFacilities.item3'),
      ]
    },
    {
      heading: t('meetingsEventsPage.specialEvents.heading'),
      content: [
        t('meetingsEventsPage.specialEvents.item1'),
        t('meetingsEventsPage.specialEvents.item2'),
        t('meetingsEventsPage.specialEvents.item3'),
      ]
    },
    {
      heading: t('meetingsEventsPage.cateringServices.heading'),
      content: [
        t('meetingsEventsPage.cateringServices.item1'),
        t('meetingsEventsPage.cateringServices.item2'),
        t('meetingsEventsPage.cateringServices.item3'),
      ]
    },
    {
      heading: t('meetingsEventsPage.technologySupport.heading'),
      content: [
        t('meetingsEventsPage.technologySupport.item1'),
        t('meetingsEventsPage.technologySupport.item2'),
        t('meetingsEventsPage.technologySupport.item3'),
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>{PAGE_SEO.meetingsEvents.title}</title>
        <meta name="description" content={PAGE_SEO.meetingsEvents.description} />
        <link rel="canonical" href={PAGE_SEO.meetingsEvents.canonical} />
        <meta property="og:title" content={PAGE_SEO.meetingsEvents.title} />
        <meta property="og:description" content={PAGE_SEO.meetingsEvents.description} />
        <meta property="og:type" content={PAGE_SEO.meetingsEvents.ogType} />
        <meta property="og:url" content={PAGE_SEO.meetingsEvents.canonical} />
        <meta property="og:image" content={PAGE_SEO.meetingsEvents.ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_SEO.meetingsEvents.title} />
        <meta name="twitter:description" content={PAGE_SEO.meetingsEvents.description} />
        <meta name="twitter:image" content={PAGE_SEO.meetingsEvents.ogImage} />
      </Helmet>
      <StaticPageLayout 
      title={t('meetingsEventsPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
    </>
  );
};
