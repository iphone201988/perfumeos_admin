import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar/SideBar';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import ManageUsers from './components/ManageUsers/ManageUsers';
import ManagePerfum from './components/ManagePerfum/ManagePerfum';

function App() {
  
  return (
    <Router>
      <div>
        <SideBar />
        <main className="ml-[320px] absolute w-[calc(100%-320px)] min-h-[100vh] top-[0] bg-[#ffff] max-lg:w-full max-lg:ml-0">
          <Header />
          <div className="p-[32px]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<ManageUsers />} />
              <Route path="/perfumes" element={<ManagePerfum />} />
              {/* Add more routes as needed */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
