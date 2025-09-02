import { ReactNode } from 'react';

interface FixturesPageHeaderProps {
  title: string;
  description: string;
}

export function FixturesPageHeader({ title, description }: FixturesPageHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}