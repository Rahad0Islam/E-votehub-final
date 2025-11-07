import React, { useEffect, useRef, useState } from 'react'
import { changePassword, getUserVoteHistory, updateCoverImage as apiUpdateCoverImage, updateProfileImage as apiUpdateProfileImage } from '../lib/api'

// --- THEME-AWARE COLOR MAPPING (Copied from Home.jsx for consistency) ---
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
// --- END COLOR MAP ---

// Mock API Functions (Unchanged)
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const getUser = () => {
  return JSON.parse(localStorage.getItem('user'))
};

// Custom component for message display (replaces alert()) (Theming applied)
const StatusMessage = ({ message, type }) => {
  if (!message) return null;
  
  // Adjusted for new theme colors and better visibility
  const baseClasses = "fixed top-4 left-1/2 -translate-x-1/2 p-4 text-sm font-medium border rounded-xl z-50 transition-all duration-300 shadow-2xl";
  let typeClasses;
  
  if (type === 'error') {
    // Brighter, more consistent error
    typeClasses = 'bg-red-700/80 border-red-500 text-white shadow-red-900/60 backdrop-blur-sm'; 
  } else if (type === 'success') {
    // Theme accent success
    typeClasses = `bg-[${ACCENT_PRIMARY_HEX}]/80 dark:bg-[${ACCENT_SECONDARY_HEX}]/80 border-[${ACCENT_PRIMARY_HEX}] dark:border-[${ACCENT_SECONDARY_HEX}] text-white shadow-lg shadow-[${ACCENT_PRIMARY_HEX}]/40 dark:shadow-[${ACCENT_SECONDARY_HEX}]/40 backdrop-blur-sm`;
  } else {
      return null;
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span className="font-bold mr-2">{type === 'error' ? 'ERROR::' : 'SUCCESS::'}</span> {message}
    </div>
  );
};

// Helper components for clean presentation (Theming applied)
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-800 last:border-b-0">
    <span className={`${COLOR_MAP.TEXT_SECONDARY} font-mono text-xs uppercase tracking-wider`}>{label}</span>
    <span className={`${COLOR_MAP.TEXT_MAIN} font-semibold text-base`}>{value || '—'}</span>
  </div>
);

// --- REMOVED ActionItem Component ---


