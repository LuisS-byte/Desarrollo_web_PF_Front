import { Route, Routes, Navigate } from 'react-router-dom'; 
import LoginPage from './Components/LoginPage';
import MenuEmpleado from './Components/MenuEmpleado';
import MenuCliente from './Components/MenuCliente'; 
import MenuAdministrador from './Components/MenuAdministrador';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/MenuCliente" element={<MenuCliente/>}/>
      <Route path="/MenuEmpleado" element={<MenuEmpleado/>}/>
      <Route path="/MenuAdministrador" element={<MenuAdministrador/>}/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;