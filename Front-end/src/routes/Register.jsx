import React, { useState } from 'react'
import { register } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [form, setForm] = useState({ FullName:'', UserName:'', Email:'', DateOfBirth:'', Gender:'male', Password:'', NID:'', PhoneNumber:'' })
  const [profile, setProfile] = useState(null)
  const [cover, setCover] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  // Custom component for message display
  const MessageBanner = ({ message, type }) => (
    <div className={`p-3 text-sm font-medium border rounded-lg transition-all duration-300 mb-4 animate-fadeIn ${
      type === 'error' ? 'bg-red-800/50 border-red-500 text-red-300' :
      type === 'success' ? 'bg-green-800/50 border-green-500 text-green-300' : ''
    }`}>
      <span className="font-bold mr-2">{type === 'error' ? 'Error:' : 'Success:'}</span> {message}
    </div>
  );

  const onSubmit = async (e)=>{
    e.preventDefault()
    if (isLoading) return;

    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const fd = new FormData()
    // Append form fields
    Object.entries(form).forEach(([k,v])=>fd.append(k,v))
    // Append files
    if(profile) fd.append('ProfileImage', profile)
    if(cover) fd.append('CoverImage', cover)

    try{
      await register(fd)
      setSuccess('Account created successfully! Redirecting to login...')
      
      // Navigate to login after a brief pause
      setTimeout(() => navigate('/login'), 2000) 

    }catch(err){
      const errorMessage = err?.response?.data?.message || err?.message || 'Registration failed due to a server error.';
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // High-tech input style with dark/light mode support
  const inputClass = "w-full p-3 rounded-lg border border-transparent transition-all duration-300 focus:outline-none focus:ring-1 focus:shadow-lg font-mono text-sm " +
                     "dark:bg-black/30 dark:text-white dark:placeholder-slate-500 dark:focus:border-sciAccent dark:focus:ring-sciAccent dark:focus:shadow-cyan-500/20 " +
                     "bg-gray-100 text-lightText placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:shadow-blue-500/20";
  
  // Primary button style with neon gradient and active press effect
  const buttonClass = `w-full py-3 font-bold rounded-lg transition duration-300 transform active:scale-[0.98] ${
    isLoading 
      ? 'bg-gray-600/50 text-gray-400 cursor-wait'
      : 'bg-gradient-to-r from-sciAccent to-sciAccent2 text-sciBg shadow-neon hover:shadow-2xl hover:shadow-cyan-400/40'
  }`;

  // File input styling
  const fileLabelClass = "block text-sm font-medium mb-1 dark:text-slate-300 text-lightText";
  const fileInputClass = "w-full text-sm dark:text-slate-400 text-lightText file:mr-4 file:py-2 file:px-4 " +
                         "file:rounded-full file:border-0 file:text-sm file:font-semibold " +
                         "file:bg-sciAccent/20 dark:file:bg-sciAccent/20 file:text-sciAccent dark:file:text-sciAccent hover:file:bg-sciAccent/30";


  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-3xl p-8 rounded-2xl border transition-all duration-500 
                      dark:bg-sciPanel dark:border-sciAccent/30 dark:shadow-2xl dark:shadow-cyan-900/60 
                      bg-lightPanel border-gray-300 shadow-lg">

        <h2 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent 
                       dark:bg-gradient-to-r dark:from-white dark:to-sciAccent
                       bg-gradient-to-r from-lightText to-blue-800">
          SECURE REGISTRATION
        </h2>

        {error && <MessageBanner message={error} type="error" />}
        {success && <MessageBanner message={success} type="success" />}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Form Fields */}
          <input className={inputClass} placeholder="Full Name (Official)" required onChange={e=>setForm({...form, FullName:e.target.value})} disabled={isLoading} />
          <input className={inputClass} placeholder="User ID (Unique Username)" required onChange={e=>setForm({...form, UserName:e.target.value})} disabled={isLoading} />
          <input className={inputClass} placeholder="Email Address" type="email" required onChange={e=>setForm({...form, Email:e.target.value})} disabled={isLoading} />
          <input className={inputClass} placeholder="Date of Birth" type="date" required onChange={e=>setForm({...form, DateOfBirth:e.target.value})} disabled={isLoading} />
          
          <select className={inputClass} value={form.Gender} required onChange={e=>setForm({...form, Gender:e.target.value})} disabled={isLoading}>
            <option value="male">Gender: Male</option>
            <option value="female">Gender: Female</option>
            <option value="other">Gender: Other</option>
          </select>
          <input className={inputClass} placeholder="Secure Password" type="password" required onChange={e=>setForm({...form, Password:e.target.value})} disabled={isLoading} />
          <input className={inputClass} placeholder="NID Number / Govt ID" required onChange={e=>setForm({...form, NID:e.target.value})} disabled={isLoading} />
          <input className={inputClass} placeholder="Phone Number" required onChange={e=>setForm({...form, PhoneNumber:e.target.value})} disabled={isLoading} />
          
          {/* Image Uploads */}
          <div>
            <label className={fileLabelClass}>Upload Profile Avatar</label>
            <input type="file" className={fileInputClass} onChange={e=>setProfile(e.target.files[0])} disabled={isLoading} accept="image/*"/>
          </div>
          <div>
            <label className={fileLabelClass}>Upload Cover Image (Optional)</label>
            <input type="file" className={fileInputClass} onChange={e=>setCover(e.target.files[0])} disabled={isLoading} accept="image/*"/>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 mt-4">
            <button 
              type="submit" 
              className={buttonClass}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-sciBg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>PROCESSING CREDENTIALS...</span>
                </span>
              ) : (
                'CREATE ACCOUNT PROTOCOL'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}