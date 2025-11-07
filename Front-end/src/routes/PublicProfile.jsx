import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicUserProfile } from '../lib/api'

const BG = 'bg-[#ECEBEB] dark:bg-[#1A2129]'
const PANEL = 'bg-white dark:bg-[#111827]'
const TEXT = 'text-gray-900 dark:text-white'
const TEXT_SECONDARY = 'text-gray-600 dark:text-slate-400'

export default function PublicProfile(){
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    getPublicUserProfile(id)
      .then(u=>{ if(mounted) setUser(u) })
      .catch(e=>{ if(mounted) setError(e?.response?.data?.message || 'Failed to load user') })
      .finally(()=>{ if(mounted) setLoading(false) })
    return ()=>{ mounted=false }
  },[id])

  if(loading) return <div className={`${BG} ${TEXT} p-6 rounded-xl border border-gray-200 dark:border-gray-700`}>Loading profile...</div>
  if(error) return <div className={`${BG} ${TEXT} p-6 rounded-xl border border-gray-200 dark:border-gray-700`}>Error: {error}</div>
  if(!user) return <div className={`${BG} ${TEXT} p-6 rounded-xl border border-gray-200 dark:border-gray-700`}>User not found.</div>

  return (
    <div className={`${BG} min-h-[50vh]`}>
      <div className={`p-6 rounded-xl ${PANEL} ${TEXT} border border-gray-200 dark:border-gray-700 shadow-xl max-w-3xl mx-auto`}>
        <div className="flex items-center gap-4 mb-6">
          <img src={user.ProfileImage || 'https://placehold.co/80x80/d1d5db/4b5563?text=U'} alt={user.FullName} className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-700" />
          <div>
            <div className="text-2xl font-bold">{user.FullName}</div>
            <div className={`text-sm ${TEXT_SECONDARY}`}>@{user.UserName}</div>
          </div>
        </div>
        {user.CoverImage && (
          <div className="mb-4">
            <img src={user.CoverImage} alt="cover" className="w-full rounded-lg object-cover max-h-64" />
          </div>
        )}
        <div className={`${TEXT_SECONDARY}`}>
          <div>Email: <span className={`${TEXT}`}>{user.Email}</span></div>
          {user.DateOfBirth && <div>DOB: <span className={`${TEXT}`}>{new Date(user.DateOfBirth).toLocaleDateString()}</span></div>}
        </div>
      </div>
    </div>
  )
}
