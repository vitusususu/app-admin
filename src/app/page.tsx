'use client';

import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const { user, storeId, isStoreAdmin, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isStoreAdmin) {
    return <div>Acesso negado. Você não é um administrador de loja.</div>;
  }

  return (
    <div>
      <h1>Dashboard da Loja</h1>
      <p>Bem-vindo, {user?.email}!</p>
      <p>ID da sua loja: {storeId}</p>
      {/* Aqui você pode adicionar mais componentes e dados do dashboard */}
    </div>
  );
}
