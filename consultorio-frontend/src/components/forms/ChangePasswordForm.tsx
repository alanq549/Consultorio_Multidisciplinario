const ChangePasswordForm = () => {
  return (
    <form className="space-y-4">
      <h4 className="text-md font-semibold">Cambiar contraseña</h4>
      <input type="password" placeholder="Contraseña actual" className="input" />
      <input type="password" placeholder="Nueva contraseña" className="input" />
      <input
        type="password"
        placeholder="Confirmar nueva contraseña"
        className="input"
      />
      <button className="btn btn-primary">Guardar</button>
    </form>
  );
};

export default ChangePasswordForm;
