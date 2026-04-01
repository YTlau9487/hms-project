import React from 'react';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';

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
    <StaticPageLayout 
      title={t('diningPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
  );
};