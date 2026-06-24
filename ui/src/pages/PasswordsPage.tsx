import PasswordChecker from '../features/passwords/PasswordChecker';

export default function PasswordsPage() {
  return (
    <div className="relative">
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-[#2563EB]">Pwned </span>
          <span className="text-[#C7E333]">Passwords</span>
        </h1>
        <p className="text-lg text-gray-800">
          Find out if a password appears in known data breaches.
        </p>
        <PasswordChecker />
      </main>
    </div>
  );
}