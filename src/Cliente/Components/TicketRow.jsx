import { formatearFecha } from './Utils/formatoFecha';

function TicketRow({ ticket }) {
  const prioridadClase = {
    Alta: 'badge-prio alta',
    Media: 'badge-prio media',
    Baja: 'badge-prio baja',
  };

  const estadoClase = {
    Abierto: 'badge-status abierto',
    'En Proceso': 'badge-status progreso',
    Cerrado: 'badge-status resuelto',
  };

  return (
    <tr>
      <td><strong>#{ticket.id}</strong></td>
      <td className="td-title">{ticket.descripcion}</td>
      <td>
        <span className={`${estadoClase[ticket.estado]} text-capitalize`}>
          {ticket.estado}
        </span>
      </td>
      <td>
        <span className={`${prioridadClase[ticket.prioridad]} text-capitalize`}>
          {ticket.prioridad}
        </span>
      </td>
      <td>{formatearFecha(ticket.fecha)}</td>
      <td>
        <button className="btn-action" title="Ver detalle">
          <i className="fas fa-eye text-primary"></i>
        </button>
      </td>
    </tr>
  );
}

export default TicketRow;
