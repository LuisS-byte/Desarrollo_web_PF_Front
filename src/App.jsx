import { Route, Routes, Navigate } from 'react-router-dom'; 
import LoginPage from './Components/LoginPage';
import MenuCliente from './Components/MenuCliente'; 
import MenuAdministrador from './Components/administrator/MenuAdministrador';
import MenuTickets from './Components/administrator/MenuTickets';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import MenuEmpleado from './Components/Employee/MenuEmpleado';
import CrearTicketEmpleado from './Components/Employee/CrearTicketEMpleado';
import DetalleTicket from './Components/administrator/DetalleTicket';
import Reportes from './Components/administrator/Reportes';
import GestionUsuario from './Components/administrator/GestionUsuario';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/MenuCliente" element={<MenuCliente/>}/>
      <Route path="/MenuEmpleado" element={<MenuEmpleado/>}/>
      <Route path="/MenuAdministrador" element={<MenuAdministrador/>}/>
      <Route path="/MenuTickets" element={<MenuTickets/>}/>
      <Route path="/CrearTicketEmpleado" element={<CrearTicketEmpleado/>}/>
      <Route path="/detalle/:id" element={<DetalleTicket />} />
      <Route path="/GestionUsuario" element={<GestionUsuario />} />
      <Route path="/GenerarReporte" element={<Reportes/>}/>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;