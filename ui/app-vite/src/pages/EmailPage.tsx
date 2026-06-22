import EmailChecker from '../features/email/EmailChecker';

export default function EmailPage() {
  return (
    <div className="relative">
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-[#2563EB]">Have I </span>
          <span className="text-[#C7E333]">Been </span>
          <span className="text-gray-700">Pawned?</span>
        </h1>
        <p className="text-lg text-gray-800">
          Check if your email address has been compromised in a data breach.
        </p>
        <EmailChecker />
      </main>
    </div>
  );
}
