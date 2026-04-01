import React from 'react';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';

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
    <StaticPageLayout 
      title={t('meetingsEventsPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
  );
};