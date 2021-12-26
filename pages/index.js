// import Head from 'next/head'

import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    // height of screen for this div will allow us to scroll the main Player area while the sidebar remains fixed
    <div className="bg-black h-screen overflow-hidden">
    <main className>
      <Sidebar />
      {/* Center */}
    </main>
      <div>
        {/* Player */}
      </div>
    </div>
  )
}
