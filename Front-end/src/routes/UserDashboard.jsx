import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { 
  listEvents, voterRegister, getNominees, giveVote, countVote, 
  getAvailableBallots, nomineeRegister, getVoteStatus, 
  getVoterRegStatus, getNomineeRegStatus, getPendingNominees, 
  api as apiClient, 
  logout 
} from '../lib/api' 
import { getVoters } from '../lib/votersApi' 
import { io } from 'socket.io-client'
import { Link, useNavigate } from 'react-router-dom'
// Inline SVG Icons for Navigation and Status
const DashboardIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18.7 8.7L12 15.4 9.3 12.7 6 16"/></svg>);
const UpcomingIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);
const RunningIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const PreviousIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>);
const ProfileIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const CalendarIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>);
const TotalEventsIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 3v18M17 3v18M3 10h18M3 14h18"/></svg>);
const VoterIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const ApprovedIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const PendingIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>);
const RateIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/><path d="M6 15v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3"/></svg>);


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8002'

// --- Color Palette Mapping ---
const ACCENT_PRIMARY_HEX = '#1E3A8A'; // Primary Blue (Deep/Navy)
const ACCENT_SECONDARY_HEX = '#3B82F6'; // Link Blue (Bright/Lighter)

// Backgrounds
const BG_BODY = 'bg-[#ECEBEB] dark:bg-[#1A2129]' 
const BG_SIDEBAR = 'bg-white dark:bg-[#111827]'
const BG_CARD = 'bg-white dark:bg-[#111827]'
const BG_DARK_CARD = 'bg-[#1a202c] dark:bg-[#111827]' // Darker background for metrics on event page

// Text colors
const TEXT_PRIMARY = 'text-gray-900 dark:text-white'
const TEXT_SECONDARY = 'text-gray-600 dark:text-slate-400'
const ACCENT_PRIMARY_TEXT = `text-[${ACCENT_PRIMARY_HEX}] dark:text-[${ACCENT_SECONDARY_HEX}]`
const ACCENT_SUCCESS = 'text-[#10B981] dark:text-[#10B981]'
const ACCENT_WARNING = 'text-[#F59E0B] dark:text-[#F59E0B]'
const ACCENT_ERROR = 'text-[#DC2626] dark:text-[#DC2626]'
const ACCENT_VIOLET = 'text-violet-600 dark:text-violet-400'

// Button/Interactive elements
const BTN_PRIMARY = `bg-[${ACCENT_PRIMARY_HEX}] text-white hover:bg-[${ACCENT_SECONDARY_HEX}] transition duration-200 shadow-lg shadow-[${ACCENT_PRIMARY_HEX}]/40`
const SIDEBAR_ACCENT = 'bg-[#1E3A8A] dark:bg-[#3B82F6]'

// --- Constants for Sidebar Navigation ---
const NAV_ITEMS = {
  DASHBOARD: 'Dashboard',
  UPCOMING: 'Upcoming Events',
  RUNNING: 'Running Events',
  PREVIOUS: 'Previous Events',
  PROFILE: 'Update Profile'
}

// --- Helper Components (Refined for new Sidebar) ---

// Sidebar Navigation Item
const NavItem = ({ icon: Icon, label, isActive, onClick }) => {
  const activeClass = isActive 
    ? `bg-[#1E3A8A] text-white dark:bg-[#3B82F6] dark:text-white shadow-xl shadow-[#1E3A8A]/40 dark:shadow-[#3B82F6]/40 font-bold`
    : `text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium`;
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${activeClass}`}
    >
      <Icon className={`w-5 h-5 mr-3 ${!isActive && ACCENT_PRIMARY_TEXT}`} />
      <span className="text-sm">{label}</span>
    </button>
  );
};

// Helper component for styled metric boxes 
const MetricBox = ({ title, value, accentClass = ACCENT_PRIMARY_TEXT, icon: Icon, iconBgClass, isDashboard = true }) => (
  <div className={`p-6 rounded-xl ${isDashboard ? BG_CARD : BG_DARK_CARD} shadow-md transition duration-300 border border-gray-200 dark:border-gray-700`}>
    {isDashboard && (
        <div className="flex items-center justify-between mb-3">
          <div className={`text-sm ${TEXT_SECONDARY} uppercase tracking-wider font-medium`}>{title}</div>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgClass}`}>
            <Icon className={`w-5 h-5 text-white`} />
          </span>
        </div>
    )}
    {!isDashboard && (
        <div className={`text-sm ${TEXT_SECONDARY} uppercase tracking-wider font-medium mb-1`}>{title}</div>
    )}
    <div className={`text-4xl font-extrabold ${accentClass}`}>{value}</div>
  </div>
);


