import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Css/LoginPage.css";

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
        navigate(`/Menu${response.data.rol.replace(/\s/g, '')}`, { 
          state: { usuario: response.data } 
        });
      } else {
        setError(response.data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ring">
      <i style={{ "--clr": "#00ff0a" }}></i>
      <i style={{ "--clr": "#ff0057" }}></i>
      <i style={{ "--clr": "#fffd44" }}></i>
      <div className="login">
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="inputBx">
            <input
              type="email"
              name="correo"
              placeholder="Correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="inputBx">
            <input
              type="password"
              name="clave"
              placeholder="Contraseña"
              value={formData.clave}
              onChange={handleChange}
              required
            />
          </div>
          <div className="inputBx">
            <button type="submit" disabled={loading}>
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </div>
        </form>
        <div className="links">
          <Link to="/recuperar">¿Olvidó su contraseña?</Link>
          <Link to="/registro">Registrarse</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;