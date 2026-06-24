import { Link } from 'react-router-dom';


export default function Header() {
  return (
    <header className="w-full flex items-center justify-between p-4 border-b bg-[#e6e7ed] border-[#c1c2c7]">
      {/* Left: logo + title */}
      <Link to="/">
        <h1 className="text-lg font-bold text-[#2959aa] flex items-center">
          <img
            src="/DeiC1.png"      
            alt="Deic logo"
            className="h-12 mr-2"
          />
          HaveIBeenPwned
        </h1>
      </Link>

      {/* Right: action buttons */}
      <div className="flex items-center space-x-4">
        <a href="http://localhost:8000/" target="_blank" rel="noopener noreferrer">
          <button className="bg-blue-600 text-white px-3 py-1 rounded hover:opacity-90">
            API
          </button>
        </a>
        <Link to="/email">
          <button className="bg-green-600 text-white px-3 py-1 rounded hover:opacity-90">
            Email
          </button>
        </Link>
        <Link to="/passwords">
          <button className="bg-green-600 text-white px-3 py-1 rounded hover:opacity-90">
            Passwords
          </button>
        </Link>
      </div>
    </header>
  );
}