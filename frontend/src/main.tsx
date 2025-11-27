import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Προσοχή: Εδώ συνδέεται το React με το HTML.
// Συνήθως το id είναι 'root' ή 'app'. Θα το τσεκάρουμε στο βήμα 2.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)