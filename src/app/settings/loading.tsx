export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="mt-3 h-4 w-72 max-w-full bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse space-y-4">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse space-y-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
