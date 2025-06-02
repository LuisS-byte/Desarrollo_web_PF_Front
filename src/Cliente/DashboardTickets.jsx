import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // ✅ CORREGIDO: sin llaves
import NavbarCliente from './Components/NavbarCliente';
import StatsResumen from './Components/StatsResumen';
import TablaTickets from './Components/TablaTickets';
import CrearTicketModal from './Components/CrearTicketModal'; // ✅ NUEVO
import './cliente.css';

function DashboardTickets() {
  const [tickets, setTickets] = useState([]);
  const [usuarioNombre, setUsuarioNombre] = useState('');

  const fetchTickets = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await axios.get('http://localhost:5053/api/Ticket/mis-tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Error al obtener tickets", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      setUsuarioNombre(decoded.name || 'Usuario');
    }
    fetchTickets();
  }, []);

  const abiertos = tickets.filter(t => t.estado === 'Abierto').length;
  const enProceso = tickets.filter(t => t.estado === 'En Proceso').length;
  const resueltos = tickets.filter(t => t.estado === 'Cerrado').length;

  return (
    <>
      <NavbarCliente nombreUsuario={usuarioNombre} />
      <div className="container-fluid">
        <div className="user-welcome">
          <h4>Bienvenido, {usuarioNombre}</h4>
          <p>Aquí puedes ver y gestionar todos tus tickets.</p>
        </div>

        <StatsResumen abiertos={abiertos} enProceso={enProceso} resueltos={resueltos} />
         {/* ✅ Botón para abrir modal */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-add-ticket" data-bs-toggle="modal" data-bs-target="#modalCrearTicket">
            <i className="fas fa-plus me-1"></i> Nuevo Ticket
          </button>
        </div>
        <TablaTickets tickets={tickets} />
      </div>

      {/* ✅ Modal para crear ticket */}
      <CrearTicketModal onTicketCreated={fetchTickets} />
    </>
  );
}

export default DashboardTickets;
