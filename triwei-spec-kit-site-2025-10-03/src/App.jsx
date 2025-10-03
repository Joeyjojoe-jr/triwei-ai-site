import React from 'react'
import Header from './components/Header.jsx'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import Podcast from './sections/Podcast.jsx'
import Blog from './sections/Blog.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Podcast />
        <Blog />
      </main>
      <Footer />
    </div>
  )
}
