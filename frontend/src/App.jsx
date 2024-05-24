import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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
      <Map></Map>
    </>
  )
}

export default App
