import { useEffect, useState } from 'react';
import axios from 'axios';

function DetalleTicketModal({ ticketId }) {
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchDetalle = async () => {
      if (!ticketId) return;

      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`http://localhost:5053/api/Ticket/detalle/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTicket(res.data);
      } catch (error) {
        console.error("Error al obtener detalle del ticket", error);
      }
    };

    fetchDetalle();
  }, [ticketId]);

  if (!ticket) return null;

  return (
    <div className="modal fade" id="modalDetalleTicket" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-eye me-2"></i>
              Detalle del Ticket #{ticket.id}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body">
            <p><strong>Descripción:</strong> {ticket.descripcion}</p>
            <p><strong>Estado:</strong> {ticket.estado}</p>
            <p><strong>Prioridad:</strong> {ticket.prioridad}</p>
            <p><strong>Servicio:</strong> {ticket.servicio}</p>
            <p><strong>Fecha de creación:</strong> {ticket.fecha}</p>

            {ticket.archivos && ticket.archivos.length > 0 && (
              <>
                <hr />
                <h6>Archivos adjuntos:</h6>
                <ul className="list-unstyled">
                  {ticket.archivos.map((archivo, index) => (
                    <li key={index}>
                      <a href={archivo.url} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-paperclip me-2"></i>{archivo.nombre}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleTicketModal;
