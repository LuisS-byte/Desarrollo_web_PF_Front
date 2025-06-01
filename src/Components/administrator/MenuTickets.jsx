import { useState, useEffect } from 'react';
import axios from 'axios';
import "./MenuTickets.css";
import { useNavigate } from 'react-router-dom';

function MenuTickets() {
  const [ticketsPendientes, setTicketsPendientes] = useState([]);
  const [ticketsAsignados, setTicketsAsignados] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal de asignación
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [comentario, setComentario] = useState('');
const navigate = useNavigate();

  const [filtroPendientes, setFiltroPendientes] = useState({
    busqueda: '',
    prioridad: '',
    categoria: ''
  });

  const [filtroAsignados, setFiltroAsignados] = useState({
    busqueda: '',
    tecnico: '',
    estado: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          pendientesRes,
          asignadosRes,
          tecnicosRes,
          prioridadesRes,
          estadosRes,
          serviciosRes
        ] = await Promise.all([
          axios.get('http://localhost:5053/api/Administrador/TicketsPendientesAsignacion'),
          axios.get('http://localhost:5053/api/Administrador/TicketsAsignados'),
          axios.get('http://localhost:5053/api/Administrador/ListaTecnicos'),
          axios.get('http://localhost:5053/api/Administrador/ListaPrioridades'),
          axios.get('http://localhost:5053/api/Administrador/ListaEstados'),
          axios.get('http://localhost:5053/api/Administrador/ListaServicios')
        ]);

        setTicketsPendientes(pendientesRes.data.value);
        setTicketsAsignados(asignadosRes.data.value);
        setTecnicos(tecnicosRes.data.value);
        setPrioridades(prioridadesRes.data.value);
        setEstados(estadosRes.data.value);
        setServicios(serviciosRes.data.value);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtrarPendientes = () => {
    return ticketsPendientes
      .filter(ticket => {
        const tituloMatch = ticket.titulo.toLowerCase().includes(filtroPendientes.busqueda.toLowerCase());
        const prioridadMatch = !filtroPendientes.prioridad || ticket.prioridad === filtroPendientes.prioridad;
        const categoriaMatch = !filtroPendientes.categoria || ticket.categoria === filtroPendientes.categoria;
        return tituloMatch && prioridadMatch && categoriaMatch;
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  };

  const filtrarAsignados = () => {
    return ticketsAsignados
      .filter(ticket => {
        const tituloMatch = ticket.titulo.toLowerCase().includes(filtroAsignados.busqueda.toLowerCase());
        const tecnicoMatch = !filtroAsignados.tecnico || ticket.tecnico === filtroAsignados.tecnico;
        const estadoMatch = !filtroAsignados.estado || ticket.estado === filtroAsignados.estado;
        return tituloMatch && tecnicoMatch && estadoMatch;
      })
      .sort((a, b) => new Date(b.fechaAsignacion) - new Date(a.fechaAsignacion));
  };

  // Función para abrir el modal de asignación
  const handleAsignarClick = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedTecnico('');
    setComentario('');
    setShowModal(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Función para enviar la asignación
  const handleSubmitAsignacion = async () => {
    try {
      if (!selectedTecnico) {
        alert('Por favor seleccione un técnico');
        return;
      }

      const tecnicoSeleccionado = tecnicos.find(t => t.nombre === selectedTecnico);
      
      const payload = {
        idTicket: selectedTicket.id,
        idUsuairo: tecnicoSeleccionado.id,
        descripcion: comentario
      };

      const response = await axios.post('http://localhost:5053/api/Administrador/CrearTicketAsignacion', payload);

      if (response.data.success) {
        // Actualizar la lista de tickets
        const [pendientesRes, asignadosRes] = await Promise.all([
          axios.get('http://localhost:5053/api/Administrador/TicketsPendientesAsignacion'),
          axios.get('http://localhost:5053/api/Administrador/TicketsAsignados')
        ]);

        setTicketsPendientes(pendientesRes.data.value);
        setTicketsAsignados(asignadosRes.data.value);
        
        setShowModal(false);
        navigate('/MenuTickets');

      } else {
        alert('Error al asignar el ticket: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error al asignar ticket:', error);
      alert('Error al asignar el ticket: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="tick-root">
      {/* Modal de Asignación */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5>Asignar Ticket #{selectedTicket.id.toString().padStart(3, '0')}</h5>
              <button className="modal-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Técnico:</label>
                <select
                  className="form-select"
                  value={selectedTecnico}
                  onChange={(e) => setSelectedTecnico(e.target.value)}
                >
                  <option value="">Seleccione un técnico</option>
                  {tecnicos.map(tecnico => (
                    <option key={tecnico.id} value={tecnico.nombre}>
                      {tecnico.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Comentario:</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Ingrese un comentario para la asignación..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmitAsignacion}>
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sidebar">
        <h4>Menú</h4>
        <a href="/MenuAdministrador"><i className="fas fa-home"></i> Dashboard</a>
        <a href="/MenuTickets"><i className="fas fa-ticket-alt"></i> Tickets</a>
        <a href="#"><i className="fas fa-users"></i> Usuarios</a>
        <a href="#"><i className="fas fa-cogs"></i> Configuración</a>
        <a href="#"><i className="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
      </div>

      <div className="navbar">
        <h5>Administración</h5>
      </div>

      <div className="dashboard-container2">
        {/* Sección de Tickets Pendientes */}
        <div className="admin-card">
          <h5 className="card-title"><i className="fas fa-clipboard-list"></i> Tickets pendientes de asignación</h5>
          
          <div className="filter-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar ticket..."
              value={filtroPendientes.busqueda}
              onChange={(e) => setFiltroPendientes({...filtroPendientes, busqueda: e.target.value})}
            />
            <select 
              className="form-select"
              value={filtroPendientes.prioridad}
              onChange={(e) => setFiltroPendientes({...filtroPendientes, prioridad: e.target.value})}
            >
              <option value="">Prioridad</option>
              {prioridades.map(prioridad => (
                <option key={prioridad.id} value={prioridad.nombre}>
                  {prioridad.nombre}
                </option>
              ))}
            </select>
            <select 
              className="form-select"
              value={filtroPendientes.categoria}
              onChange={(e) => setFiltroPendientes({...filtroPendientes, categoria: e.target.value})}
            >
              <option value="">Categoría</option>
              {servicios.map(servicio => (
                <option key={servicio.id} value={servicio.nombre}>
                  {servicio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Prioridad</th>
                  <th>Categoría</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrarPendientes().map(ticket => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id.toString().padStart(3, '0')}</td>
                    <td>{ticket.titulo}</td>
                    <td>
                      <span className={`badge-prio ${ticket.prioridad.toLowerCase().replace(/\s/g, '')}`}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td>{ticket.categoria || 'N/A'}</td>
                    <td>{new Date(ticket.fecha).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-action" 
                        title="Asignar"
                        onClick={() => handleAsignarClick(ticket)}
                      >
                        <i className="fas fa-user-plus"></i>
                      </button>
                      <button className="btn-action" title="Ver Detalle">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección de Tickets Asignados */}
        <div className="admin-card">
          <h5 className="card-title"><i className="fas fa-tasks"></i> Tickets asignados</h5>
          
          <div className="filter-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar ticket..."
              value={filtroAsignados.busqueda}
              onChange={(e) => setFiltroAsignados({...filtroAsignados, busqueda: e.target.value})}
            />
            <select 
              className="form-select"
              value={filtroAsignados.tecnico}
              onChange={(e) => setFiltroAsignados({...filtroAsignados, tecnico: e.target.value})}
            >
              <option value="">Técnico</option>
              {tecnicos.map(tecnico => (
                <option key={tecnico.id} value={tecnico.nombre}>
                  {tecnico.nombre}
                </option>
              ))}
            </select>
            <select 
              className="form-select"
              value={filtroAsignados.estado}
              onChange={(e) => setFiltroAsignados({...filtroAsignados, estado: e.target.value})}
            >
              <option value="">Estado</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.nombre}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Técnico</th>
                  <th>Estado</th>
                  <th>Fecha Asignación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrarAsignados().map(ticket => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id.toString().padStart(3, '0')}</td>
                    <td>{ticket.titulo}</td>
                    <td>{ticket.tecnico}</td>
                    <td>
                      <span className={`badge-status ${ticket.estado.toLowerCase().replace(/\s/g, '')}`}>
                        {ticket.estado}
                      </span>
                    </td>
                    <td>{new Date(ticket.fechaAsignacion).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-action" title="Ver Detalle">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuTickets;