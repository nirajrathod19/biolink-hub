import { useEffect } from 'react'
import { supabase } from './integrations/supabase/client' // Make sure this path is correct

function App() {
  
  useEffect(() => {
    const checkConnection = async () => {
      // Try to fetch 1 row from the 'profiles' table
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

  // ... rest of your code