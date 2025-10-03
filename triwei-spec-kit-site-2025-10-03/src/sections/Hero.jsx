import React from 'react'

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 pt-12 pb-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Practical AI. Real outcomes.</h1>
          <p className="mt-3 text-zinc-300">Weekly briefings, tools, and a 30-minute video podcast.</p>
          <div className="mt-6 flex gap-3">
            <a href="#podcast" className="bg-zinc-100 text-black rounded-xl px-4 py-2">Watch the latest episode</a>
            <a href="#subscribe" className="border border-zinc-700 rounded-xl px-4 py-2">Get the newsletter</a>
          </div>
          <p className="mt-3 text-sm text-zinc-400">Minimalist design with a hamburger menu so satisfying it might make you hungry.</p>
        </div>
        <div className="aspect-video rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_20%_20%,#18181b,transparent_35%),radial-gradient(circle_at_80%_20%,#0ea5e9,transparent_35%),radial-gradient(circle_at_50%_80%,#22c55e,transparent_30%)] shadow-inner">
        </div>
      </div>
    </section>
  )
}
