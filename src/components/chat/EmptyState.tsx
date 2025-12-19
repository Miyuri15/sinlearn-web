export default function EmptyState({
  title,
  subtitle,
}: Readonly<{
  title: string;
  subtitle?: string;
}>) {
  return (
    <div className="w-full h-full flex items-center justify-center text-center px-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
