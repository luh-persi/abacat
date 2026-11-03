import { Navbar } from './components/Navbar/Navbar'
import { Hero } from './components/Hero/Hero'
import { WhatWeDo } from './components/WhatWeDo/WhatWeDo'
import { HowWeWork } from './components/HowWeWork/HowWeWork'
import { WhatWeResolve } from './components/WhatWeResolve/WhatWeResolve'
import { GameSection } from './components/Game/Game'
import { Contact } from './components/Contact/Contact'
import { Footer } from './components/Footer/Footer'

function App() {
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
