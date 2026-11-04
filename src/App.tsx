import { useEffect } from 'react'
import { Navbar } from './components/Navbar/Navbar'
import { Hero } from './components/Hero/Hero'
import { WhatWeDo } from './components/WhatWeDo/WhatWeDo'
import { HowWeWork } from './components/HowWeWork/HowWeWork'
import { WhatWeResolve } from './components/WhatWeResolve/WhatWeResolve'
import { GameSection } from './components/Game/Game'
import { Contact } from './components/Contact/Contact'
import { Footer } from './components/Footer/Footer'

function App() {
  useEffect(() => {
    const reveal = document.querySelectorAll('.reveal')
    const sections = document.querySelectorAll('main > section')
    const onReveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
          else if (entry.intersectionRatio === 0) entry.target.classList.remove('visible')
        })
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    )
    const onSection = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('section-in', entry.isIntersecting)
        })
      },
      { threshold: 0.12 },
    )
    reveal.forEach((el) => onReveal.observe(el))
    sections.forEach((el) => onSection.observe(el))
    return () => {
      onReveal.disconnect()
      onSection.disconnect()
    }
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhatWeDo />
        <HowWeWork />
        <WhatWeResolve />
        <GameSection />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
