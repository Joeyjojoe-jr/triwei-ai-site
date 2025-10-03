import React from 'react'
import posts from '../../content/blog/posts.json'

export default function Blog() {
  return (
    <section id="blog" className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-semibold">Blog</h2>
      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        {posts.map(p => (
          <article key={p.slug} className="border border-zinc-800 rounded-2xl p-4">
            <div className="text-sm text-zinc-400">{p.readTime} min read</div>
            <div className="font-medium mt-1">{p.title}</div>
            <p className="text-sm text-zinc-300 mt-1">{p.dek}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
