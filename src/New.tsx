import { useEffect } from 'react'
import { supabase } from './integrations/supabase/client'

function App() {
  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (error) {
        console.error("❌ Connection Error:", error.message)
      } else {
        console.log("✅ Connection Successful!", data)
      }
    }
    checkConnection()
  }, [])

  return <div>Connection Test</div>
}

export default App