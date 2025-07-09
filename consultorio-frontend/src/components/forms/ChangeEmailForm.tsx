const ChangeEmailForm = () => {
  return (
    <form className="space-y-4">
      <h4 className="text-md font-semibold">Cambiar correo electrónico</h4>
      <input type="email" placeholder="Correo nuevo" className="input" />
      <input type="password" placeholder="Contraseña actual" className="input" />
      <button className="btn btn-primary">Guardar</button>
    </form>
  );
};

export default ChangeEmailForm;
