import React from 'react'
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

import MedicalRequest from '../components/MedicalRequest'
import Footer from '../components/Footer';
const MedicalRequestPage = () => {
  return (
     <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <MedicalRequest />
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

export default MedicalRequestPage
