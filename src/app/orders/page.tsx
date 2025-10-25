'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id?: string;
  storeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any; // Firebase Timestamp
}

export default function OrdersPage() {
  const { user, storeId, isStoreAdmin, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (isStoreAdmin && storeId) {
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, where('storeId', '==', storeId));
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(ordersList);
      }
    };

    if (!loading) {
      fetchOrders();
    }
  }, [isStoreAdmin, storeId, loading]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (isStoreAdmin && storeId) {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      // Refetch orders
      const ordersCollection = collection(db, 'orders');
      const q = query(ordersCollection, where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersList);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isStoreAdmin) {
    return <div>Acesso negado. Você não é um administrador de loja.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Gerenciamento de Pedidos</h1>

      <h2 className="text-2xl font-semibold mb-4">Pedidos da Loja</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="border p-4 mb-4 rounded shadow">
            <h3 className="text-xl font-bold">Pedido #{order.id}</h3>
            <p>Cliente: {order.userName} ({order.userEmail})</p>
            <p>Total: R${order.total.toFixed(2)}</p>
            <p>Status: {order.status}</p>
            <p>Data: {new Date(order.createdAt.toDate()).toLocaleString()}</p>
            <h4 className="font-semibold mt-2">Itens:</h4>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} (x{item.quantity}) - R${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <label htmlFor={`status-${order.id}`} className="mr-2">Atualizar Status:</label>
              <select
                id={`status-${order.id}`}
                value={order.status}
                onChange={(e) =>
                  handleUpdateOrderStatus(order.id!, e.target.value as Order['status'])
                }
                className="border p-2 rounded"
              >
                <option value="pending">Pendente</option>
                <option value="processing">Em Processamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
