'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

interface StoreConfig {
  name: string;
  address: string;
  phone: string;
  // Add other store-specific configurations here
}

export default function StoreConfigPage() {
  const { user, storeId, isStoreAdmin, loading } = useAuth();
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<StoreConfig>({ name: '', address: '', phone: '' });

  useEffect(() => {
    const fetchStoreConfig = async () => {
      if (isStoreAdmin && storeId) {
        const storeDocRef = doc(db, 'stores', storeId);
        const storeDoc = await getDoc(storeDocRef);
        if (storeDoc.exists()) {
          const config = storeDoc.data() as StoreConfig;
          setStoreConfig(config);
          setFormData(config);
        }
      }
    };

    if (!loading) {
      fetchStoreConfig();
    }
  }, [isStoreAdmin, storeId, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateStoreConfig = async () => {
    if (isStoreAdmin && storeId) {
      const storeDocRef = doc(db, 'stores', storeId);
      await updateDoc(storeDocRef, formData as Record<string, any>);
      setStoreConfig(formData);
      setEditMode(false);
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
      <h1 className="text-3xl font-bold mb-4">Configurações da Loja</h1>

      {storeConfig ? (
        <div>
          {!editMode ? (
            <div>
              <p><strong>Nome da Loja:</strong> {storeConfig.name}</p>
              <p><strong>Endereço:</strong> {storeConfig.address}</p>
              <p><strong>Telefone:</strong> {storeConfig.phone}</p>
              <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
                Editar Configurações
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome da Loja</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <button onClick={handleUpdateStoreConfig} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                Salvar
              </button>
              <button onClick={() => setEditMode(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancelar
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Carregando configurações da loja...</p>
      )}
    </div>
  );
}
