import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./LoginPage.css";

function LoginPage() {
  const [formData, setFormData] = useState({
    correo: '',
    clave: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5053/api/Acceso/Login',
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.isSuccess) {
        localStorage.setItem('authToken', response.data.token);
        switch (response.data.rol) {
            case "Administrador":
              navigate('/MenuAdministrador', {
            state: { usuario: response.data } 
          });
            break;

            case "Soporte Técnico":
            navigate('/MenuEmpleado', {
            state: { usuario: response.data } 
          });
            break;

            case "Usuario Final":
            navigate('/MenuCliente', {
            state: { usuario: response.data } 
          });
            break;
        
        }
      } else {
        setError(response.data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
    <section className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Login</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="inputbox">
          <ion-icon name="mail-outline"></ion-icon>
          <input 
            type="email" 
            name="correo"
            required 
            value={formData.correo}
            onChange={handleChange}
          />
          <label>Correo</label>
        </div>
        
        <div className="inputbox">
          <ion-icon name="lock-closed-outline"></ion-icon>
          <input 
            type="password" 
            name="clave"
            required 
            value={formData.clave}
            onChange={handleChange}
          />
          <label>Contraseña</label>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
        
        <div className="register">
          <p>No tienes una cuenta? <Link to="/registro">Regístrate</Link></p>
        </div>
      </form>
      
      {/* Scripts de ionicons */}
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
    </section>
  </div>
  );
}

export default LoginPage;