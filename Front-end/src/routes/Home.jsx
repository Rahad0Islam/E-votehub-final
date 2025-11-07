import React from 'react';
import { Link } from 'react-router-dom';

// --- THEME-AWARE COLOR MAPPING ---
// Defined color variables for easy adjustment and theme consistency
const ACCENT_PRIMARY_HEX = '#1E3A8A'; // Primary Blue (Deep/Navy)
const ACCENT_SECONDARY_HEX = '#3B82F6'; // Link Blue (Bright/Lighter)

const COLOR_MAP = {
  // New Backgrounds: #ECEBEB (Light) and #1A2129 (Dark)
  BG_COLOR: 'bg-[#ECEBEB] dark:bg-[#1A2129]', 
  
  // Background for primary sections (Hero/Footer)
  SCI_BG: 'bg-[#ECEBEB] dark:bg-[#1A2129]', 
  
  // Background for cards and panels
  SCI_PANEL: 'bg-white dark:bg-[#111827]', // Using lighter/darker shades for contrast in card panels
  
  // Text colors for dark/light contrast
  TEXT_MAIN: 'text-gray-900 dark:text-white',
  TEXT_SECONDARY: 'text-gray-600 dark:text-slate-400',
  
  // Accent colors for buttons/highlights
  SCI_ACCENT: `bg-[${ACCENT_PRIMARY_HEX}] dark:bg-[${ACCENT_SECONDARY_HEX}]`,
  SCI_ACCENT_TEXT: `text-[${ACCENT_PRIMARY_HEX}] dark:text-[${ACCENT_SECONDARY_HEX}]`,

  //Shade color for Headlines
  SHADE_MAIN: 'text-gray-900 dark:white',
  SHADE_SECONDARY: 'text-gray-500 dark:text-gray-500',
};

// --- Inline SVG Icons (Replacing lucide-react for single-file mandate) ---
const LockIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>);
const TrendingUpIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>);
const ShieldCheckIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7c0 4.75 2.5 7.5 7.5 7.5S20 17.75 20 13z"></path><path d="m9 12 2 2 4-4"></path></svg>);
const UsersIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const MailIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.83 1.83 0 0 1-2.06 0L2 7"></path></svg>);

// --- DATA STRUCTURES ---
const stats = [
  { value: 'E2E', label: 'Encrypted Ballots', icon: LockIcon, color: 'text-purple-600 dark:text-purple-400' },
  { value: 'Audit-Ready', label: 'Immutable Logs', icon: TrendingUpIcon, color: 'text-cyan-600 dark:text-cyan-400' },
  { value: 'Verified', label: 'Voter Identity', icon: ShieldCheckIcon, color: 'text-green-600 dark:text-green-400' },
  { value: 'Social Feed', label: 'Candidate Engagement', icon: UsersIcon, color: 'text-yellow-600 dark:text-yellow-400' },
];

const features = [
  {
    icon: LockIcon,
    title: 'Zero-Trust Security',
    description: 'Protecting voter data and ballot integrity with End-to-End Encryption, guaranteeing absolute anonymity and privacy.',
  },
  {
    icon: TrendingUpIcon,
    title: 'Full Transparency & Audit',
    description: 'Tamper-proof records of all system activities create 100% accountability through immutable, exportable audit trails.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Dual-Phase Workflow',
    description: 'A dedicated Social Campaign Phase seamlessly transitions into a secure, verifiable Voting Phase, streamlining the election process.',
  },
  {
    icon: UsersIcon,
    title: 'Engaging Candidate Tools',
    description: 'Nominees can run dynamic social campaigns and engage voters, driving higher participation and more informed choices.',
  },
];

// --- Sub-Components ---

const StatCard = ({ value, label, icon: Icon, color }) => (
  <div className={`p-6 rounded-xl ${COLOR_MAP.SCI_PANEL} shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-700 text-center transition hover:scale-[1.02]`}>
    <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
    <div className={`text-4xl font-extrabold mb-1 ${color}`}>{value}</div>
    <div className={`text-sm ${COLOR_MAP.TEXT_SECONDARY} font-mono`}>{label}</div>
  </div>
);

const FeatureCard = ({ title, description, icon: Icon }) => (
  <div className={`p-6 rounded-xl ${COLOR_MAP.SCI_PANEL} transition duration-300 hover:shadow-xl border-t-2 border-slate-300 dark:border-slate-700`}>
    {/* Icon color uses accent text */}
    <Icon className={`w-6 h-6 ${COLOR_MAP.SCI_ACCENT_TEXT} mb-3`} /> 
    <h3 className={`text-xl font-bold mb-2 ${COLOR_MAP.TEXT_MAIN}`}>{title}</h3>
    <p className={`text-sm ${COLOR_MAP.TEXT_SECONDARY}`}>{description}</p>
  </div>
);

