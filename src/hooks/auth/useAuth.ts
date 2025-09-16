export const useAuth = () => {
  const loginUser = async (usuario: string) => {
    if (usuario.length === 0) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/${usuario}`,
    );
    const data = await response.json();

    if (!data || !response.ok) return null;

    return data;
  };

  const getPermissions = async (idUsuario: number) => {
    if (idUsuario === 0) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/permisos/${idUsuario}`,
    );
    const data = await response.json();

    if (!data || !response.ok) return [];

    return data;
  };

  return { loginUser, getPermissions };
};