export default function Profile(){
  // Initialize state using the mock getUser function
  const [user, setUserState] = useState(()=> getUser() || {}) // Added fallback for user object
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)

  const [showPwd, setShowPwd] = useState(false)
  const [pwdOld, setPwdOld] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdNew2, setPwdNew2] = useState('')

  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const coverInput = useRef(null)
  const avatarInput = useRef(null)

  const showMessage = (msg, type = 'error') => {
    setMessage(msg);
    setMessageType(type);
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 5000);
  };

  // Sync state with localStorage changes
  useEffect(()=>{
    const onStorage = ()=> setUserState(getUser() || {}) // Added fallback for user object
    window.addEventListener('storage', onStorage)
    const id = setInterval(onStorage, 800) // Poll for changes as 'storage' event is inconsistent
    return ()=> { window.removeEventListener('storage', onStorage); clearInterval(id); }
  },[])

  useEffect(()=>{
    setLoadingHistory(true)
    getUserVoteHistory().then(setHistory).catch(()=>{}).finally(()=> setLoadingHistory(false))
  },[])

  const onPickCover = ()=> coverInput.current?.click()
  const onPickAvatar = ()=> avatarInput.current?.click()

  const onCoverChange = async (e)=>{
    const file = e.target.files?.[0]
    if(!file) return
    
    setMessage(null);
    setBusy(true);

    try{ 
      // Use real API to update cover image (persists in DB)
      const updated = await apiUpdateCoverImage(file); 
      if(updated){ 
        setUserState(updated);
        showMessage('Cover image successfully updated.', 'success');
      } 
    }
    catch(err){ 
      showMessage(err?.response?.data?.message || err?.message || 'Failed to update cover image.', 'error');
    }
    finally{ 
      setBusy(false);
      e.target.value = null; 
    }
  }
  
  const onAvatarChange = async (e)=>{
    const file = e.target.files?.[0]
    if(!file) return

    setMessage(null);
    setBusy(true);

    try{ 
      // Use real API to update profile image (persists in DB)
      const updated = await apiUpdateProfileImage(file); 
      if(updated){ 
        setUserState(updated);
        showMessage('Profile photo successfully updated.', 'success');
      } 
    }
    catch(err){ 
      showMessage(err?.response?.data?.message || err?.message || 'Failed to update profile photo.', 'error');
    }
    finally{ 
      setBusy(false); 
      e.target.value = null;
    }
  }

  const onChangePassword = async ()=>{
    if(!pwdOld || !pwdNew || !pwdNew2){ return showMessage('All password fields are required') }
    if(pwdNew !== pwdNew2){ return showMessage('New passwords do not match') }
    try{
      setBusy(true)
      await changePassword({ OldPassword: pwdOld, NewPassword: pwdNew })
      setPwdOld(''); setPwdNew(''); setPwdNew2(''); setShowPwd(false)
      showMessage('Password updated successfully', 'success')
    }catch(err){
      showMessage(err?.response?.data?.message || 'Failed to update password')
    }finally{ setBusy(false) }
  }

  // --- Design Variables (Updated with COLOR_MAP) ---
  const accentColorClass = COLOR_MAP.SCI_ACCENT_TEXT; // e.g., text-[blue] dark:text-[lightblue]
  const panelBgClass = COLOR_MAP.SCI_PANEL; // e.g., bg-white dark:bg-[#111827]
  const cardBorderClass = 'border-gray-200 dark:border-slate-800'; // Theme consistent border
  const shadowEffectClass = 'shadow-xl shadow-gray-300/50 dark:shadow-gray-900/50';

  // Enhanced primary button class (Updated with COLOR_MAP)
  const accentButtonClass = (primary = true) => "px-4 py-2 text-sm rounded-lg transition duration-200 font-semibold shadow-lg " +
    (primary 
      // Primary button uses SCI_ACCENT for background
      ? `${COLOR_MAP.SCI_ACCENT} text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90`
      // Secondary button uses border/text with hover background effect
      : `border border-gray-400 dark:border-gray-600 ${COLOR_MAP.TEXT_MAIN} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800/50`);
                            
  const panelClass = `p-6 rounded-xl border ${cardBorderClass} ${panelBgClass} ${shadowEffectClass}`;

  // Check if user is null or empty object, provide fallback defaults
  const safeUser = user || {};
  const fullName = safeUser.FullName || 'UNKNOWN USER';
  const userName = safeUser.UserName || 'user.name';
  const role = safeUser.Role ? safeUser.Role.toUpperCase() : 'VOTER';


  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 relative ${COLOR_MAP.BG_COLOR} min-h-screen`}>
      <StatusMessage message={message} type={messageType} />

      {/* --- Header / Cover Area --- */}
      <div className={`relative rounded-xl overflow-hidden shadow-2xl ${shadowEffectClass} border ${cardBorderClass} mb-8`}>
        
        {/* Cover Image */}
        <div className={`aspect-[3/1] ${panelBgClass}`}>
          {safeUser.CoverImage ? (
            <img 
              src={safeUser.CoverImage} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01] opacity-90" 
              alt="cover" 
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${COLOR_MAP.TEXT_SECONDARY} text-lg font-mono`}>
              [COVER: UPLOAD REQUIRED]
            </div>
          )}
        </div>
        
        {/* Change Cover Button */}
        <button 
          onClick={onPickCover} 
          disabled={busy} 
          className={`absolute top-4 right-4 z-10 ${accentButtonClass(true)}`}
        >
          {busy ? 'SYNCHRONIZING...' : 'CHANGE COVER'}
        </button>
        <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={onCoverChange} />

        {/* Profile Avatar and Info Block */}
        <div className="absolute bottom-0 rounded-full left-10 flex items-end gap-3 z-20"> 
          
        
          <div className={`relative w-32 h-32 border-4 md:w-40 md:h-40 rounded-full overflow-hidden ${panelBgClass} shadow-2xl shadow-gray-800/30 dark:shadow-black/70 group border-white dark:border-slate-900`}>
            {safeUser.ProfileImage ? (
              <img 
                src={safeUser.ProfileImage} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                alt="avatar" 
              />
            ) : (
              // Fallback
              <div className={`w-full h-full flex items-center justify-center text-5xl font-bold ${accentColorClass}`}>
                {fullName[0]}
              </div>
            )}
            
            {/* Change Avatar Button (Overlay) */}
            <button 
              onClick={onPickAvatar} 
              disabled={busy} 
              className="absolute inset-0 w-full h-full rounded-full bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera mb-1"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5L14.5 4z"/><circle cx="12" cy="13" r="3"/></svg>
              <span className="text-xs font-semibold">{busy ? 'UPLOADING...' : 'CHANGE AVATAR'}</span>
            </button>
            <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </div>
          
          {/* User Display Name */}
          <div className="pb-4 font-sans hidden md:block">
            <div className={`text-3xl font-extrabold bg-clip-text text-transparent 
                bg-gradient-to-r from-gray-900 to-gray-500 
                dark:from-white dark:to-gray-400`
            }>
              {fullName}
            </div>
            <div className={`text-sm ${COLOR_MAP.TEXT_SECONDARY} font-mono italic`}>
              @{userName}
            </div>
            <div className={`mt-2 text-xs px-3 py-1 rounded-full bg-black/40 dark:bg-white/10 ${accentColorClass} font-semibold inline-block border border-gray-400/40 dark:border-slate-700/40`}>
              ACCESS LEVEL: {role}
            </div>
          </div>
        </div>
      </div>
      
      {/* --- Body / Details Area --- */}
      <div className="mt-20 grid lg:grid-cols-3 gap-6">
        
        {/* About Card */}
        <div className={`lg:col-span-2 ${panelClass}`}>
          <h3 className={`text-xl font-bold mb-4 ${accentColorClass} border-b border-gray-200 dark:border-slate-700 pb-2 flex items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-cog mr-2"><circle cx="18" cy="15" r="3"/><path d="M21.7 16.4V15h-2.5m-2.2 0h-2.5V16.4M12 20a6 6 0 0 0-6-6H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6"/><path d="M18.8 17.5l-1.6 1.6l1.6 1.6"/></svg>
            [USER_DATA] :: REGISTRY RECORD
          </h3>
          <div className="text-sm space-y-4 pt-2">
            <DetailItem label="Full Name" value={safeUser.FullName} />
            <DetailItem label="Contact Email" value={safeUser.Email} />
            <DetailItem label="Gender Code" value={safeUser.Gender} />
            <DetailItem label="NID / ID" value={safeUser.NID} />
            <DetailItem label="Primary Phone" value={safeUser.PhoneNumber} />
            <DetailItem label="Date of Birth" value={safeUser.DateOfBirth ? new Date(safeUser.DateOfBirth).toLocaleDateString('en-US') : null} />
          </div>
        </div>
        
        {/* Actions Card (Now just a Quick Access Panel) */}
        <div className={panelClass}>
          <h3 className={`text-xl font-bold mb-4 ${accentColorClass} border-b border-gray-200 dark:border-slate-700 pb-2 flex items-center`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap mr-2"><path d="M11 20H13V13H17L7 5V12H3Z"/></svg>
            [SYSTEM] :: QUICK ACTIONS
          </h3>
          <div className="flex flex-col gap-3 pt-2">
            
            {/* BUTTON 1: View Vote History (Secondary Style) */}
            <button 
              onClick={()=> document.getElementById('vote-history')?.scrollIntoView({ behavior:'smooth' })}
              className={accentButtonClass(false) + ` w-full flex items-center justify-center font-mono`}
              disabled={busy}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history mr-2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
              VIEW VOTE HISTORY
            </button>

            {/* BUTTON 2: Update Password (Primary Style) */}
            <button 
              onClick={()=> setShowPwd(v=>!v)}
              className={accentButtonClass(true) + ` w-full flex items-center justify-center font-mono`}
              disabled={busy}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock mr-2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              {showPwd ? 'HIDE PASSWORD FORM' : 'UPDATE PASSWORD'}
            </button>
            
          </div>
        </div>
      </div>

      {/* Password Change Panel */}
      {showPwd && (
        <div className={`mt-6 ${panelClass}`}>
          <h3 className={`text-xl font-bold mb-4 ${accentColorClass}`}>Update Password</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <input className={`px-3 py-2 rounded-lg border ${cardBorderClass} ${COLOR_MAP.TEXT_MAIN} ${COLOR_MAP.SCI_PANEL} focus:ring-2 focus:ring-[${ACCENT_PRIMARY_HEX}] dark:focus:ring-[${ACCENT_SECONDARY_HEX}]`} type="password" placeholder="Current password" value={pwdOld} onChange={e=>setPwdOld(e.target.value)} />
            <input className={`px-3 py-2 rounded-lg border ${cardBorderClass} ${COLOR_MAP.TEXT_MAIN} ${COLOR_MAP.SCI_PANEL} focus:ring-2 focus:ring-[${ACCENT_PRIMARY_HEX}] dark:focus:ring-[${ACCENT_SECONDARY_HEX}]`} type="password" placeholder="New password" value={pwdNew} onChange={e=>setPwdNew(e.target.value)} />
            <input className={`px-3 py-2 rounded-lg border ${cardBorderClass} ${COLOR_MAP.TEXT_MAIN} ${COLOR_MAP.SCI_PANEL} focus:ring-2 focus:ring-[${ACCENT_PRIMARY_HEX}] dark:focus:ring-[${ACCENT_SECONDARY_HEX}]`} type="password" placeholder="Confirm new password" value={pwdNew2} onChange={e=>setPwdNew2(e.target.value)} />
          </div>
          <div className="mt-4 flex gap-3">
            <button className={accentButtonClass(true)} onClick={onChangePassword} disabled={busy}>Save Password</button>
            <button className={accentButtonClass(false)} onClick={()=> setShowPwd(false)} disabled={busy}>Cancel</button>
          </div>
        </div>
      )}

      {/* Vote History Panel */}
      <div id="vote-history" className={`mt-6 ${panelClass}`}>
        <h3 className={`text-xl font-bold mb-4 ${accentColorClass}`}>Your Vote History</h3>
        {loadingHistory ? (
          <div className={`${COLOR_MAP.TEXT_SECONDARY}`}>Loading...</div>
        ) : history.length === 0 ? (
          <div className={`${COLOR_MAP.TEXT_SECONDARY}`}>No votes recorded yet.</div>
        ) : (
          <ul className="space-y-3">
            {history.map(h => (
              <li key={h.id} className={`p-3 rounded-lg border ${cardBorderClass}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{h.event?.title || 'Unknown Event'}</div>
                    <div className={`text-xs ${COLOR_MAP.TEXT_SECONDARY}`}>{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                  <div className={`text-xs ${COLOR_MAP.TEXT_SECONDARY}`}>{h.event?.electionType}</div>
                </div>
                <div className="mt-2 text-sm">
                  <div className={`${COLOR_MAP.TEXT_SECONDARY}`}>You selected:</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {h.selected.map(s => (
                      <span key={s.id} className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <img src={s.profileImage || 'https://placehold.co/20x20/d1d5db/4b5563?text=U'} alt={s.fullName} className="w-5 h-5 rounded-full object-cover" />
                        <span>{s.fullName || s.id}</span>
                        {s.rank ? <span className="text-xs opacity-70">(Rank {s.rank})</span> : null}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}