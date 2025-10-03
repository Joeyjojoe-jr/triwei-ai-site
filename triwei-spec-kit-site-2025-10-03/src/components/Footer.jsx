import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-black">
      <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-4 gap-8">
        <div>
          <div className="font-semibold mb-2">Company</div>
          <ul className="space-y-1 text-sm">
            <li><a className="hover:underline" href="#about">About</a></li>
            <li><a className="hover:underline" href="#contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Resources</div>
          <ul className="space-y-1 text-sm">
            <li><a className="hover:underline" href="#podcast">Podcast</a></li>
            <li><a className="hover:underline" href="#blog">Blog</a></li>
          </ul>
        </div>
        <div id="subscribe">
          <div className="font-semibold mb-2">Subscribe</div>
          <form className="space-y-2">
            <label htmlFor="email" className="sr-only">Email</label>
            <input id="email" type="email" placeholder="you@example.com" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2" />
            <button type="button" className="w-full bg-zinc-100 text-black rounded-xl px-3 py-2">Subscribe</button>
          </form>
        </div>
        <div>
          <div className="font-semibold mb-2">Social</div>
          <p className="text-sm">Follow for weekly drops.</p>
        </div>
      </div>
      <div className="text-xs text-zinc-400 px-4 py-6 text-center border-t border-zinc-800">
        © 2025 TriWei.ai. All rights reserved. Except for the cookies—we ate those.
      </div>
    </footer>
  )
}