const Footer = () => (
  <footer className={`${COLOR_MAP.SCI_BG} border-t border-gray-200 dark:border-gray-700 mt-16 py-12`}>
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
      
      {/* 1. Logo and Mission - FIXED TO MATCH NAVBAR/HERO STYLE */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center mb-4">
            {/* Theme-aware E-VoteHub text using gradient */}
            <span 
                className={`text-xl font-bold bg-clip-text text-transparent 
                    bg-gradient-to-r 
                    from-gray-900 via-gray-700 to-gray-500 
                dark:from-white dark:to-gray-500`}
            >
                E-VoteHub
            </span>
        </div>
        <p className={`text-xs ${COLOR_MAP.TEXT_SECONDARY} max-w-xs`}>
          Unifying secure online voting with dynamic social campaigning to drive democratic engagement.
        </p>
      </div>

      {/* 2. Navigation Links */}
      <div>
        <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wider`}>Platform</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Home</Link></li>
          <li><Link to="/user" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Dashboard</Link></li>
          <li><Link to="/profile" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Profile Settings</Link></li>
        </ul>
      </div>

      {/* 3. Resources/Legal Links */}
      <div>
        <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wider`}>Resources</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Security Policy</a></li>
          <li><a href="#" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Terms of Service</a></li>
          <li><a href="#" className={`text-slate-600 dark:text-slate-400 hover:${COLOR_MAP.SCI_ACCENT_TEXT} transition`}>Privacy Statement</a></li>
        </ul>
      </div>

      {/* 4. Contact */}
      <div>
        <h4 className={`text-sm font-semibold mb-3 uppercase tracking-wider`}>Contact</h4>
        <p className={`text-sm ${COLOR_MAP.TEXT_SECONDARY} flex items-center mb-2`}>
            <MailIcon className={`w-4 h-4 mr-2 ${COLOR_MAP.SCI_ACCENT_TEXT}`}/>
            support@evotehub.io
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-600">
            [University of Science and Technology, Bangladesh]
        </p>
      </div>

    </div>

    {/* Bottom Copyright and ID */}
    <div className="max-w-6xl mx-auto px-4 mt-10 pt-6 border-t border-gray-300 dark:border-slate-700 text-center">
      <p className="text-xs text-slate-500 dark:text-slate-600">
        &copy; {new Date().getFullYear()} E-VoteHub. All rights reserved. | App ID: <span className="font-mono text-gray-400 dark:text-slate-700/50">__app_id__</span>
      </p>
    </div>
  </footer>
);

// --- Main Home Component ---

