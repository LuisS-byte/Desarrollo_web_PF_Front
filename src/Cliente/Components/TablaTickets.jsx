import { useState } from 'react';
import TicketRow from './TicketRow';
import DetalleTicketModal from './DetalleTicketModal'; 

function TablaTickets({ tickets }) {
  const [filtro, setFiltro] = useState('');
const [ticketSeleccionadoId, setTicketSeleccionadoId] = useState(null);


  const ticketsFiltrados = tickets.filter(ticket =>
    ticket.descripcion.toLowerCase().includes(filtro.toLowerCase()) ||
    ticket.estado.toLowerCase().includes(filtro.toLowerCase()) ||
    ticket.prioridad.toLowerCase().includes(filtro.toLowerCase())
  );

   return (
    <>
      <div className="tickets-table mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <h6 className="mb-2 mb-md-0 fw-bold">
            <i className="fa-solid fa-ticket-simple"></i> Listado de Tickets
          </h6>
          <input
            type="text"
            className="form-control search-bar"
            placeholder="Buscar ticket..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table custom-table align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripcion</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha de creacion</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.length > 0 ? (
                ticketsFiltrados.map(ticket => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    onVerDetalle={() => setTicketSeleccionadoId(ticket.id)} // ✅
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No se encontraron tickets</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetalleTicketModal ticketId={ticketSeleccionadoId} />
    </>
  );
}

export default TablaTickets;
  