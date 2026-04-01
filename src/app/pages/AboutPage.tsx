import React from 'react';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';

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
    <StaticPageLayout 
      title={t('aboutPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
  );
};