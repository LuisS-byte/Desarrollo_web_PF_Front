import { useNavigate } from 'react-router-dom';

function NavbarCliente({ nombreUsuario }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Borra el token
    navigate('/login'); // Redirige al login
  };

  return (
    <div className="navbar">
      <h5><i className="fas fa-ticket-alt me-2"></i>Sistema de Tickets</h5>
      <div>
        <div className="dropdown d-inline-block">
          <button className="btn btn-outline-light btn-sm dropdown-toggle" data-bs-toggle="dropdown">
            <i className="fas fa-user-circle me-1"></i> {nombreUsuario}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NavbarCliente;
