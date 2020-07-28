import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const response = await AsyncStorage.getItem('@GoMarketplace:products');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function setProductsStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }
    setProductsStorage();
  }, [products]);
  // Omit<Appointment, 'id'>
  const addToCart = useCallback(
    (product: Omit<Product, 'quantity'>) => {
      // TODO ADD A NEW ITEM TO THE CART
      const { id } = product;

      const productExist = products.find(productFind => productFind.id === id);

      if (productExist) {
        const newProducts = products.map(productMap =>
          productMap.id === id
            ? { ...productMap, quantity: productMap.quantity + 1 }
            : productMap,
        );
        setProducts(newProducts);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [products],
  );

  const increment = useCallback(
    id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );
      setProducts(newProducts);
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );

      setProducts(newProducts.filter(product => product.quantity > 0));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
