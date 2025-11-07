import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import UserDashboard from './UserDashboard.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import RequireAuth from '../components/RequireAuth.jsx'
import { logout } from '../lib/api'
import Profile from './Profile.jsx'
import PublicProfile from './PublicProfile.jsx'
// Logos are now conditionally referenced based on the current theme state.

// --- Color Palette Mapping ---
const ACCENT_PRIMARY_HEX = '#1E3A8A'; // Primary Blue (Deep/Navy)
const ACCENT_SECONDARY_HEX = '#3B82F6'; // Link Blue (Bright/Lighter)

const COLORS = {
  BG_LIGHT: 'bg-[#ECEBEB]', // General app background (outside container)
  BG_DARK: 'dark:bg-[#1A2129]', // General app background (outside container)
  
  // NAVBAR/PANEL BACKGROUND COLORS MATCHED TO LOGO BACKGROUNDS
  PANEL_LIGHT: 'bg-[#ECEBEB]', 
  PANEL_DARK: 'dark:bg-[#1A2129]',
  
  TEXT_LIGHT: 'text-gray-900',
  TEXT_DARK: 'dark:text-white',
  ACCENT_TEXT_MAIN: `text-[${ACCENT_PRIMARY_HEX}] dark:text-[${ACCENT_SECONDARY_HEX}]`,
  ACCENT_BG_MAIN: `bg-[${ACCENT_PRIMARY_HEX}] dark:bg-[${ACCENT_SECONDARY_HEX}]`,
};
// --- End Color Palette Mapping --


export default function App(){
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('accessToken'))
  const [user, setUser] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('user')||'null')}catch{return null} })
  const navigate = useNavigate()
  const location = useLocation() // Hook to get current path for active link highlighting

  // Apply theme class to HTML element
  useEffect(()=>{
    const root = document.documentElement
    if(theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  },[theme])

  // Listener for storage changes (e.g., login/logout)
  useEffect(()=>{
    const onStorage = ()=>{
      setAuthed(!!localStorage.getItem('accessToken'))
      try{ setUser(JSON.parse(localStorage.getItem('user')||'null')) }catch{ setUser(null) }
    }
    window.addEventListener('storage', onStorage)
    const id = setInterval(onStorage, 800)
    return ()=>{ window.removeEventListener('storage', onStorage); clearInterval(id) }
  },[])

  const doLogout = async ()=>{
    await logout()
    setAuthed(false)
    setUser(null)
    navigate('/login')
  }

  // Function to determine link styling based on active path
  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    
    // Base classes for all links
    let classes = `px-3 py-1 rounded-lg font-medium transition-all duration-200 text-sm md:text-base whitespace-nowrap`;
    
    if (isActive) {
      // Active state: prominent accent background
      classes += ` ${COLORS.ACCENT_BG_MAIN} text-white shadow-md shadow-blue-500/50 dark:shadow-blue-900/50`;
    } else {
      // Inactive state: neutral text, accent on hover
      classes += ` ${COLORS.TEXT_LIGHT} ${COLORS.TEXT_DARK} hover:text-[${ACCENT_PRIMARY_HEX}] dark:hover:text-[${ACCENT_SECONDARY_HEX}] hover:bg-gray-50 dark:hover:bg-gray-700/50`;
    }
    return classes;
  };
  
  // Conditionally select the logo path based on the current theme
  // Using the exact paths specified by the user: EVoteHubLogoDarkMode.jpeg and EVoteHubLogoLightMode.png
  const logoSrc = theme === 'dark' ? '/EVoteHubLogoDarkMode.jpeg' : '/EVoteHubLogoLightMode.png';

  return (
    // Apply body background and text colors
    <div className={`min-h-screen ${COLORS.BG_LIGHT} ${COLORS.BG_DARK} ${COLORS.TEXT_LIGHT} ${COLORS.TEXT_DARK} transition-colors font-sans`}>
      <header 
        // Panel colors updated to match logo backgrounds
        className={`sticky top-0 z-50 ${COLORS.PANEL_LIGHT}/95 ${COLORS.PANEL_DARK}/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-xl dark:shadow-black/30`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between"> {/* Increased padding-y (py-4) for more height */}
          
          {/* Logo - Circular, taller, and NO BORDER/RING */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              // Source changes based on theme state
              src={logoSrc} 
              alt="E-voteHub Logo" 
              // Removed ring-2 classes, kept circular and height styling
              className="h-18 sm:h-20 object-contain w-auto rounded-full" 
            />
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-6 text-base relative">
            <Link to="/" className={getLinkClasses('/')}>Home</Link>
            
            {!authed ? (
              <>
                <Link to="/login" className={getLinkClasses('/login')}>Login</Link>
                <Link to="/register" className={getLinkClasses('/register')}>Register</Link>
              </>
            ) : (
              <>
                <Link to="/user" className={getLinkClasses('/user')}>Dashboard</Link>
                <Link to="/profile" className={getLinkClasses('/profile')}>Profile</Link>
                {localStorage.getItem('role')==='admin' && <Link to="/admin" className={getLinkClasses('/admin')}>Admin</Link>}
              </>
            )}

            {/* Theme Toggle Button - Rectangular with full text */}
            <button 
              onClick={()=> setTheme(t => t==='dark'?'light':'dark')} 
              className={`ml-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap 
                ${theme === 'dark' 
                  ? 'bg-gray-700 text-white border-2 border-white hover:bg-white hover:text-gray-900' 
                  : `bg-[${ACCENT_PRIMARY_HEX}] text-white border-2 border-[${ACCENT_PRIMARY_HEX}] hover:opacity-80`
                }`
              }
            >
              {theme==='dark'?'Light Mode':'Dark Mode'}
            </button>
            
            {/* User Avatar and Logout */}
            {authed && user && (
              <>
                {/* Avatar size matched to the new logo height */}
                <Link to="/profile" className={`hidden sm:block w-11 h-11 rounded-full ring-2 ring-current ${COLORS.ACCENT_TEXT_MAIN} transition-all overflow-hidden`}>
                  <img 
                    src={user.ProfileImage || `https://placehold.co/44x44/d1d5db/4b5563?text=${user.FullName?.charAt(0)||'U'}`} 
                    className="w-full h-full object-cover" 
                    alt="avatar" 
                  />
                </Link>
                <button 
                  onClick={doLogout} 
                  className={`px-3 py-1.5 rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-colors text-sm whitespace-nowrap`}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={<RequireAuth><UserDashboard /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/u/:id" element={<RequireAuth><PublicProfile /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth requiredRole="admin"><AdminDashboard /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}