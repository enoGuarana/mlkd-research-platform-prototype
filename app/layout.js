import "./globals.css";
import Link from "next/link";

const navItems = [
  { href: "/", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/projects", label: "Projects" },
  { href: "/publications", label: "Publications" },
  { href: "/dissertations", label: "Dissertations" },
  { href: "/events", label: "Events" },
  { href: "https://lumlis.tecnico.ulisboa.pt/", label: "Reading Group", external: true },
  { href: "/open-positions", label: "Open positions" },
  { href: "/admin", label: "Admin" },
];

export const metadata = {
  title: "MLKD Research Platform Prototype",
  description:
    "A Next.js modular prototype for the MLKD research platform with research, publication, people, opportunities and admin sections.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="MLKD home">
            <img src="/logo512.png" alt="MLKD logo" />
            <span>MLKD</span>
          </Link>

          <nav className="main-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
