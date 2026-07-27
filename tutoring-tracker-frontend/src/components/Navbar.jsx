import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Learners' },
  { to: '/subjects', label: 'Subjects' },
];

export default function Navbar() {
  return (
    <nav className="bg-ink border-b-4 border-gold">
      <div className="max-w-5xl mx-auto px-8 flex items-center justify-between h-16">
        <p className="text-white font-display font-bold text-lg tracking-wide">Rutegang Tutoring</p>
        <div className="flex gap-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide uppercase transition pb-1 border-b-2 ${
                  isActive
                    ? 'text-gold border-gold'
                    : 'text-white/70 border-transparent hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}