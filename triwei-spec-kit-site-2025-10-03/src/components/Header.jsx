import React, { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-zinc-950/70 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="font-semibold">TriWei.ai</a>
        <button aria-label="Open menu" onClick={() => setOpen(!open)} className="relative group p-2">
          <span className="sr-only">Menu</span>
          <div className="w-6 space-y-1.5">
            <div className="h-0.5 bg-zinc-100"></div>
            <div className="h-0.5 bg-zinc-100"></div>
            <div className="h-0.5 bg-zinc-100"></div>
          </div>
        </button>
      </div>
      {open && (
        <nav className="border-t border-zinc-800 bg-zinc-950">
          <ul className="max-w-6xl mx-auto px-4 py-4 grid gap-2 sm:grid-cols-5">
            <li><a className="hover:underline" href="#about">About</a></li>
            <li><a className="hover:underline" href="#podcast">Podcast</a></li>
            <li><a className="hover:underline" href="#blog">Blog</a></li>
            <li><a className="hover:underline" href="#subscribe">Subscribe</a></li>
            <li><a className="hover:underline" href="#contact">Contact</a></li>
          </ul>
        </nav>
      )}
    </header>
  )
}
