import React from 'react'

export default function About() {
  const items = [
    { year: "2023", text: "First experiments in a garage office." },
    { year: "2024", text: "Built local-first AI lab and toolchain." },
    { year: "2025", text: "Launch of TriWei.ai site and weekly show." },
  ]
  const facts = [
    "First studio mic was a borrowed gaming headset.",
    "We prototype offline first.",
    "Coffee to code ratio is classified."
  ]
  return (
    <section id="about" className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-semibold">About</h2>
      <ol className="mt-6 border-l border-zinc-800 pl-6 space-y-4">
        {items.map((i) => (
          <li key={i.year}>
            <div className="text-sm text-zinc-400">{i.year}</div>
            <div className="">{i.text}</div>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <div className="font-medium">Fun facts</div>
        <ul className="mt-2 list-disc pl-6 text-zinc-300">
          {facts.map(f => <li key={f}>{f}</li>)}
        </ul>
        <p className="mt-4 text-zinc-300">Mission: Make advanced AI useful, understandable, and ethical.</p>
      </div>
    </section>
  )
}
