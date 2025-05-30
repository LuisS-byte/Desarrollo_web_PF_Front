class Usuario {
  constructor(data) {
    this.isSuccess = data.isSuccess;
    this.rol = data.rol;
    this.usuarioNombre = data.usuarioNombre;
    this.correo = data.correo;
  }
}

export default Usuario;