// Event List Item (Logic is simplified from original for clarity, relying on external state updates)
const EventListItem = ({ event, onClick }) => {
  let statusClass = ACCENT_PRIMARY_TEXT; 
  let statusDetail = 'Registration Open';
  let statusSymbol = '✍️'; 

  // Derive status based on event phase
  if (new Date(event.VoteEndTime).getTime() <= new Date().getTime()) {
    event.status = 'finished';
  } else if (new Date(event.VoteStartTime).getTime() <= new Date().getTime()) {
    event.status = 'voting';
  } else if (new Date(event.RegEndTime).getTime() <= new Date().getTime()) {
    event.status = 'waiting';
  } else {
    event.status = 'registration';
  }

  if (event.status === 'voting') {
    statusClass = ACCENT_VIOLET;
    statusDetail = 'Voting Live';
    statusSymbol = '🗳️';
  } else if (event.status === 'finished') {
    statusClass = ACCENT_SUCCESS;
    statusDetail = 'Results Available';
    statusSymbol = '🏆';
  } else if (event.status === 'waiting' || event.status === 'registration') {
    statusClass = ACCENT_WARNING;
    statusDetail = event.status === 'waiting' ? 'Waiting to Vote' : 'Registration Open';
    statusSymbol = event.status === 'waiting' ? '⏳' : '✍️';
  }

  const countdown = (iso) => {
    const d = new Date(iso); const t = d.getTime() - Date.now();
    if(isNaN(d.getTime()) || t <= 0) return '00:00:00';
    const h = String(Math.floor(t/3600000)).padStart(2,'0');
    const m = String(Math.floor((t%3600000)/60000)).padStart(2,'0');
    const s = String(Math.floor((t%60000)/1000)).padStart(2,'0');
    return `${h}:${m}:${s}`;
  }
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition duration-200 ${BG_CARD} shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className={`font-bold text-lg ${TEXT_PRIMARY}`}>{event.Title}</div>
          <div className={`text-xs font-mono mt-1 px-2 py-0.5 rounded-full ${statusClass} border border-current inline-block`}>
            <span className="mr-1">{statusSymbol}</span>
            <span className="font-semibold">{statusDetail.toUpperCase()}</span>
          </div>
        </div>
        <div className={`text-sm ${TEXT_SECONDARY}`}>Type: {event.ElectionType}</div>
      </div>
      <div className={`text-xs ${TEXT_SECONDARY} mt-3`}>
        {event.status === 'registration' && `Reg ends: ${new Date(event.RegEndTime).toLocaleDateString()}`}
        {event.status === 'voting' && `Voting ends: ${new Date(event.VoteEndTime).toLocaleDateString()} • ${countdown(event.VoteEndTime)}`}
        {event.status === 'waiting' && `Starts: ${new Date(event.VoteStartTime).toLocaleDateString()} • ${countdown(event.VoteStartTime)}`}
        {event.status === 'finished' && `Finished: ${new Date(event.VoteEndTime).toLocaleDateString()}`}
      </div>
    </button>
  );
};


