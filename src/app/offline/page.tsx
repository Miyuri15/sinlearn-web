import Link from "next/link";

export const metadata = {
  title: "Offline | SinhalaLearn",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-6 text-gray-900 dark:bg-gray-900 dark:text-white">
      <section className="w-full max-w-md rounded-lg border border-gray-200 p-6 shadow-sm dark:border-gray-800">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Offline mode
        </p>
        <h1 className="mt-3 text-2xl font-semibold">SinhalaLearn is offline</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          The app shell is available, but live chat, uploads, voice features,
          and evaluations need a connection. Reconnect and continue from your
          last saved session.
        </p>
        <Link
          href="/auth/sign-in"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          Return to app
        </Link>
      </section>
    </main>
  );
}
