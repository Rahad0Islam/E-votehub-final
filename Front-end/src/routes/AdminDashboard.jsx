import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { listEvents, countVote, getPendingNominees, approveNominee, createEvent, api as apiClient } from '../lib/api'
import { getVoters } from '../lib/votersApi'
import { io } from 'socket.io-client'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

// --- Color Palette Mapping (Copied from UserDashboard for consistency) ---
const ACCENT_PRIMARY_HEX = '#1E3A8A'; // Primary Blue (Deep/Navy)
const ACCENT_SECONDARY_HEX = '#3B82F6'; // Link Blue (Bright/Lighter)

// Backgrounds
const BG_BODY = 'bg-[#ECEBEB] dark:bg-[#1A2129]' 
const BG_SIDEBAR = 'bg-white dark:bg-[#111827]'
const BG_CARD = 'bg-white dark:bg-[#111827]'
const BG_DARK_CARD = 'bg-[#1a202c] dark:bg-[#111827]'

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
const INPUT_CLASS = `w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 ${BG_CARD} ${TEXT_PRIMARY} placeholder-gray-500 focus:ring-2 focus:ring-[${ACCENT_PRIMARY_HEX}] dark:focus:ring-[${ACCENT_SECONDARY_HEX}] outline-none transition duration-150`

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8002'


// --- Constants for Sidebar Navigation ---
const NAV_ITEMS = {
  DASHBOARD: 'Overview Dashboard',
  CREATE: 'Create New Event',
  RUNNING: 'Voting Live Events',
  UPCOMING: 'Upcoming Events',
  PREVIOUS: 'Finished Events',
}

// --- Icons (Copied from UserDashboard for consistency) ---
const DashboardIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18"/><path d="M18.7 8.7L12 15.4 9.3 12.7 6 16"/></svg>);
const CreateIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 5v14M5 12h14"/></svg>);
const RunningIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const UpcomingIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>);
const PreviousIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>);
const LogoutIcon = ({ className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);


// --- Helper Components ---

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
const MetricBox = ({ title, value, accentClass = ACCENT_PRIMARY_TEXT, icon: Icon, iconBgClass }) => (
  <div className={`p-6 rounded-xl ${BG_CARD} shadow-md transition duration-300 border border-gray-200 dark:border-gray-700`}>
    <div className="flex items-center justify-between mb-3">
        <div className={`text-sm ${TEXT_SECONDARY} uppercase tracking-wider font-medium`}>{title}</div>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgClass}`}>
          <Icon className={`w-5 h-5 text-white`} />
        </span>
    </div>
    <div className={`text-4xl font-extrabold ${accentClass}`}>{value}</div>
  </div>
);

// Event List Item for selection
const EventListItem = ({ event, onClick, isActive }) => {
  let statusClass = ACCENT_PRIMARY_TEXT; 
  let statusDetail = 'Registration Open';
  let statusSymbol = '✍️'; 

  // Derive status based on event phase
  if (new Date(event.VoteEndTime).getTime() <= new Date().getTime()) {
    event.status = 'finished';
    statusClass = ACCENT_SUCCESS;
    statusDetail = 'Finished';
    statusSymbol = '🏆';
  } else if (new Date(event.VoteStartTime).getTime() <= new Date().getTime()) {
    event.status = 'voting';
    statusClass = ACCENT_VIOLET;
    statusDetail = 'Voting Live';
    statusSymbol = '🗳️';
  } else if (new Date(event.RegEndTime).getTime() <= new Date().getTime()) {
    event.status = 'waiting';
    statusClass = ACCENT_WARNING;
    statusDetail = 'Waiting to Vote';
    statusSymbol = '⏳';
  } else {
    event.status = 'registration';
    statusClass = ACCENT_WARNING;
    statusDetail = 'Registration Open';
    statusSymbol = '✍️';
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition duration-200 shadow-sm border ${isActive ? `border-current ring-2 ring-current ${ACCENT_PRIMARY_TEXT} ${BG_CARD} shadow-lg` : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] hover:shadow-md'}`}
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
    </button>
  );
};