export default function Home() {
  const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  return (
    <div className={`min-h-screen ${COLOR_MAP.BG_COLOR}`}>
      {/* 1. HERO SECTION */}
      <section className={`relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden ${COLOR_MAP.SCI_BG}`}>
        {/* Background Visual Element (Subtle grid/lines) */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#9ca3af_1px,transparent_1px)] dark:bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative max-w-4xl mx-auto text-center px-4 z-10">
          <h1 
            className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight bg-clip-text text-transparent 
              bg-gradient-to-r 
              from-gray-800 to-gray-500 
                dark:from-white dark:to-gray-500`
            }
          >
            Secure Digital Democracy. <br className="hidden md:inline"/>Unbreakable Integrity.
          </h1>
          <p className={`text-xl max-w-2xl mx-auto mb-10 text-gray-700 dark:text-slate-300`}>
            E-VoteHub unifies social campaigning and secure, auditable online voting in a single, professional platform for the digital age.
          </p>
          <div className="flex justify-center space-x-4">
            {/* CTA 1: Register */}
            <Link 
              to="/register" 
              className={`px-8 py-3 text-lg font-semibold rounded-xl text-white ${COLOR_MAP.SCI_ACCENT} shadow-lg shadow-[${ACCENT_PRIMARY_HEX}]/40 dark:shadow-[${ACCENT_SECONDARY_HEX}]/40 transition duration-300 transform hover:scale-105 hover:opacity-90`}
            >
              Get Started Now
            </Link>
            {/* CTA 2: Login */}
            <Link 
              to="/login" 
              className={`px-8 py-3 text-lg font-semibold rounded-xl border border-gray-800 dark:border-gray-400 ${COLOR_MAP.TEXT_MAIN} transition duration-300 transform hover:bg-gray-100 dark:hover:bg-slate-800/50`}
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES GRID */}
      <section className={`py-20 ${COLOR_MAP.SCI_BG} border-t border-gray-300 dark:border-slate-700`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${COLOR_MAP.TEXT_MAIN}`}>
            Built for Trust and Engagement
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
      
      {/* 3. PLATFORM STATS */}
      <section className={`py-20 ${COLOR_MAP.SCI_PANEL} border-t border-b border-gray-200 dark:border-slate-800`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${COLOR_MAP.TEXT_MAIN}`}>
            Key Architectural Pillars
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIVE SECURITY MONITOR PREVIEW */}
      <section className={`py-20 ${COLOR_MAP.SCI_BG}`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          
          <div className="lg:w-1/2">
            <h2 
              className={`text-4xl font-extrabold mb-4 bg-clip-text text-transparent 
                bg-gradient-to-r 
                from-gray-900 via-gray-700 to-gray-500 
                dark:from-white dark:to-gray-500`
              }
            >
              Unrivaled Security & Auditing
            </h2>
            <p className={`text-lg mb-6 text-gray-700 dark:text-slate-300`}>
              Every step of the process, from registration to final tally, is tracked in a transparent, tamper-evident log, meeting the highest standards for electoral integrity.
            </p>
            <ul className={`space-y-3 ${COLOR_MAP.TEXT_SECONDARY}`}>
                <li className='flex items-start'><ShieldCheckIcon className="w-5 h-5 mr-3 mt-1 text-green-600 dark:text-green-400 flex-shrink-0"/> Multi-Factor Voter Authentication (OTP/2FA)</li>
                <li className='flex items-start'><LockIcon className="w-5 h-5 mr-3 mt-1 text-purple-600 dark:text-purple-400 flex-shrink-0"/> Anonymous, Encrypted Ballot Storage</li>
                <li className='flex items-start'><TrendingUpIcon className="w-5 h-5 mr-3 mt-1 text-cyan-600 dark:text-cyan-400 flex-shrink-0"/> Real-time System Security Monitoring</li>
            </ul>
          </div>
          
          {/* Visual: Live Monitor Panel */}
          <div className="lg:w-1/2 w-full">
            <div className={`w-full h-72 rounded-xl ${COLOR_MAP.SCI_PANEL} p-6 shadow-xl flex flex-col justify-between border-4 border-slate-300 dark:border-slate-700`}>
                <div className="text-xs font-mono text-gray-700 dark:text-yellow-400 mb-4">
                    [LOG] 09:42:31: Event 4A-7C initialized. Hash: 8fa0d...<br/>
                    [LOG] 09:42:35: Voter ID 2022331097 authenticated via 2FA. Session: OK<br/>
                    [ALERT] 09:42:40: IP 10.0.0.1 failed login attempt (3/5). Watchlist: ACTIVE<br/>
                    [LOG] 09:42:45: Ballot submitted. Status: Encrypted. Block: 0x4a7c
                </div>
                <div className="text-center p-4 bg-gray-100/50 dark:bg-black/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700/50">
                    <span className={`text-4xl mx-auto ${COLOR_MAP.SCI_ACCENT_TEXT} animate-pulse`}>🔒</span>
                    <p className={`mt-2 text-sm italic text-cyan-800 dark:text-yellow-200`}>Live Secure Voting System: Operational</p>
                    <div className={`mt-2 text-xs font-mono ${COLOR_MAP.SCI_ACCENT_TEXT}`}>
                      &gt; Connection: Secured [256bit] | App: {currentAppId}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section className={`py-16 ${COLOR_MAP.SCI_PANEL} border-t border-gray-200 dark:border-slate-800`}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 
            className={`text-4xl font-extrabold mb-4 bg-clip-text text-transparent 
              bg-gradient-to-r 
             from-gray-900 via-gray-700 to-gray-500 
                dark:from-white dark:to-gray-500`
            }
          >
            Ready to Uphold Electoral Integrity?
          </h2>
          <p className={`text-xl mb-8 text-gray-700 dark:text-slate-300`}>
            Begin your journey towards a transparent and engaging election today.
          </p>
          <Link 
            to="/register" 
            className={`inline-flex items-center px-8 py-3 text-lg font-semibold rounded-xl text-white ${COLOR_MAP.SCI_ACCENT} shadow-lg shadow-[${ACCENT_PRIMARY_HEX}]/40 dark:shadow-[${ACCENT_SECONDARY_HEX}]/40 transition duration-300 transform hover:scale-105 hover:opacity-90`}
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* 6. PERSISTENT FOOTER */}
      <Footer />
    </div>
  );
}