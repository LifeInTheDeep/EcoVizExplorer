import { useState } from 'react'

import './App.css'
import Map from './Map'
import SplashScreen from './components/splashscreen/splashscreen'

function App() {
  const [splashScreen, setSplashScreen] = useState(true)

  return (
    <>
      {
        splashScreen && <SplashScreen setSplashScreen={setSplashScreen} />
      }
      <Map />
    </>
  )
}

export default App