export default function AdminDashboard(){
  const [events, setEvents] = useState([])
  const [activeEvent, setActiveEvent] = useState(null)
  const [activeView, setActiveView] = useState(NAV_ITEMS.DASHBOARD)
  const [counts, setCounts] = useState({ simple: [], rank: [] })
  const [pending, setPending] = useState([])
  const [voters, setVoters] = useState([])

  // event creation state
  const [newEvent, setNewEvent] = useState({ Title:'', Description:'', RegEndTime:'', VoteStartTime:'', VoteEndTime:'', ElectionType:'Single' })
  const [ballotFiles, setBallotFiles] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(false)

  // Initial fetch of all events
  useEffect(()=>{ listEvents().then(setEvents) },[])

  // --- Event Categorization ---
  const categorizedEvents = useMemo(() => {
    const categories = { upcoming: [], running: [], previous: [] };
    const nowMs = new Date().getTime();

    events.forEach(event => {
      const voteStartMs = new Date(event.VoteStartTime).getTime();
      const voteEndMs = new Date(event.VoteEndTime).getTime();
      
      if (nowMs >= voteStartMs && nowMs < voteEndMs) {
          categories.running.push(event);
      } else if (nowMs < voteStartMs) {
          categories.upcoming.push(event);
      } else if (nowMs >= voteEndMs) {
          categories.previous.push(event);
      }
    });
    return categories;
  }, [events]);
  
  const currentEventsList = useMemo(() => {
    switch (activeView) {
      case NAV_ITEMS.UPCOMING: return categorizedEvents.upcoming;
      case NAV_ITEMS.RUNNING: return categorizedEvents.running;
      case NAV_ITEMS.PREVIOUS: return categorizedEvents.previous;
      default: return [];
    }
  }, [activeView, categorizedEvents]);


  // --- Active Event Live Data/Metrics Fetching ---
  useEffect(()=>{
    if(!activeEvent) return
    setLoadingEvent(true)

    // Reset counts and lists
    setCounts({ simple: [], rank: [] })
    setPending([])
    setVoters([])

    const fetchEventData = async () => {
        try{
            // Fetch initial data
            const [c, p, v] = await Promise.all([
                countVote(activeEvent._id),
                getPendingNominees(activeEvent._id),
                getVoters(activeEvent._id)
            ])
            setCounts({ simple: c.NomineeListForSingleAndMultiVote, rank: c.NomineeListForRank })
            setPending(p)
            setVoters(v)
        } catch(err){
            console.error("Failed to fetch event data:", err)
        } finally {
            setLoadingEvent(false)
        }
    }
    
    fetchEventData()

    // Setup Socket IO for real-time updates (only if voting is live)
    let s;
    const nowMs = new Date().getTime()
    const voteStartMs = new Date(activeEvent.VoteStartTime).getTime()
    const voteEndMs = new Date(activeEvent.VoteEndTime).getTime()
    
    if (nowMs >= voteStartMs && nowMs < voteEndMs) {
      s = io(API_BASE, { withCredentials: true })
      s.emit('joinEvent', activeEvent._id)
      s.on('voteUpdate', async (payload)=>{
        if(payload.eventId === activeEvent._id){
          try{
            const c = await countVote(activeEvent._id)
            setCounts({ simple: c.NomineeListForSingleAndMultiVote, rank: c.NomineeListForRank })
          }catch(err){
             console.error("Socket vote update failed:", err)
          }
        }
      })
    }

    return ()=>{ 
        if(s){ s.emit('leaveEvent', activeEvent._id); s.disconnect() }
    }
  },[activeEvent])

  // --- Handlers ---
  const handleNavigation = useCallback((view) => {
    setActiveView(view)
    setActiveEvent(null) // Deselect event when navigating away from event list
  }, [])

  const handleEventSelection = useCallback((event) => {
    setActiveView(NAV_ITEMS.RUNNING) // Force to one of the list views on selection
    setActiveEvent(event)
  }, [])

  const onApprove = async (uid)=>{
    try{
      await approveNominee({ EventID: activeEvent._id, NomineeID: uid })
      setPending(p => p.filter(x => (x.UserID?._id || x.UserID) !== uid))
    }catch(err){
      alert(err?.response?.data?.message || 'Approval failed')
    }
  }

  const onCreateEvent = async (e)=>{
    e.preventDefault()
    setIsCreating(true)
    try{
      await createEvent({ ...newEvent, BallotImageFiles: ballotFiles })
      alert('Event created successfully!')
      setNewEvent({ Title:'', Description:'', RegEndTime:'', VoteStartTime:'', VoteEndTime:'', ElectionType:'Single' })
      setBallotFiles([])
      
      const updated = await listEvents()
      setEvents(updated)
      setActiveView(NAV_ITEMS.DASHBOARD) // Navigate back to dashboard after creation
    }catch(err){
      alert(err?.response?.data?.message || 'Failed to create event')
    }finally{
      setIsCreating(false)
    }
  }

  // --- Chart Data Memoization ---
  const barData = useMemo(()=>{
    const labels = counts.simple.map(x=>x.NomineeIDName || x.NomineeID)
    return {
      labels,
      datasets: [{
        label: 'Total Votes',
        data: counts.simple.map(x=>x.TotalVote),
        // Use consistent colors for a professional look
        backgroundColor: ACCENT_VIOLET.replace('text-','').replace('dark:text-','').replace('600','400') + 'CC', // Violet with opacity
        borderColor: ACCENT_VIOLET.replace('text-','').replace('dark:text-',''),
        borderWidth: 1
      }]
    }
  },[counts])

  const doughnutData = useMemo(()=>{
    const labels = counts.rank.map(x=>x.NomineeIDName || x.NomineeID)
    return {
      labels,
      datasets: [{
        label: 'Total Rank (Lower is Better)',
        data: counts.rank.map(x=>x.TotalRank),
        // Use a set of harmonious colors
        backgroundColor: ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444'] // Blue, Green, Yellow, Violet, Red
      }]
    }
  },[counts])

  // --- Rendering Functions ---

  const renderDashboardView = () => (
    <>
      <h2 className={`text-5xl font-extrabold ${TEXT_PRIMARY} mb-10 flex items-center`}>
        <span className={`mr-4 text-6xl ${ACCENT_PRIMARY_TEXT}`}>📊</span>
        Admin Control Dashboard
      </h2>
      
      {/* Metric Boxes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricBox 
          title="Total Events" 
          value={events.length} 
          icon={DashboardIcon} 
          iconBgClass={`bg-[${ACCENT_PRIMARY_HEX}] dark:bg-[${ACCENT_SECONDARY_HEX}]`}
          accentClass={ACCENT_PRIMARY_TEXT}
        />
        <MetricBox 
          title="Live Voting Events" 
          value={categorizedEvents.running.length} 
          icon={RunningIcon} 
          iconBgClass="bg-violet-600 dark:bg-violet-400"
          accentClass={ACCENT_VIOLET}
        />
        <MetricBox 
          title="Upcoming Events" 
          value={categorizedEvents.upcoming.length} 
          icon={UpcomingIcon} 
          iconBgClass="bg-yellow-600 dark:bg-yellow-400"
          accentClass={ACCENT_WARNING}
        />
        <MetricBox 
          title="Finished Events" 
          value={categorizedEvents.previous.length} 
          icon={PreviousIcon} 
          iconBgClass="bg-green-600 dark:bg-green-400"
          accentClass={ACCENT_SUCCESS}
        />
      </div>

      <h3 className={`text-2xl font-bold ${TEXT_PRIMARY} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
        Quick Actions
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${BG_CARD} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center text-2xl font-bold ${ACCENT_PRIMARY_TEXT} mb-3`}>
            <CreateIcon className="w-6 h-6 mr-2" />
            Launch New Event
          </div>
          <p className={`${TEXT_SECONDARY} mb-4 text-sm`}>
            Quickly jump to the form to set up and launch a new election or event.
          </p>
          <button 
            onClick={() => handleNavigation(NAV_ITEMS.CREATE)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm ${BTN_PRIMARY}`}
          >
            Create Event Form
          </button>
        </div>

        <div className={`p-6 rounded-xl ${BG_CARD} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <div className={`flex items-center text-2xl font-bold ${ACCENT_VIOLET} mb-3`}>
            <RunningIcon className="w-6 h-6 mr-2" />
            Manage Live Events
          </div>
          <p className={`${TEXT_SECONDARY} mb-4 text-sm`}>
            Monitor voting, approve nominees, and view live results for active events.
          </p>
          <button 
            onClick={() => handleNavigation(NAV_ITEMS.RUNNING)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm ${BTN_PRIMARY.replace(/shadow-.*$/, 'shadow-violet-900/60')}`}
          >
            Go to Live Events ({categorizedEvents.running.length})
          </button>
        </div>
      </div>
    </>
  )

  const renderCreateEventView = () => (
    <div className={`p-8 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700`}>
      <h2 className={`text-3xl font-extrabold ${ACCENT_PRIMARY_TEXT} mb-6 border-b border-gray-200 dark:border-gray-700 pb-3 flex items-center`}>
        <CreateIcon className="w-6 h-6 mr-3" />
        {NAV_ITEMS.CREATE}
      </h2>
      <form onSubmit={onCreateEvent} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Title */}
        <input className={`${INPUT_CLASS} lg:col-span-2`} placeholder="Event Title (e.g., Annual Board Election)" value={newEvent.Title} onChange={e=>setNewEvent({...newEvent, Title:e.target.value})} required/>
        
        {/* Election Type */}
        <select className={INPUT_CLASS} value={newEvent.ElectionType} onChange={e=>setNewEvent({...newEvent, ElectionType:e.target.value})}>
          <option value="Single">Single Vote (One Winner)</option>
          <option value="MultiVote">MultiVote (Multiple Choices)</option>
          <option value="Rank">Ranked Choice (Lower Score Wins)</option>
        </select>
        
        {/* Description */}
        <textarea className={`${INPUT_CLASS} md:col-span-2 lg:col-span-3`} rows="3" placeholder="Description of the event, rules, and eligibility (optional)" value={newEvent.Description} onChange={e=>setNewEvent({...newEvent, Description:e.target.value})} />
        
        {/* Date/Time Pickers */}
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Registration End Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.RegEndTime} onChange={e=>setNewEvent({...newEvent, RegEndTime:e.target.value})} required/>
        </label>
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote Start Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.VoteStartTime} onChange={e=>setNewEvent({...newEvent, VoteStartTime:e.target.value})} required/>
        </label>
        <label className={`text-sm ${TEXT_SECONDARY} font-medium`}>Vote End Time
          <input type="datetime-local" className={`block mt-1 ${INPUT_CLASS}`} value={newEvent.VoteEndTime} onChange={e=>setNewEvent({...newEvent, VoteEndTime:e.target.value})} required/>
        </label>

        {/* Ballot Images */}
        <div className="lg:col-span-3">
          <label className={`block text-sm ${TEXT_SECONDARY} font-medium mb-2`}>Ballot Images (For Nominee Selection) - Max 10</label>
          <input type="file" multiple onChange={e=>setBallotFiles(Array.from(e.target.files))} className={`${INPUT_CLASS.replace('p-3','p-2')} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600`} />
          <p className={`text-xs ${TEXT_SECONDARY} mt-1`}>Selected files: {ballotFiles.length}</p>
        </div>

        {/* Submit Button */}
        <div className="lg:col-span-3 pt-4">
          <button 
            className={`px-6 py-3 rounded-lg font-bold text-base ${BTN_PRIMARY} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isCreating}
          >
            {isCreating ? 'CREATING EVENT...' : 'LAUNCH EVENT'}
          </button>
        </div>
      </form>
    </div>
  )

  const renderEventListView = (title) => (
    <div className={`p-8 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700`}>
        <h2 className={`text-3xl font-extrabold ${TEXT_PRIMARY} mb-6 border-b border-gray-200 dark:border-gray-700 pb-3`}>
            {title} ({currentEventsList.length})
        </h2>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            {currentEventsList.length === 0 ? (
                <div className={`text-center p-8 rounded-xl ${BG_DARK_CARD} ${TEXT_SECONDARY} border border-gray-700 shadow-inner`}>
                    No {title.toLowerCase()} found at this time.
                </div>
            ) : (
                currentEventsList.map(ev => (
                    <EventListItem
                        key={ev._id}
                        event={ev}
                        onClick={() => handleEventSelection(ev)} 
                        isActive={activeEvent?._id === ev._id}
                    />
                ))
            )}
        </div>
    </div>
  )

  const renderActiveEventDetail = () => {
    if (!activeEvent) {
      return (
        <div className={`p-12 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700 text-center ${TEXT_SECONDARY}`}>
          <h3 className={`text-2xl font-bold ${ACCENT_PRIMARY_TEXT} mb-3`}>Select an Event</h3>
          <p>Choose an event from the sidebar list to view live results, monitor voters, and approve nominees.</p>
        </div>
      )
    }

    if (loadingEvent) {
      return (
        <div className={`p-12 rounded-xl ${BG_CARD} shadow-2xl border border-gray-200 dark:border-gray-700 text-center ${TEXT_PRIMARY}`}>
          <div className="text-xl font-semibold animate-pulse">Loading Event Data...</div>
        </div>
      )
    }

    const eventStatus = activeEvent.status; // status is set in EventListItem

    return (
      <div className="space-y-6">
        {/* Event Header */}
        <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
          <h3 className={`text-3xl font-extrabold ${ACCENT_PRIMARY_TEXT}`}>{activeEvent.Title}</h3>
          <p className={`${TEXT_SECONDARY} text-sm mt-1`}>Type: {activeEvent.ElectionType} | Status: <span className="font-bold">{eventStatus.toUpperCase()}</span></p>
        </div>

        {/* Nominee Approval / Voters / Live Results - Conditional Layout */}
        <div className="grid lg:grid-cols-3 gap-6">

            {/* Column 1 & 2: Nominee Approval / Voters (If Active) OR Results */}
            <div className={`lg:col-span-${eventStatus === 'finished' ? 3 : 2} space-y-6`}>
                
                {/* Pending Nominees (Only relevant during registration/waiting) */}
                {eventStatus !== 'finished' && (
                    <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                        <h4 className={`font-bold text-xl ${ACCENT_WARNING} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                            <span className="mr-2">🚨</span> Pending Nominees ({pending.length})
                        </h4>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                            {pending.map(p => {
                                const id = p.UserID?._id || p.UserID
                                return (
                                <div key={id} className={`flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${BG_DARK_CARD}`}>
                                    <div className="flex items-center gap-3">
                                        <img src={p.UserID?.ProfileImage || 'https://placehold.co/40x40/d1d5db/4b5563?text=U'} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                                        <div>
                                            <div className="text-sm font-semibold">{p.UserID?.FullName || id}</div>
                                            <div className={`text-xs ${TEXT_SECONDARY}`}>@{p.UserID?.UserName}</div>
                                        </div>
                                    </div>
                                    <button onClick={()=>onApprove(id)} className={`px-4 py-2 text-xs font-semibold rounded-lg ${BTN_PRIMARY}`}>
                                        Approve
                                    </button>
                                </div>
                                )
                            })}
                            {pending.length===0 && <div className={`text-sm ${TEXT_SECONDARY} p-3 text-center`}>No pending nominees for this event.</div>}
                        </div>
                    </div>
                )}
                
                {/* Registered Voters (Always visible) */}
                <div className={`p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                    <h4 className={`font-bold text-xl ${ACCENT_PRIMARY_TEXT} mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`}>
                        <span className="mr-2">👥</span> Registered Voters ({voters.length})
                    </h4>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {voters.map(v => (
                            <div key={v.UserID?._id || v.UserID} className={`flex items-center gap-3 text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${BG_DARK_CARD}`}>
                                <img src={v.UserID?.ProfileImage || 'https://placehold.co/32x32/d1d5db/4b5563?text=V'} className="w-8 h-8 rounded-full object-cover" alt="Voter Profile"/>
                                <span className="font-medium">{v.UserID?.FullName || v.UserID}</span>
                                <span className={`text-xs ${TEXT_SECONDARY}`}>({v.UserID?.Email})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Column 3: Live Results / Charts (Only relevant during voting/finished) */}
            {(eventStatus === 'voting' || eventStatus === 'finished') && (
                <div className={`lg:col-span-1 space-y-6`}>
                    
                    {activeEvent.ElectionType !== 'Rank' && (
                        <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                            <h4 className={`text-lg font-bold mb-3 ${ACCENT_VIOLET}`}>Live Tally (Votes)</h4>
                            <Bar 
                                data={barData} 
                                options={{ 
                                    responsive:true, 
                                    plugins:{ legend:{ display:false }, tooltip:{ enabled:true }}, 
                                    scales:{ 
                                        x:{ ticks:{ color:'#a3a3a3' }, grid:{ color:'rgba(163,163,163,0.1)' } }, 
                                        y:{ ticks:{ color:'#a3a3a3', precision:0 }, grid:{ color:'rgba(163,163,163,0.1)' } }
                                    } 
                                }} 
                            />
                        </div>
                    )}

                    {activeEvent.ElectionType === 'Rank' && (
                        <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                            <h4 className={`text-lg font-bold mb-3 ${ACCENT_VIOLET}`}>Rank Score Distribution</h4>
                            <div className="h-64 flex justify-center items-center">
                                <Doughnut 
                                    data={doughnutData} 
                                    options={{ 
                                        responsive:true, 
                                        plugins:{ legend:{ labels:{ color:'#a3a3a3' }} },
                                        maintainAspectRatio: false,
                                    }} 
                                />
                            </div>
                        </div>
                    )}
                    
                    {activeEvent.ElectionType === 'Rank' && (
                        <div className={`p-4 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700`}>
                            <h4 className={`text-lg font-bold mb-3 ${ACCENT_VIOLET}`}>Raw Rank Scores</h4>
                            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {counts.rank.sort((a,b)=>a.TotalRank-b.TotalRank).map(r => (
                                    <li key={r.NomineeID} className={`flex justify-between items-center p-2 rounded ${BG_DARK_CARD}`}>
                                        <span className="text-sm font-medium">{r.NomineeIDName || r.NomineeID}</span>
                                        <span className={`text-base font-bold ${ACCENT_VIOLET}`}>{r.TotalRank}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Show message if event is not in voting or finished phase */}
            {(eventStatus !== 'voting' && eventStatus !== 'finished') && (
                <div className={`lg:col-span-1 p-6 rounded-xl ${BG_CARD} shadow-xl border border-gray-200 dark:border-gray-700 text-center`}>
                    <h4 className={`text-lg font-bold mb-3 ${ACCENT_WARNING}`}>Results Unavailable</h4>
                    <p className={`text-sm ${TEXT_SECONDARY}`}>Live results are only displayed during the **{eventStatus.toUpperCase()}** or **VOTING** phase.</p>
                    <p className={`text-sm font-mono mt-2 ${TEXT_SECONDARY}`}>Voting starts: {new Date(activeEvent.VoteStartTime).toLocaleString()}</p>
                </div>
            )}

        </div>

      </div>
    )
  }

  // --- Main Content Renderer ---
  const renderActiveContent = () => {
    if (activeEvent) {
        // If an event is selected, we render the detail view regardless of the sidebar's current category view.
        return renderActiveEventDetail();
    }

    switch (activeView) {
      case NAV_ITEMS.CREATE:
        return renderCreateEventView();
      case NAV_ITEMS.RUNNING:
        return renderEventListView(NAV_ITEMS.RUNNING);
      case NAV_ITEMS.UPCOMING:
        return renderEventListView(NAV_ITEMS.UPCOMING);
      case NAV_ITEMS.PREVIOUS:
        return renderEventListView(NAV_ITEMS.PREVIOUS);
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
            E-Vote Admin
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          <NavItem 
            icon={DashboardIcon} 
            label={NAV_ITEMS.DASHBOARD} 
            isActive={activeView === NAV_ITEMS.DASHBOARD && !activeEvent}
            onClick={() => handleNavigation(NAV_ITEMS.DASHBOARD)}
          />
          <NavItem 
            icon={CreateIcon} 
            label={NAV_ITEMS.CREATE} 
            isActive={activeView === NAV_ITEMS.CREATE}
            onClick={() => handleNavigation(NAV_ITEMS.CREATE)}
          />
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <h4 className={`text-xs ${TEXT_SECONDARY} uppercase font-semibold tracking-wider px-4 mb-2`}>Event Management</h4>
            <NavItem 
                icon={RunningIcon} 
                label={NAV_ITEMS.RUNNING} 
                isActive={activeView === NAV_ITEMS.RUNNING && !activeEvent}
                onClick={() => handleNavigation(NAV_ITEMS.RUNNING)}
            />
            <NavItem 
                icon={UpcomingIcon} 
                label={NAV_ITEMS.UPCOMING} 
                isActive={activeView === NAV_ITEMS.UPCOMING && !activeEvent}
                onClick={() => handleNavigation(NAV_ITEMS.UPCOMING)}
            />
            <NavItem 
                icon={PreviousIcon} 
                label={NAV_ITEMS.PREVIOUS} 
                isActive={activeView === NAV_ITEMS.PREVIOUS && !activeEvent}
                onClick={() => handleNavigation(NAV_ITEMS.PREVIOUS)}
            />
        </div>
        
        {/* Logout Placeholder */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
                // You should implement the actual logout logic/navigation here
                onClick={() => alert('Logout functionality goes here.')} 
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 bg-[#DC2626] text-white hover:bg-red-500 font-semibold shadow-md shadow-red-900/40`}
            >
                <LogoutIcon className="mr-3"/>
                <span className="text-sm">Logout</span>
            </button>
        </div>
      </aside>

      {/* 2. Main Content Area (Right Panel) */}
      <main className="flex-1 p-6 md:p-10 max-w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            {activeEvent && (
                <button 
                    onClick={() => setActiveEvent(null)} 
                    className={`mb-6 text-sm ${ACCENT_PRIMARY_TEXT} hover:underline flex items-center`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
                    Back to {activeView} List
                </button>
            )}
            {renderActiveContent()}
        </div>
      </main>
    </div>
  )
}