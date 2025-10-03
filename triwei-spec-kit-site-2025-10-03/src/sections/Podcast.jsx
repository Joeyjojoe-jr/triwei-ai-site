import React from 'react'
import episodeData from '../../content/podcast/episodes.json'

export default function Podcast() {
  const latest = episodeData[0]
  return (
    <section id="podcast" className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-semibold">AI news without the noise.</h2>
      <div className="mt-6 grid lg:grid-cols-2 gap-8">
        <div className="aspect-video rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500">
          <span>Episode player placeholder</span>
        </div>
        <div>
          <h3 className="text-xl font-medium">{latest.title}</h3>
          <p className="mt-2 text-zinc-300">{latest.summary}</p>
          <p className="mt-2 text-sm text-zinc-400">{latest.duration} • {latest.date}</p>
          <div className="mt-4 flex gap-3">
            <a href={latest.link} className="bg-zinc-100 text-black rounded-xl px-4 py-2">Watch</a>
            <a href={latest.shownotes} className="border border-zinc-700 rounded-xl px-4 py-2">Show notes</a>
          </div>
        </div>
      </div>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {episodeData.slice(0,3).map((ep) => (
          <article key={ep.slug} className="border border-zinc-800 rounded-2xl p-4">
            <div className="text-sm text-zinc-400">{ep.date} • {ep.duration}</div>
            <div className="font-medium mt-1">{ep.title}</div>
            <p className="text-sm text-zinc-300 mt-1">{ep.summary}</p>
            <div className="mt-3 flex gap-2">
              <a href={ep.link} className="text-sm underline">Watch</a>
              <a href={ep.shownotes} className="text-sm underline">Show notes</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
