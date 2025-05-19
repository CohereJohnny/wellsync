'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

interface HeaderNavProps {
  appName?: string;
}

export default function HeaderNav({ appName = "GridSync AI" }: HeaderNavProps) {
  const pathname = usePathname();
  const locale = useLocale();
  
  // Define navigation items with hardcoded labels
  const navItems = [
    { label: 'Dashboard', href: `/${locale}` },
    { label: 'Transformers', href: `/${locale}/transformer` },
    { label: 'Documentation', href: `/${locale}/documentation` },
  ];

  // Use inline styles for guaranteed rendering regardless of CSS loading
  const headerStyle = {
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    width: '100%',
    borderBottom: '1px solid #2d3748',
    backgroundColor: '#1e3a8a', // bg-blue-950 equivalent
    color: 'white',
  };

  const containerStyle = {
    display: 'flex',
    height: '3.5rem',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const logoStyle = {
    marginRight: '1rem',
    display: 'flex',
    fontWeight: 500,
    fontSize: '1.125rem',
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '1.5rem',
    marginRight: '1.5rem',
  };

  const activeLinkStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginRight: '1rem',
    marginLeft: '1rem',
    color: 'white',
    transition: 'color 0.2s',
  };

  const inactiveLinkStyle = {
    ...activeLinkStyle,
    color: 'rgba(219, 234, 254, 0.8)', // text-blue-100/80 equivalent
  };

  const langSwitcherStyle = {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  };

  const langButtonStyle = {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginLeft: '1rem',
    color: 'rgba(219, 234, 254, 0.8)',
    cursor: 'pointer',
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={logoStyle}>
          <Link href={`/${locale}`} style={{ color: 'white', textDecoration: 'none' }}>
            {appName}
          </Link>
        </div>
        
        <nav style={navStyle}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={isActive ? activeLinkStyle : inactiveLinkStyle}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div style={langSwitcherStyle}>
          {locale !== 'en' && (
            <Link 
              href={pathname.replace(`/${locale}`, '/en')} 
              style={langButtonStyle}
            >
              EN
            </Link>
          )}
          {locale !== 'es' && (
            <Link 
              href={pathname.replace(`/${locale}`, '/es')} 
              style={langButtonStyle}
            >
              ES
            </Link>
          )}
          {locale !== 'pt' && (
            <Link 
              href={pathname.replace(`/${locale}`, '/pt')} 
              style={langButtonStyle}
            >
              PT
            </Link>
          )}
        </div>
      </div>
    </header>
  );
} 