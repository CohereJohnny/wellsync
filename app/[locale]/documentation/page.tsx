import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Book, FileText, Code, Terminal } from 'lucide-react';

interface DocCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function DocCard({ title, description, href, icon }: DocCardProps) {
  return (
    <Link href={href} className="block no-underline">
      <Card className="h-full p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
        <div className="flex items-start">
          <div className="mr-4 text-blue-500 mt-1">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function Documentation({ params: { locale } }: { params: { locale: string } }) {
  // Enable static rendering - removed unstable_setRequestLocale as it's not available
  
  const t = await getTranslations({ locale, namespace: 'common.navigation' });
  
  const documentationSections = [
    {
      title: 'Getting Started',
      items: [
        {
          title: 'Components',
          description: 'Overview of the UI components used in the WellSync application',
          href: `/documentation/components`,
          icon: <Code size={24} />
        }
      ]
    },
    {
      title: 'API Reference',
      items: [
        {
          title: 'Chat API',
          description: 'API documentation for the AI chat functionality',
          href: `/documentation/api-chat`,
          icon: <Terminal size={24} />
        },
        {
          title: 'Orders API',
          description: 'API documentation for the parts ordering system',
          href: `/documentation/api-orders`,
          icon: <Terminal size={24} />
        },
        {
          title: 'Dispatches API',
          description: 'API documentation for the parts dispatch system',
          href: `/documentation/api-dispatches`,
          icon: <Terminal size={24} />
        },
        {
          title: 'Search Faults API',
          description: 'API documentation for the fault search functionality',
          href: `/documentation/api-search-faults`,
          icon: <Terminal size={24} />
        },
        {
          title: 'Search Faults RPC',
          description: 'RPC documentation for the fault search functionality',
          href: `/documentation/rpc-search-faults`,
          icon: <Terminal size={24} />
        }
      ]
    },
    {
      title: 'Backend Systems',
      items: [
        {
          title: 'Semantic Search',
          description: 'Documentation for the semantic search backend',
          href: `/documentation/semantic-search-backend`,
          icon: <FileText size={24} />
        },
        {
          title: 'Tool Schemas',
          description: 'Documentation for the AI tool schemas',
          href: `/documentation/tool-schemas`,
          icon: <FileText size={24} />
        }
      ]
    },
    {
      title: 'Resources',
      items: [
        {
          title: 'Demo Script',
          description: 'Script for demonstrating the WellSync application',
          href: `/documentation/demo-script`,
          icon: <Book size={24} />
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">WellSync Documentation</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Find comprehensive guides and documentation to help you understand and use the WellSync application effectively.
        </p>
      </div>

      {documentationSections.map((section) => (
        <section key={section.title} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.items.map((item) => (
              <DocCard 
                key={item.href}
                title={item.title}
                description={item.description}
                href={item.href}
                icon={item.icon}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
} 