export default function UserDashboard(){
  const [events, setEvents] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeView, setActiveView] = useState(NAV_ITEMS.DASHBOARD)
  const [nominees, setNominees] = useState([])
  const [voteSelection, setVoteSelection] = useState({})
  const [rankOrder, setRankOrder] = useState([]) 
  const [ballots, setBallots] = useState([])
  const [selectedBallot, setSelectedBallot] = useState(null)
  const [desc, setDesc] = useState('')
  const [results, setResults] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoterRegistered, setIsVoterRegistered] = useState(false)
  const [isNomineeRegistered, setIsNomineeRegistered] = useState(false)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  
  // Event Metrics state (used for event detail view)
  const [voterCount, setVoterCount] = useState(0)
  const [approvedCount, setApprovedCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [participationRate, setParticipationRate] = useState('0.0%') // Store as formatted string
  
  const [phaseRefreshed, setPhaseRefreshed] = useState({ reg:false, start:false, end:false })

  const user = useMemo(() => { 
    try{ return JSON.parse(localStorage.getItem('user')||'null') } catch{ return null } 
  }, [])
  const navigate = useNavigate()

  useEffect(()=>{ listEvents().then(setEvents).catch(()=>{}) },[])

  // --- Event Categorization ---
  const categorizedEvents = useMemo(() => {
    const categories = { upcoming: [], running: [], previous: [] };
    const nowMs = now.getTime();

    events.forEach(event => {
      const voteStartMs = new Date(event.VoteStartTime).getTime();
      const voteEndMs = new Date(event.VoteEndTime).getTime();
      
      // Categorize based on voting time, which is the most critical phase
      if (nowMs >= voteStartMs && nowMs < voteEndMs) {
          categories.running.push(event);
      } else if (nowMs < voteStartMs) {
          categories.upcoming.push(event);
      } else if (nowMs >= voteEndMs) {
          categories.previous.push(event);
      }
    });
    return categories;
  }, [events, now]);
  
  const currentEventsList = useMemo(() => {
    switch (activeView) {
      case NAV_ITEMS.UPCOMING: return categorizedEvents.upcoming;
      case NAV_ITEMS.RUNNING: return categorizedEvents.running;
      case NAV_ITEMS.PREVIOUS: return categorizedEvents.previous;
      default: return [];
    }
  }, [activeView, categorizedEvents]);

  // Map nominee id to display info (name, ballot, profile)
  const nomineeLookup = useMemo(() => {
    const m = {};
    nominees.forEach(n => {
      const id = n?.UserID?._id || n?.UserID;
      if(!id) return;
      m[id] = {
        displayName: n?.UserID?.FullName || id,
        ballotUrl: n?.SelectedBalot?.url || null,
        profileImage: n?.UserID?.ProfileImage || null,
      };
    });
    return m;
  }, [nominees]);

  // --- Active Event Details Fetching ---
  useEffect(()=>{
    if(!activeEvent) return
    
    // Reset state on active event change
    setVoteSelection({})
    setRankOrder([])
    setResults(null)
    setSelectedBallot(null)
    setDesc('')
    setVoterCount(0)
    setApprovedCount(0)
    setPendingCount(0)
    setParticipationRate('0.0%')


    // Determine event status
    let status = 'registration';
    const nowMs = Date.now();
    if (new Date(activeEvent.VoteEndTime).getTime() <= nowMs) {
        status = 'finished';
    } else if (new Date(activeEvent.VoteStartTime).getTime() <= nowMs) {
        status = 'voting';
    } else if (new Date(activeEvent.RegEndTime).getTime() <= nowMs) {
        status = 'waiting';
    }
    
    // Fetch phase-specific data
    if(status === 'registration'){
      getAvailableBallots(activeEvent._id).then(setBallots)
      getVoterRegStatus(activeEvent._id).then(s=> setIsVoterRegistered(!!s.registered))
      getNomineeRegStatus(activeEvent._id).then(s=> setIsNomineeRegistered(!!s.registered))
    } else {
      setIsVoterRegistered(false)
      setIsNomineeRegistered(false)
    }
    
    if(status === 'finished'){
      countVote(activeEvent._id).then(setResults)
    }

    if(status === 'voting'){
      getVoteStatus(activeEvent._id).then(s=> setHasVoted(s.voted)).catch(()=>setHasVoted(false))
    } else { setHasVoted(false) }

    // Fetch Nominee and Voter Metrics (for event detail page)
    const fetchMetrics = async () => {
      try{
        const approved = await getNominees(activeEvent._id)
        setNominees(approved)
        setApprovedCount(approved.length)
      }catch(e){console.error("Failed to fetch approved nominees:", e)}
      try{
        const pending = await getPendingNominees(activeEvent._id) 
        setPendingCount(pending.length)
      }catch(e){console.error("Failed to fetch pending nominees:", e)}
      try{
        const votersRes = await getVoters(activeEvent._id) 
        setVoterCount(votersRes.length)
      }catch(e){console.error("Failed to fetch registered voters:", e)}
      try{
        const part = await apiClient.get('/api/V1/admin/getVoterPerticipate', { params: { EventID: activeEvent._id } })
        const d = part.data?.data
        if(d) setParticipationRate(`${d.VoterPerticapteRate || '0.0'}%`)
      }catch(e){
        console.error("Failed to fetch participation rate:", e)
        setParticipationRate('0.0%')
      }
    }
    fetchMetrics()
    
    // Setup Socket IO for real-time updates (only during voting)
    let s;
    if(status === 'voting'){
      s = io(API_BASE, { withCredentials: true })
      s.emit('joinEvent', activeEvent._id)
      s.on('countUpdate', (payload)=>{
        if(payload.eventId === activeEvent._id){
          countVote(activeEvent._id).then(setResults)
        }
      })
    }
    return ()=>{ 
      if(s){ s.emit('leaveEvent', activeEvent._id); s.disconnect() }
    }
  },[activeEvent]) // Re-run only when event changes, not every second

  // --- Time and Auto-Refresh Logic (Unchanged) ---
  useEffect(()=>{
    const id = setInterval(()=> setNow(new Date()), 1000)
    return ()=> clearInterval(id)
  },[])
  
  useEffect(()=>{
    if(!activeEvent) return
    const nowMs = now.getTime()
    const toMs = (v)=>{ const d=new Date(v); return isNaN(d.getTime())? null : d.getTime() }
    const regMs = toMs(activeEvent.RegEndTime)
    const startMs = toMs(activeEvent.VoteStartTime)
    const endMs = toMs(activeEvent.VoteEndTime)

    const shouldReg = !!regMs && !phaseRefreshed.reg && nowMs >= regMs
    const shouldStart = !!startMs && !phaseRefreshed.start && nowMs >= startMs
    const shouldEnd = !!endMs && !phaseRefreshed.end && nowMs >= endMs

    if(shouldReg || shouldStart || shouldEnd){
      const refresh = () => listEvents().then(evts=>{
        setEvents(evts||[])
        const updated = (evts||[]).find(e=> e._id === activeEvent._id)
        if(updated) setActiveEvent(updated)
      }).catch(()=>{})
      refresh() 

      setPhaseRefreshed(p=>({ reg: p.reg || shouldReg, start: p.start || shouldStart, end: p.end || shouldEnd }))
    }
  }, [now, activeEvent]) 
  
  useEffect(()=>{
    setPhaseRefreshed({ reg:false, start:false, end:false })
  }, [activeEvent?._id])

  const timeLeft = (iso)=>{
    const d = new Date(iso)
    if (!(d instanceof Date) || isNaN(d.getTime())) return '00:00:00'
    const t = d.getTime() - now.getTime()
    if (t <= 0) return '00:00:00'
    const h = String(Math.floor(t/3600000)).padStart(2,'0')
    const m = String(Math.floor((t%3600000)/60000)).padStart(2,'0')
    const s = String(Math.floor((t%60000)/1000)).padStart(2,'0')
    return `${h}:${m}:${s}`
  }

  // --- Handlers (Optimized to prevent refreshing) ---
  const onRegisterVoter = useCallback(async (e)=>{
    if(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if(!activeEvent) return
    try{ 
      await voterRegister(activeEvent._id); 
      setIsVoterRegistered(true); 
      alert('Registered for voting') 
    }catch(err){ 
      alert(err?.response?.data?.message || 'Failed to register as voter') 
    }
  }, [activeEvent])

  const onNominate = useCallback(async (e)=>{
    if(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if(!activeEvent) return
    if(!selectedBallot){ alert('Select a ballot image'); return }
    try{
      await nomineeRegister({ EventID: activeEvent._id, SelectedBalot:{ url: selectedBallot.url, publicId: selectedBallot.publicId }, Description: desc })
      setIsNomineeRegistered(true)
      alert('Nominee registration submitted (awaiting admin approval)')
    }catch(err){
      alert(err?.response?.data?.message || 'Failed to register as nominee')
    }
  }, [activeEvent, selectedBallot, desc])

  const onVote = useCallback(async (e)=>{
    if(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if(!activeEvent || hasVoted || isSubmittingVote) return
    try{
      setIsSubmittingVote(true)
      const ElectionType = activeEvent.ElectionType
      let SelectedNominee = []
      if(ElectionType === 'Single'){
        const id = Object.keys(voteSelection)[0]
        if(id) SelectedNominee = [{ NomineeId: id }]
      }else if(ElectionType === 'MultiVote'){
        SelectedNominee = Object.keys(voteSelection).filter(k=>voteSelection[k]).map(id=>({ NomineeId:id }))
      }else{ 
        SelectedNominee = rankOrder.map((id, idx)=>({ NomineeId:id, Rank: idx+1 }))
      }
      await giveVote({ EventID: activeEvent._id, ElectionType, SelectedNominee })
      setHasVoted(true)
      alert('Voted successfully')
    }catch(err){
      alert(err?.response?.data?.message || 'Vote failed')
    } finally {
      setIsSubmittingVote(false)
    }
  }, [activeEvent, voteSelection, rankOrder, hasVoted, isSubmittingVote])

  // Optimized ballot selection handler
  const handleBallotSelection = useCallback((ballot, e) => {
    if(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if(isNomineeRegistered) return
    setSelectedBallot(ballot)
  }, [isNomineeRegistered])

  // Optimized vote selection handlers
  const handleVoteChange = useCallback((nomineeId, electionType, e) => {
    if(e) {
      e.stopPropagation()
    }
    if(hasVoted) return
    
    if(electionType === 'Rank'){
      if(e.target.checked){ 
        setRankOrder(prevOrder => prevOrder.includes(nomineeId) ? prevOrder : [...prevOrder, nomineeId])
      } else { 
        setRankOrder(prevOrder => prevOrder.filter(x => x !== nomineeId))
      }
    } else if(electionType === 'Single'){
      setVoteSelection({ [nomineeId]: true })
    } else {
      setVoteSelection(prevSelection => ({ ...prevSelection, [nomineeId]: e.target.checked }))
    }
  }, [hasVoted])

  // Optimized description change handler
  const handleDescriptionChange = useCallback((e) => {
    if(isNomineeRegistered) return
    setDesc(e.target.value)
  }, [isNomineeRegistered])

  // Optimized navigation handlers
  const handleNavigation = useCallback((view, e) => {
    if(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setActiveView(view)
    setActiveEvent(null)
  }, [])

  const handleEventSelection = useCallback((event, e) => {
    if(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setActiveEvent(event)
  }, [])

  const onLogout = useCallback(async (e)=>{
    if(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    try {
      await logout() 
      navigate('/login')
    } catch(err) {
      console.error('Logout error:', err)
      navigate('/login') // Navigate anyway in case of error
    }
  }, [navigate])

  // Determine vote button disabled state
  const isVoteDisabled = activeEvent?.ElectionType === 'Rank' 
    ? rankOrder.length === 0 
    : Object.keys(voteSelection).length === 0;

  // --- Rendering Functions ---

  const renderDashboardView = () => (
    <>
      {/* 1. Dashboard Title (User Request) */}
      <h2 className={`text-5xl font-extrabold ${TEXT_PRIMARY} mb-10 flex items-center`}>
        <span className={`mr-4 text-6xl ${ACCENT_PRIMARY_TEXT}`}>🗳️</span>
        E-Voting Dashboard
      </h2>
      

      {/* 2. Metric Boxes (User Request: Only 3 items) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricBox 
          title="Running Events" 
          value={categorizedEvents.running.length} 
          icon={RunningIcon} 
          iconBgClass="bg-violet-600 dark:bg-violet-400"
          accentClass={ACCENT_VIOLET}
        />
        <MetricBox 
          title="Upcoming Events" 
          value={categorizedEvents.upcoming.length} 
          icon={UpcomingIcon} 
          iconBgClass={`bg-[${ACCENT_PRIMARY_HEX}] dark:bg-[${ACCENT_SECONDARY_HEX}]`}
          accentClass={ACCENT_PRIMARY_TEXT}
        />
        <MetricBox 
          title="Past Events" 
          value={categorizedEvents.previous.length} 
          icon={PreviousIcon} 
          iconBgClass="bg-red-600 dark:bg-red-400"
          accentClass={ACCENT_ERROR}
        />
        {/* Total Nominees REMOVED as requested */}
      </div>

      <h3 className={`text-2xl font-bold ${TEXT_PRIMARY} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
        Quick Access
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${BG_CARD} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center text-2xl font-bold ${ACCENT_VIOLET} mb-3`}>
            <CalendarIcon className="w-6 h-6 mr-2" />
            Join Running Event
          </div>
          <p className={`${TEXT_SECONDARY} mb-4 text-sm`}>
            Quickly navigate to any event that is currently in its voting or registration phase.
          </p>
          <button 
            onClick={(e) => handleNavigation(NAV_ITEMS.RUNNING, e)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm ${BTN_PRIMARY}`}
          >
            Browse Running Events ({categorizedEvents.running.length})
          </button>
        </div>

        <div className={`p-6 rounded-xl ${BG_CARD} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center text-2xl font-bold ${ACCENT_PRIMARY_TEXT} mb-3`}>
            <ProfileIcon className="w-6 h-6 mr-2" />
            Manage Your Profile
          </div>
          <p className={`${TEXT_SECONDARY} mb-4 text-sm`}>
            Update your account details, profile picture, or change your password.
          </p>
          <button 
            onClick={(e) => handleNavigation(NAV_ITEMS.PROFILE, e)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm ${BTN_PRIMARY}`}
          >
            Go to Profile Settings
          </button>
        </div>
      </div>
    </>
  );

  const renderEventListView = (title) => (
    <>
      <h2 className={`text-3xl font-extrabold ${TEXT_PRIMARY} mb-6 border-b border-gray-200 dark:border-gray-700 pb-3`}>
        {title} ({currentEventsList.length})
      </h2>
      <div className="space-y-4">
        {currentEventsList.length === 0 ? (
          <div className={`text-center p-8 rounded-xl ${BG_CARD} ${TEXT_SECONDARY} border border-gray-200 dark:border-gray-700 shadow-lg`}>
            No {title.toLowerCase()} found at this time.
          </div>
        ) : (
          currentEventsList.map(ev => (
            <EventListItem
              key={ev._id}
              event={ev}
              onClick={(e) => handleEventSelection(ev, e)} 
            />
          ))
        )}
      </div>
    </>
  );

  const renderProfileView = () => (
    <>
      <h2 className={`text-3xl font-extrabold ${TEXT_PRIMARY} mb-6 border-b border-gray-200 dark:border-gray-700 pb-3`}>
        Profile Settings
      </h2>
      <div className={`p-8 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700`}>
        <div className="flex flex-col items-center text-center gap-6 mb-8">
          <img 
            src={user?.ProfileImage || 'https://placehold.co/120x120/f3f4f6/111827?text=User'}
            className={`w-32 h-32 rounded-full object-cover ring-4 ring-current ${ACCENT_PRIMARY_TEXT} shadow-xl`} 
            alt="Profile"
          />
          <div>
            <div className={`text-2xl font-bold ${TEXT_PRIMARY}`}>{user?.FullName || 'User Name'}</div>
            <div className={`text-base font-mono ${TEXT_SECONDARY}`}>{user?.Email || 'user@example.com'}</div>
          </div>
        </div>
        <p className={`${TEXT_SECONDARY} text-center mb-6`}>
            Use the dedicated **Update Profile** section to change your images, name, or password.
        </p>
        <Link 
          to="/profile" 
          className={`block w-full text-center px-6 py-3 rounded-lg font-bold text-base ${BTN_PRIMARY}`}
        >
          Go to Profile Editor
        </Link>
      </div>
    </>
  );

  const renderActiveContent = () => {
    // Priority 1: Event Detail View
    if (activeEvent) {
      // Re-determine event status on render for up-to-date UI
      let currentStatus = 'registration';
      const nowMs = now.getTime();
      if (new Date(activeEvent.VoteEndTime).getTime() <= nowMs) {
          currentStatus = 'finished';
      } else if (new Date(activeEvent.VoteStartTime).getTime() <= nowMs) {
          currentStatus = 'voting';
      } else if (new Date(activeEvent.RegEndTime).getTime() <= nowMs) {
          currentStatus = 'waiting';
      }

      return (
        <div className={`p-8 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700`}>
          
            {/* Event Header and Status */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
              <h3 className={`text-3xl font-extrabold ${TEXT_PRIMARY} mb-2`}>{activeEvent.Title}</h3>
              <div className="flex justify-between items-end">
                <div className={`${TEXT_SECONDARY} text-sm`}>
                  Type: <span className={`font-semibold ${ACCENT_VIOLET}`}>{activeEvent.ElectionType}</span>
                </div>
                <div className={`${TEXT_SECONDARY} text-sm`}>
                    Status: <span className={`font-bold text-lg ${currentStatus === 'finished' ? ACCENT_SUCCESS : ACCENT_WARNING}`}>{currentStatus.toUpperCase()}</span>
                </div>
              </div>
              {currentStatus === 'voting' && (
                <div className={`mt-2 text-xs font-mono ${ACCENT_VIOLET}`}>
                  Voting ends in: <span className="font-bold">{timeLeft(activeEvent.VoteEndTime)}</span>
                </div>
              )}
              {currentStatus === 'waiting' && (
                <div className={`mt-2 text-xs font-mono ${ACCENT_WARNING}`}>
                  Voting starts in: <span className="font-bold">{timeLeft(activeEvent.VoteStartTime)}</span>
                </div>
              )}
              {currentStatus === 'registration' && (
                <div className={`mt-2 text-xs font-mono ${ACCENT_WARNING}`}>
                  Registration ends in: <span className="font-bold">{timeLeft(activeEvent.RegEndTime)}</span>
                </div>
              )}
            </div>
            
            {/* --- Event Metrics (User Request) --- */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricBox 
                    title="REGISTERED VOTERS" 
                    value={voterCount} 
                    accentClass="text-[#3B82F6] dark:text-[#60A5FA]" 
                    isDashboard={false}
                />
                <MetricBox 
                    title="APPROVED NOMINEES" 
                    value={approvedCount} 
                    accentClass={ACCENT_SUCCESS} 
                    isDashboard={false}
                />
                <MetricBox 
                    title="PENDING NOMINEES" 
                    value={pendingCount} 
                    accentClass={ACCENT_WARNING} 
                    isDashboard={false}
                />
                <MetricBox 
                    title="PARTICIPATION RATE" 
                    value={participationRate} 
                    accentClass={ACCENT_VIOLET} 
                    isDashboard={false}
                />
            </div>
            {/* --- End Event Metrics --- */}


            {/* Voter Registration Card */}
            <div className={`mb-6 flex flex-col md:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700`}>
                <span className={`text-base font-semibold ${TEXT_PRIMARY} mb-2 md:mb-0`}>Voter Registration Status:</span>
                <button 
                    onClick={onRegisterVoter} 
                    disabled={currentStatus !== 'registration' || isVoterRegistered} 
                    className={`min-w-[150px] px-5 py-2 rounded-lg text-sm font-semibold transition duration-200 shadow-md ${
                        currentStatus === 'registration' && !isVoterRegistered 
                        ? `bg-[#1E3A8A] text-white hover:bg-[#3B82F6] shadow-[#1E3A8A]/50` 
                        : isVoterRegistered 
                        ? `bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed border border-gray-300 dark:border-gray-600`
                        : `bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed`
                    }`}
                >
                    {isVoterRegistered ? 'REGISTERED' : 'REGISTER AS VOTER'}
                </button>
            </div>

            {/* Registration Phase */}
            {currentStatus === 'registration' && (
              <form onSubmit={(e) => { e.preventDefault(); onNominate(e); }} className={`p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700`}>
                <h4 className={`font-bold text-xl ${ACCENT_PRIMARY_TEXT} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                  Nominee Registration ({isNomineeRegistered ? 'SUBMITTED' : 'OPEN'})
                </h4>
                <p className={`${TEXT_SECONDARY} text-sm mb-6`}>
                  {isNomineeRegistered 
                    ? 'Your nomination is submitted and is awaiting admin approval. You will be notified when the status changes.' 
                    : 'Select a ballot image and provide a compelling description to nominate yourself for this event.'}
                </p>
                
                <h5 className={`text-sm font-semibold mb-3 ${TEXT_PRIMARY}`}>Select Ballot Image</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {ballots.map(b => (
                    <label 
                      key={b.publicId} 
                      className={`relative block rounded-lg overflow-hidden transition duration-150 border-2 
                        ${isNomineeRegistered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} 
                        ${selectedBallot?.publicId === b.publicId 
                          ? `ring-4 ring-offset-2 ring-current ${ACCENT_PRIMARY_TEXT} ring-offset-white dark:ring-offset-gray-900 border-current` 
                          : 'border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white/50'}`}
                    >
                      <input 
                        type="radio" 
                        name="ballot" 
                        className="absolute opacity-0" 
                        disabled={isNomineeRegistered} 
                        checked={selectedBallot?.publicId === b.publicId}
                        onChange={(e) => handleBallotSelection(b, e)} 
                      />
                      <img src={b.url} alt="Ballot" className="w-full aspect-[4/3] object-cover" />
                    </label>
                  ))}
                </div>

                <h5 className={`text-sm font-semibold mb-2 ${TEXT_PRIMARY}`}>Nominee Description/Slogan</h5>
                <textarea 
                  className={`w-full p-4 bg-gray-200 dark:bg-gray-700/50 rounded-lg mb-6 ${TEXT_PRIMARY} placeholder-gray-500 border border-gray-300 dark:border-gray-700 
                    focus:border-current ${ACCENT_PRIMARY_TEXT} focus:ring-1 focus:ring-current transition duration-150`} 
                  rows="3"
                  placeholder="Enter your nominee description/slogan here..." 
                  disabled={isNomineeRegistered} 
                  value={desc} 
                  onChange={handleDescriptionChange} 
                />
                
                <button 
                  type="submit"
                  disabled={isNomineeRegistered || !selectedBallot || !desc.trim()} 
                  className={`w-full px-6 py-3 rounded-lg font-bold text-base transition duration-200 shadow-md ${
                    isNomineeRegistered || !selectedBallot || !desc.trim()
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                    : BTN_PRIMARY
                  }`}
                >
                  {isNomineeRegistered ? 'NOMINATION SUBMITTED' : 'SUBMIT NOMINEE APPLICATION'}
                </button>
              </form>
            )}

            {/* Voting Phase */}
            {currentStatus === 'voting' && (
              <form onSubmit={(e) => { e.preventDefault(); onVote(e); }} className="space-y-6">
                <h4 className={`font-bold text-xl ${ACCENT_VIOLET} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                    CAST YOUR VOTE ({activeEvent.ElectionType.toUpperCase()})
                </h4>
                {nominees.length === 0 && (
                  <div className={`p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-center ${TEXT_SECONDARY}`}>
                    No approved nominees yet for this event.
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {nominees.map(n => {
                    const id = n.UserID?._id || n.UserID
                    const isRank = activeEvent.ElectionType==='Rank'
                    const checked = isRank ? rankOrder.includes(id) : !!voteSelection[id]
                    const pos = isRank ? rankOrder.indexOf(id) : -1
                    const name = n.UserID?.FullName || id
                    const userName = n.UserID?.UserName || 'N/A'
                    const profileImage = n.SelectedBalot?.url || n.UserID?.ProfileImage || 'https://placehold.co/60x60/f3f4f6/111827?text=AD'

                    return (
                      <label 
                        key={id} 
                        className={`relative p-4 rounded-xl flex items-center gap-4 transition duration-200 border 
                        ${checked ? `bg-blue-100 dark:bg-violet-900/40 ring-2 ring-current ${ACCENT_VIOLET} border-current` : `${BG_CARD} border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50`}
                        ${hasVoted ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <input
                          type={isRank ? 'checkbox' : (activeEvent.ElectionType==='Single'?'radio':'checkbox')}
                          name={activeEvent.ElectionType==='Single'?'nominee-single':'nominee'}
                          checked={checked}
                          disabled={hasVoted}
                          className={`w-5 h-5 accent-violet-600 dark:accent-violet-400`}
                          onChange={(e) => handleVoteChange(id, activeEvent.ElectionType, e)}
                        />
                        {isRank && pos>=0 && (
                          <span className={`absolute -top-3 -left-3 w-7 h-7 rounded-full bg-violet-600 dark:bg-violet-400 text-white dark:text-gray-900 text-sm font-bold flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md`}>
                            {pos + 1}
                          </span>
                        )}
                        <img 
                          src={profileImage} 
                          alt={name} 
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-400 dark:ring-gray-600" 
                        />
                        <div>
                          <div className={`font-bold text-lg ${TEXT_PRIMARY}`}>{name}</div>
                          <div className={`text-xs ${TEXT_SECONDARY}`}>@{userName}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {(!hasVoted && isVoteDisabled) && (
                    <span className={`text-sm ${ACCENT_ERROR} font-mono text-center sm:text-right`}>
                      <span className="mr-1">❌</span>
                      {activeEvent.ElectionType==='Single' ? 'Select ONE nominee.' : activeEvent.ElectionType==='MultiVote' ? 'Select at least ONE nominee.' : 'Select and rank at least ONE nominee.'}
                    </span>
                  )}
                  {hasVoted ? (
                    <span className={`min-w-[200px] px-6 py-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 ${ACCENT_SUCCESS} border border-current font-bold shadow-lg text-center`}>
                      <span className="mr-2">✅</span>
                      SUBMITTED
                    </span>
                  ) : (
                    <button 
                      type="submit"
                      disabled={isVoteDisabled || isSubmittingVote} 
                      className={`min-w-[200px] px-6 py-3 rounded-lg font-bold text-base transition duration-200 shadow-xl ${
                        (isVoteDisabled || isSubmittingVote)
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : `bg-violet-600 text-white hover:bg-violet-500 shadow-violet-900/60`
                      }`}
                    >
                      {isSubmittingVote ? 'SUBMITTING...' : (activeEvent.ElectionType==='Rank' ? (rankOrder.length ? 'SUBMIT RANKED VOTE' : 'SELECT NOMINEES') : 'SUBMIT VOTE')}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Finished Phase (Results) */}
            {currentStatus === 'finished' && (
              <div className={`p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700`}>
                <h4 className={`font-bold text-xl ${ACCENT_SUCCESS} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center`}>
                  <span className="mr-2">🥇</span>
                  ELECTION RESULTS & TALLY
                </h4>
                {results ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Single/Multi Results */}
                    {results.NomineeListForSingleAndMultiVote && results.NomineeListForSingleAndMultiVote.length > 0 && (
                      <div>
                        <div className={`text-sm ${TEXT_SECONDARY} mb-3 font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 pb-1`}>Total Votes Count</div>
                        <ul className="space-y-3">
                          {results.NomineeListForSingleAndMultiVote?.sort((a,b)=>b.TotalVote-a.TotalVote).map((r, index) => {
                            const id = r.NomineeID;
                            const meta = nomineeLookup[id] || {};
                            const displayName = r.NomineeIDName || meta.displayName || id;
                            const imgSrc = meta.ballotUrl || meta.profileImage || 'https://placehold.co/40x40/f3f4f6/111827?text=AD';
                            return (
                              <li key={id} className={`flex justify-between items-center bg-white dark:bg-gray-800/50 p-3 rounded-lg border-l-4 border-current ${ACCENT_SUCCESS}`}>
                                <div className="flex items-center gap-3">
                                  <img src={imgSrc} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600" />
                                  <Link to={`/u/${id}`} className={`font-semibold ${TEXT_PRIMARY} flex items-center hover:underline`} title="View profile">{index===0 ? '🏆 ' : ''}{displayName}</Link>
                                </div>
                                <span className={`text-xl font-bold ${ACCENT_SUCCESS}`}>{r.TotalVote} Votes</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    
                    {/* Rank Results */}
                    {results.NomineeListForRank && results.NomineeListForRank.length > 0 && (
                      <div>
                        <div className={`text-sm ${TEXT_SECONDARY} mb-3 font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 pb-1`}>Ranked Choice Score (Lower is Better)</div>
                        <ul className="space-y-3">
                          {results.NomineeListForRank?.sort((a,b)=>a.TotalRank-b.TotalRank).map((r, index) => {
                            const id = r.NomineeID;
                            const meta = nomineeLookup[id] || {};
                            const displayName = r.NomineeIDName || meta.displayName || id;
                            const imgSrc = meta.ballotUrl || meta.profileImage || 'https://placehold.co/40x40/f3f4f6/111827?text=AD';
                            return (
                              <li key={id} className={`flex justify-between items-center bg-white dark:bg-gray-800/50 p-3 rounded-lg border-l-4 border-current ${ACCENT_VIOLET}`}>
                                <div className="flex items-center gap-3">
                                  <img src={imgSrc} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600" />
                                  <Link to={`/u/${id}`} className={`font-semibold ${TEXT_PRIMARY} flex items-center hover:underline`} title="View profile">{index===0 ? '👑 ' : ''}{displayName}</Link>
                                </div>
                                <span className={`text-xl font-bold ${ACCENT_VIOLET}`}>{r.TotalRank} Score</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {(!results.NomineeListForSingleAndMultiVote || results.NomineeListForSingleAndMultiVote.length === 0) &&
                     (!results.NomineeListForRank || results.NomineeListForRank.length === 0) && (
                      <div className={`text-center ${TEXT_SECONDARY} col-span-2 p-4 bg-gray-100 dark:bg-gray-900/70 rounded-lg`}>No results data found for this event.</div>
                    )}
                  </div>
                ) : (
                  <div className={`text-center ${TEXT_SECONDARY} p-4 bg-gray-100 dark:bg-gray-900/70 rounded-lg`}>Results are not available yet.</div>
                )}
              </div>
            )}
            
            {/* Waiting Phase */}
            {(currentStatus === 'waiting' || currentStatus === 'archived') && (
                <div className={`p-8 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center ${TEXT_SECONDARY}`}>
                    <h4 className={`font-bold text-xl mb-2 ${ACCENT_WARNING} flex items-center justify-center`}>
                      <span className="mr-2">💡</span>
                      EVENT PENDING
                    </h4>
                    <p className="text-sm">This event is currently in the **{currentStatus.toUpperCase()}** phase.</p>
                    {currentStatus === 'waiting' && <p className="text-sm font-mono mt-2">Voting starts in: <span className={`${ACCENT_WARNING} font-bold`}>{timeLeft(activeEvent.VoteStartTime)}</span></p>}
                </div>
            )}
        </div>
      );
    }
    
    // Priority 2: Navigation View
    switch (activeView) {
      case NAV_ITEMS.UPCOMING:
        return renderEventListView(NAV_ITEMS.UPCOMING);
      case NAV_ITEMS.RUNNING:
        return renderEventListView(NAV_ITEMS.RUNNING);
      case NAV_ITEMS.PREVIOUS:
        return renderEventListView(NAV_ITEMS.PREVIOUS);
      case NAV_ITEMS.PROFILE:
        return renderProfileView();
      case NAV_ITEMS.DASHBOARD:
      default:
        return renderDashboardView();
    }
  };


  return (
    <div className={`min-h-screen ${BG_BODY} ${TEXT_PRIMARY} font-sans flex flex-col lg:flex-row`}>
      
      {/* 1. Sidebar Navigation (Left Panel) */}
      <aside className={`w-full lg:w-72 ${BG_SIDEBAR} shadow-xl lg:shadow-2xl p-6 lg:min-h-screen border-r border-gray-200 dark:border-gray-700/50`}>
        
        {/* Header/Logo */}
        <div className="flex items-center mb-10 pb-4 border-b border-gray-200 dark:border-gray-700">
          <span 
            className={`text-2xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 
                dark:from-white dark:to-gray-400`}
          >
            E-VoteHub
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          <NavItem 
            icon={DashboardIcon} 
            label={NAV_ITEMS.DASHBOARD} 
            isActive={activeView === NAV_ITEMS.DASHBOARD}
            onClick={(e) => handleNavigation(NAV_ITEMS.DASHBOARD, e)}
          />
          <NavItem 
            icon={RunningIcon} 
            label={NAV_ITEMS.RUNNING} 
            isActive={activeView === NAV_ITEMS.RUNNING}
            onClick={(e) => handleNavigation(NAV_ITEMS.RUNNING, e)}
          />
          <NavItem 
            icon={UpcomingIcon} 
            label={NAV_ITEMS.UPCOMING} 
            isActive={activeView === NAV_ITEMS.UPCOMING}
            onClick={(e) => handleNavigation(NAV_ITEMS.UPCOMING, e)}
          />
          <NavItem 
            icon={PreviousIcon} 
            label={NAV_ITEMS.PREVIOUS} 
            isActive={activeView === NAV_ITEMS.PREVIOUS}
            onClick={(e) => handleNavigation(NAV_ITEMS.PREVIOUS, e)}
          />
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <NavItem 
                icon={ProfileIcon} 
                label={NAV_ITEMS.PROFILE} 
                isActive={activeView === NAV_ITEMS.PROFILE}
                onClick={(e) => handleNavigation(NAV_ITEMS.PROFILE, e)}
            />
        </div>

        {/* Logout Button (Moved here for consistency) */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={onLogout}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 bg-[#DC2626] text-white hover:bg-red-500 font-semibold shadow-md shadow-red-900/40`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <span className="text-sm">Logout</span>
            </button>
        </div>
      </aside>

      {/* 2. Main Content Area (Right Panel) */}
      <main className="flex-1 p-6 md:p-10 max-w-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            {renderActiveContent()}
        </div>
      </main>
    </div>
  )
}