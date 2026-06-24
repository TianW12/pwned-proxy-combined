export default function Footer() {
  return (
    <footer className="w-full border-t p-4 flex items-center justify-between bg-[#e6e7ed] text-gray-700 border-[#c1c2c7]">
      {/* Left: copyright */}
      <span className="text-sm">© {new Date().getFullYear()} Pwned Proxy</span>

      {/* Right: GitHub link + message */}
      <div className="text-sm flex items-center space-x-3">
        <a
          href="https://github.com/dtuait/pwned-proxy-combined"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          GitHub
        </a>
        <span>Get involved on GitHub!</span>
      </div>
    </footer>
  );
}