import React from 'react';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';

export const AccessibilityPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      heading: t('accessibilityPage.ourCommitment.heading'),
      content: t('accessibilityPage.ourCommitment.content')
    },
    {
      heading: t('accessibilityPage.accessibilityFeatures.heading'),
      content: [
        t('accessibilityPage.accessibilityFeatures.item1'),
        t('accessibilityPage.accessibilityFeatures.item2'),
        t('accessibilityPage.accessibilityFeatures.item3'),
        t('accessibilityPage.accessibilityFeatures.item4'),
        t('accessibilityPage.accessibilityFeatures.item5'),
      ]
    },
    {
      heading: t('accessibilityPage.assistiveTechnologies.heading'),
      content: t('accessibilityPage.assistiveTechnologies.content')
    },
    {
      heading: t('accessibilityPage.feedback.heading'),
      content: t('accessibilityPage.feedback.content')
    },
    {
      heading: t('accessibilityPage.continuousImprovement.heading'),
      content: t('accessibilityPage.continuousImprovement.content')
    }
  ];

  return (
    <StaticPageLayout 
      title={t('accessibilityPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
  );
};