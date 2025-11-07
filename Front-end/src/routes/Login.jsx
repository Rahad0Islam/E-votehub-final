import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, renew } from '../lib/api';

export default function Login(){
  const [UserName, setUserName] = useState('');
  const [Password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Custom component for the error message display
  const ErrorBanner = ({ message }) => (
    <div className="p-3 text-sm font-medium bg-red-800/50 border border-red-500 rounded-lg text-red-300 transition-all duration-300 mb-4 animate-fadeIn">
      <span className="font-bold mr-2">Access Denied:</span> {message}
    </div>
  );

  const onSubmit = async (e)=>{
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try{
      await login({ UserName, Password });
      await renew(); // ensure fresh tokens
      
      // Navigate after successful login
      navigate('/user');

    }catch(err){
      const errorMessage = err?.response?.data?.message || 'Authentication failed. Check your User ID and Password.';
      setError(errorMessage);
      
      // Auto-clear the error message after a few seconds
      setTimeout(() => setError(null), 5000);
      
    } finally {
      setIsLoading(false);
    }
  }

  // --- Styling Classes ---
  // High-tech input style with glow effect on focus
  const inputClass = "w-full p-3 bg-black/30 border border-transparent rounded-lg text-white placeholder-slate-500 transition-all duration-300 focus:outline-none focus:border-sciAccent focus:ring-1 focus:ring-sciAccent focus:shadow-lg focus:shadow-cyan-500/20 font-mono text-sm";
  
  // Primary button style with neon gradient and active press effect
  const buttonClass = `w-full py-3 font-bold rounded-lg transition duration-300 transform active:scale-[0.98] ${
    isLoading 
      ? 'bg-gray-600/50 text-gray-400 cursor-wait'
      : 'bg-gradient-to-r from-sciAccent to-sciAccent2 text-sciBg shadow-neon hover:shadow-2xl hover:shadow-cyan-400/40'
  }`;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] py-12">
      <div 
        className="w-full max-w-sm p-8 rounded-2xl bg-sciPanel backdrop-blur-sm border border-sciAccent/30 shadow-2xl shadow-cyan-900/60 transition-all duration-500 hover:border-sciAccent2/50"
        style={{
          // Subtle background texture for sci-fi look (low-opacity grid SVG)
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'30\' height=\'30\' viewBox=\'0 0 30 30\'%3E%3Cpath fill=\'%230f1628\' fill-opacity=\'0.5\' d=\'M3 0h1v1h-1zM6 0h1v1h-1zM9 0h1v1h-1zM12 0h1v1h-1zM15 0h1v1h-1zM18 0h1v1h-1zM21 0h1v1h-1zM24 0h1v1h-1zM27 0h1v1h-1zM0 3h1v1h-1zM3 3h1v1h-1zM6 3h1v1h-1zM9 3h1v1h-1zM12 3h1v1h-1zM15 3h1v1h-1zM18 3h1v1h-1zM21 3h1v1h-1zM24 3h1v1h-1zM27 3h1v1h-1zM0 6h1v1h-1zM3 6h1v1h-1zM6 6h1v1h-1zM9 6h1v1h-1zM12 6h1v1h-1zM15 6h1v1h-1zM18 6h1v1h-1zM21 6h1v1h-1zM24 6h1v1h-1zM27 6h1v1h-1zM0 9h1v1h-1zM3 9h1v1h-1zM6 9h1v1h-1zM9 9h1v1h-1zM12 9h1v1h-1zM15 9h1v1h-1zM18 9h1v1h-1zM21 9h1v1h-1zM24 9h1v1h-1zM27 9h1v1h-1zM0 12h1v1h-1zM3 12h1v1h-1zM6 12h1v1h-1zM9 12h1v1h-1zM12 12h1v1h-1zM15 12h1v1h-1zM18 12h1v1h-1zM21 12h1v1h-1zM24 12h1v1h-1zM27 12h1v1h-1zM0 15h1v1h-1zM3 15h1v1h-1zM6 15h1v1h-1zM9 15h1v1h-1zM12 15h1v1h-1zM15 15h1v1h-1zM18 15h1v1h-1zM21 15h1v1h-1zM24 15h1v1h-1zM27 15h1v1h-1zM0 18h1v1h-1zM3 18h1v1h-1zM6 18h1v1h-1zM9 18h1v1h-1zM12 18h1v1h-1zM15 18h1v1h-1zM18 18h1v1h-1zM21 18h1v1h-1zM24 18h1v1h-1zM27 18h1v1h-1zM0 21h1v1h-1zM3 21h1v1h-1zM6 21h1v1h-1zM9 21h1v1h-1zM12 21h1v1h-1zM15 21h1v1h-1zM18 21h1v1h-1zM21 21h1v1h-1zM24 21h1v1h-1zM27 21h1v1h-1zM0 24h1v1h-1zM3 24h1v1h-1zM6 24h1v1h-1zM9 24h1v1h-1zM12 24h1v1h-1zM15 24h1v1h-1zM18 24h1v1h-1zM21 24h1v1h-1zM24 24h1v1h-1zM27 24h1v1h-1zM0 27h1v1h-1zM3 27h1v1h-1zM6 27h1v1h-1zM9 27h1v1h-1zM12 27h1v1h-1zM15 27h1v1h-1zM18 27h1v1h-1zM21 27h1v1h-1zM24 27h1v1h-1zM27 27h1v1h-1zM2 0h1v1h-1zM5 0h1v1h-1zM8 0h1v1h-1zM11 0h1v1h-1zM14 0h1v1h-1zM17 0h1v1h-1zM20 0h1v1h-1zM23 0h1v1h-1zM26 0h1v1h-1zM29 0h1v1h-1zM2 3h1v1h-1zM5 3h1v1h-1zM8 3h1v1h-1zM11 3h1v1h-1zM14 3h1v1h-1zM17 3h1v1h-1zM20 3h1v1h-1zM23 3h1v1h-1zM26 3h1v1h-1zM29 3h1v1h-1zM2 6h1v1h-1zM5 6h1v1h-1zM8 6h1v1h-1zM11 6h1v1h-1zM14 6h1v1h-1zM17 6h1v1h-1zM20 6h1v1h-1zM23 6h1v1h-1zM26 6h1v1h-1zM29 6h1v1h-1zM2 9h1v1h-1zM5 9h1v1h-1zM8 9h1v1h-1zM11 9h1v1h-1zM14 9h1v1h-1zM17 9h1v1h-1zM20 9h1v1h-1zM23 9h1v1h-1zM26 9h1v1h-1zM29 9h1v1h-1zM2 12h1v1h-1zM5 12h1v1h-1zM8 12h1v1h-1zM11 12h1v1h-1zM14 12h1v1h-1zM17 12h1v1h-1zM20 12h1v1h-1zM23 12h1v1h-1zM26 12h1v1h-1zM29 12h1v1h-1zM2 15h1v1h-1zM5 15h1v1h-1zM8 15h1v1h-1zM11 15h1v1h-1zM14 15h1v1h-1zM17 15h1v1h-1zM20 15h1v1h-1zM23 15h1v1h-1zM26 15h1v1h-1zM29 15h1v1h-1zM2 18h1v1h-1zM5 18h1v1h-1zM8 18h1v1h-1zM11 18h1v1h-1zM14 18h1v1h-1zM17 18h1v1h-1zM20 18h1v1h-1zM23 18h1v1h-1zM26 18h1v1h-1zM29 18h1v1h-1zM2 21h1v1h-1zM5 21h1v1h-1zM8 21h1v1h-1zM11 21h1v1h-1zM14 21h1v1h-1zM17 21h1v1h-1zM20 21h1v1h-1zM23 21h1v1h-1zM26 21h1v1h-1zM29 21h1v1h-1zM2 24h1v1h-1zM5 24h1v1h-1zM8 24h1v1h-1zM11 24h1v1h-1zM14 24h1v1h-1zM17 24h1v1h-1zM20 24h1v1h-1zM23 24h1v1h-1zM26 24h1v1h-1zM29 24h1v1h-1zM2 27h1v1h-1zM5 27h1v1h-1zM8 27h1v1h-1zM11 27h1v1h-1zM14 27h1v1h-1zM17 27h1v1h-1zM20 27h1v1h-1zM23 27h1v1h-1zM26 27h1v1h-1zM29 27h1v1h-1z\'%3E%3C/path%3E%3C/svg%3E")'
        }}
      >
        <h2 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-sciAccent">
          SYSTEM LOGIN
        </h2>

        {/* Error Banner */}
        {error && <ErrorBanner message={error} />}

        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1 text-slate-300">
              User ID
            </label>
            <input 
              id="username"
              className={inputClass} 
              placeholder="Voter ID, Candidate ID, or Admin User" 
              value={UserName} 
              onChange={e=>setUserName(e.target.value)} 
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-slate-300">
              Encrypted Key
            </label>
            <input 
              id="password"
              className={inputClass} 
              placeholder="••••••••••••••••" 
              type="password" 
              value={Password} 
              onChange={e=>setPassword(e.target.value)} 
              disabled={isLoading}
              required
            />
          </div>

          {/* Sign In Button */}
          <button 
            type="submit" 
            className={buttonClass}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                {/* Custom loading spinner using SVG */}
                <svg className="animate-spin h-5 w-5 text-sciBg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>ACCESSING SYSTEM...</span>
              </span>
            ) : (
              'INITIATE SIGN-IN PROTOCOL'
            )}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-400">
          Don't have an account? <Link to="/register" className="text-sciAccent hover:text-sciAccent2 transition-colors duration-200 underline font-semibold">REGISTER</Link>
        </p>

      </div>
    </div>
  )
}