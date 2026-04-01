import React from 'react';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { useTranslation } from 'react-i18next';

export const PrivacyPage = () => {
  const { t } = useTranslation();

  const sections = [
    {
      heading: t('privacyPage.informationWeCollect.heading'),
      content: [
        t('privacyPage.informationWeCollect.item1'),
        t('privacyPage.informationWeCollect.item2'),
        t('privacyPage.informationWeCollect.item3'),
        t('privacyPage.informationWeCollect.item4'),
      ]
    },
    {
      heading: t('privacyPage.howWeUseYourInformation.heading'),
      content: [
        t('privacyPage.howWeUseYourInformation.item1'),
        t('privacyPage.howWeUseYourInformation.item2'),
        t('privacyPage.howWeUseYourInformation.item3'),
        t('privacyPage.howWeUseYourInformation.item4'),
      ]
    },
    {
      heading: t('privacyPage.informationSharing.heading'),
      content: t('privacyPage.informationSharing.content')
    },
    {
      heading: t('privacyPage.dataSecurity.heading'),
      content: t('privacyPage.dataSecurity.content')
    },
    {
      heading: t('privacyPage.yourRights.heading'),
      content: [
        t('privacyPage.yourRights.item1'),
        t('privacyPage.yourRights.item2'),
        t('privacyPage.yourRights.item3'),
        t('privacyPage.yourRights.item4'),
      ]
    },
    {
      heading: t('privacyPage.contactUs.heading'),
      content: t('privacyPage.contactUs.content')
    }
  ];

  return (
    <StaticPageLayout 
      title={t('privacyPage.title')}
      sections={sections}
      lastUpdated="March 15, 2024"
    />
  );
};