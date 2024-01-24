import './App.css'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'

function App() {
  return (
    <MantineProvider>
      {
        <>
          <h1>roldtimehockey.com</h1>
          <div className='card'>
            <p>Planks loves Mark Messier</p>
          </div>
        </>
      }
    </MantineProvider>
  )
}

export default App
