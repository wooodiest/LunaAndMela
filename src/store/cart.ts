import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../models/Product';
import { useAuthStore } from './auth';

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartState = {
  userCarts: Record<number, Record<number, CartItem>>;
  addItem: (product: Product, quantity?: number, userId?: number) => void;
  removeItem: (productId: number, userId?: number) => void;
  setQuantity: (productId: number, quantity: number, userId?: number) => void;
  clear: (userId?: number) => void;

  getCurrentUserItems: () => Record<number, CartItem>;
  getCurrentUserItemsArray: () => CartItem[];
};

function getCurrentUserId(): number | null {
  const user = useAuthStore.getState().user;
  return user?.id || null;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      userCarts: {},
      
      addItem: (product, quantity = 1, userId) => {
        const currentUserId = userId || getCurrentUserId();
        if (!currentUserId) return;

        set(state => {
          const currentUserCart = state.userCarts[currentUserId] || {};
          const current = currentUserCart[product.id];
          const nextQty = Math.min((current?.quantity ?? 0) + quantity, product.stock);
          
          return {
            userCarts: {
              ...state.userCarts,
              [currentUserId]: {
                ...currentUserCart,
                [product.id]: { product, quantity: nextQty },
              },
            },
          };
        });
      },
      
      removeItem: (productId, userId) => {
        const currentUserId = userId || getCurrentUserId();
        if (!currentUserId) return;

        set(state => {
          const currentUserCart = state.userCarts[currentUserId];
          if (!currentUserCart) return state;
          
          const copy = { ...currentUserCart };
          delete copy[productId];
          
          return {
            userCarts: {
              ...state.userCarts,
              [currentUserId]: copy,
            },
          };
        });
      },
      
      setQuantity: (productId, quantity, userId) => {
        const currentUserId = userId || getCurrentUserId();
        if (!currentUserId) return;

        if (quantity <= 0) {
          get().removeItem(productId, currentUserId);
          return;
        }
        
        set(state => {
          const currentUserCart = state.userCarts[currentUserId];
          if (!currentUserCart) return state;
          
          const current = currentUserCart[productId];
          if (!current) return state;
          
          const limitedQuantity = Math.min(quantity, current.product.stock);
          
          return {
            userCarts: {
              ...state.userCarts,
              [currentUserId]: {
                ...currentUserCart,
                [productId]: { ...current, quantity: limitedQuantity },
              },
            },
          };
        });
      },
      
      clear: (userId) => {
        const currentUserId = userId || getCurrentUserId();
        if (!currentUserId) return;

        set(state => ({
          userCarts: {
            ...state.userCarts,
            [currentUserId]: {},
          },
        }));
      },
      
      getCurrentUserItems: () => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return {};
        
        const state = get();
        return state.userCarts[currentUserId] || {};
      },
      
      getCurrentUserItemsArray: () => {
        const items = get().getCurrentUserItems();
        return Object.values(items);
      },
    }),
    { name: 'cart-store' }
  )
);