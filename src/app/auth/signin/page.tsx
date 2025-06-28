'use client'
import { signIn } from 'next-auth/react'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <button
        onClick={() => signIn('github' , {callbackUrl: '/dashboard'})} 
        className="flex items-center space-x-3 px-6 py-3 bg-gray-900 hover:bg-gray-700 rounded-md text-white font-semibold transition"
      >
        <svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.012c0 4.425 2.865 8.18 6.839 9.504.5.09.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.37-1.342-3.37-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.607.069-.607 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.34-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.254-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.908-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.394.1 2.648.64.7 1.028 1.594 1.028 2.687 0 3.848-2.339 4.695-4.566 4.942.36.31.68.924.68 1.863 0 1.345-.012 2.43-.012 2.76 0 .268.18.58.688.481A10.02 10.02 0 0022 12.011C22 6.484 17.523 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
        <span>Sign in with GitHub</span>
      </button>
    </div>
  )
}
