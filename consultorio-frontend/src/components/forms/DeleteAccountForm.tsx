const DeleteAccountForm = () => {
  return (
    <form className="space-y-4">
      <h4 className="text-md font-semibold text-red-600">Eliminar cuenta</h4>
      <p className="text-sm text-gray-600">
        Al eliminar tu cuenta, se borrarán todos tus datos de forma permanente.
        Esta acción no se puede deshacer.
      </p>
      <input type="password" placeholder="Contraseña actual" className="input" />
      <button className="btn bg-red-600 hover:bg-red-700 text-white">
        Eliminar cuenta
      </button>
    </form>
  );
};

export default DeleteAccountForm;
