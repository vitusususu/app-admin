'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  storeId: string;
}

export default function ProductsPage() {
  const { user, storeId, isStoreAdmin, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'storeId'>>({
    name: '',
    description: '',
    price: 0,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (isStoreAdmin && storeId) {
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection, where('storeId', '==', storeId));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsList);
      }
    };

    if (!loading) {
      fetchProducts();
    }
  }, [isStoreAdmin, storeId, loading]);

  const handleAddProduct = async () => {
    if (isStoreAdmin && storeId) {
      await addDoc(collection(db, 'products'), { ...newProduct, storeId });
      setNewProduct({ name: '', description: '', price: 0 });
      // Refetch products
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection, where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async () => {
    if (editingProduct && isStoreAdmin && storeId) {
      const productRef = doc(db, 'products', editingProduct.id!);
      await updateDoc(productRef, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
      });
      setEditingProduct(null);
      // Refetch products
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection, where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (isStoreAdmin && storeId) {
      await deleteDoc(doc(db, 'products', id));
      // Refetch products
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection, where('storeId', '==', storeId));
      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);
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
      <h1 className="text-3xl font-bold mb-4">Gerenciamento de Produtos</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Adicionar Novo Produto</h2>
        <input
          type="text"
          placeholder="Nome do Produto"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Descrição"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Preço"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
          }
          className="border p-2 mr-2"
        />
        <button onClick={handleAddProduct} className="bg-blue-500 text-white px-4 py-2 rounded">
          Adicionar Produto
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Produtos da Loja</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id} className="border p-4 mb-4 rounded shadow">
            {editingProduct?.id === product.id ? (
              <div>
                <input
                  type="text"
                  value={editingProduct?.name || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct!, name: e.target.value })
                  }
                  className="border p-2 mr-2"
                />
                <input
                  type="text"
                  value={editingProduct?.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct!, description: e.target.value })
                  }
                  className="border p-2 mr-2"
                />
                <input
                  type="number"
                  value={editingProduct?.price || 0}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct!, price: parseFloat(e.target.value) })
                  }
                  className="border p-2 mr-2"
                />
                <button onClick={handleUpdateProduct} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                  Salvar
                </button>
                <button onClick={() => setEditingProduct(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p>{product.description}</p>
                <p>Preço: R${product.price.toFixed(2)}</p>
                <button onClick={() => handleEditProduct(product)} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
                  Editar
                </button>
                <button onClick={() => handleDeleteProduct(product.id!)} className="bg-red-500 text-white px-4 py-2 rounded">
                  Excluir
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
