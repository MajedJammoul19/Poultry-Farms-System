import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar';
import FuelReports from '../components/FeulReports';
import Footer from '../components/Footer';
const FuelReportsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
         <Header />
         
         <div className="flex flex-1">
           <Sidebar />
           
           <main className="flex-1 p-6 overflow-auto">
             <FuelReports />
            
           </main>
         </div>
         
         <Footer />
       </div>
  )
}

export default FuelReportsPage
