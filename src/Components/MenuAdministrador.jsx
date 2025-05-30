import { useLocation } from 'react-router-dom';
import "./Css/MenuAdministrador.css";

function MenuAdministrador() {
  const location = useLocation();
  const usuario = location.state?.usuario;

  return (
    <div className="menu-container">
      <h1 className="menu-header">Menu Administrador</h1>
      {usuario && (
        <div className="user-info">
          <p>Bienvenido: {usuario.usuarioNombre}</p>
          <p>Correo: {usuario.correo}</p>
          <p>Rol: {usuario.rol}</p>
        </div>
      )}
    </div>
  );
}

export default MenuAdministrador;