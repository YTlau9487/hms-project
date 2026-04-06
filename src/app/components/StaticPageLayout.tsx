import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

interface PageSection {
  heading: string;
  content: string | string[];
}

interface StaticPageLayoutProps {
  title: string;
  sections: PageSection[];
  lastUpdated?: string;
}

export const StaticPageLayout: React.FC<StaticPageLayoutProps> = ({ 
  title, 
  sections,
  lastUpdated 
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Check sessionStorage for interface context (set by Navbar when staff switches views)
  const isCustomerView = sessionStorage.getItem('interfaceContext') === 'customer';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => {
              navigate(isCustomerView ? '/?view=customer' : '/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:opacity-80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('staticPages.back')}</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
            <h1 className="text-3xl font-bold">{title}</h1>
            {lastUpdated && (
              <p className="text-primary-foreground/80 mt-2 text-sm">
                {t('staticPages.lastUpdated')}: {lastUpdated}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-bold mb-4">{section.heading}</h2>
                  {Array.isArray(section.content) ? (
                    <ul className="space-y-2 text-muted-foreground">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};