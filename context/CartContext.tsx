'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Product } from '@/types';

interface CartState {
	cart: Cart;
	isLoading: boolean;
	error: string | null;
}

type CartAction =
	| { type: 'ADD_TO_CART'; payload: { product: Product; quantity?: number } }
	| { type: 'REMOVE_FROM_CART'; payload: string }
	| { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
	| { type: 'CLEAR_CART' }
	| { type: 'LOAD_CART'; payload: Cart }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string | null };

const initialState: CartState = {
	cart: {
		items: [],
		subtotal: 0,
		tax: 0,
		shipping: 0,
		total: 0,
		currency: 'NOK'
	},
	isLoading: false,
	error: null
};

const calculateCartTotals = (items: CartItem[]): Omit<Cart, 'items'> => {
	const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
	const tax = subtotal * 0.25; // 25% VAT for Norway
	const shipping = items.some(item => !item.product.isDigital) ? 50 : 0; // 50 NOK for physical items
	const total = subtotal + tax + shipping;

	return {
		subtotal,
		tax,
		shipping,
		total,
		currency: 'NOK'
	};
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
	switch (action.type) {
		case 'ADD_TO_CART': {
			const { product, quantity = 1 } = action.payload;
			
			// Check if product is in stock
			if (!product.inStock && !product.isDigital) {
				return {
					...state,
					error: 'Product is out of stock'
				};
			}

			const existingItemIndex = state.cart.items.findIndex(
				item => item.product._id === product._id
			);

			let newItems: CartItem[];
			
			if (existingItemIndex >= 0) {
				// Update existing item quantity
				newItems = [...state.cart.items];
				const existingItem = newItems[existingItemIndex];
				const newQuantity = existingItem.quantity + quantity;
				
				// Check stock limit
				if (!product.isDigital && product.stockQuantity && newQuantity > product.stockQuantity) {
					return {
						...state,
						error: 'Not enough stock available'
					};
				}
				
				newItems[existingItemIndex] = {
					...existingItem,
					quantity: newQuantity
				};
			} else {
				// Add new item
				if (!product.isDigital && product.stockQuantity && quantity > product.stockQuantity) {
					return {
						...state,
						error: 'Not enough stock available'
					};
				}
				
				newItems = [...state.cart.items, { product, quantity }];
			}

			const totals = calculateCartTotals(newItems);
			
			return {
				...state,
				cart: {
					...state.cart,
					items: newItems,
					...totals
				},
				error: null
			};
		}

		case 'REMOVE_FROM_CART': {
			const newItems = state.cart.items.filter(
				item => item.product._id !== action.payload
			);
			const totals = calculateCartTotals(newItems);
			
			return {
				...state,
				cart: {
					...state.cart,
					items: newItems,
					...totals
				}
			};
		}

		case 'UPDATE_QUANTITY': {
			const { productId, quantity } = action.payload;
			
			if (quantity <= 0) {
				return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: productId });
			}

			const newItems = state.cart.items.map(item => {
				if (item.product._id === productId) {
					// Check stock limit
					if (!item.product.isDigital && item.product.stockQuantity && quantity > item.product.stockQuantity) {
						throw new Error('Not enough stock available');
					}
					return { ...item, quantity };
				}
				return item;
			});

			const totals = calculateCartTotals(newItems);
			
			return {
				...state,
				cart: {
					...state.cart,
					items: newItems,
					...totals
				}
			};
		}

		case 'CLEAR_CART':
			return {
				...state,
				cart: {
					...initialState.cart
				}
			};

		case 'LOAD_CART':
			return {
				...state,
				cart: action.payload
			};

		case 'SET_LOADING':
			return {
				...state,
				isLoading: action.payload
			};

		case 'SET_ERROR':
			return {
				...state,
				error: action.payload
			};

		default:
			return state;
	}
};

interface CartContextType extends CartState {
	addToCart: (product: Product, quantity?: number) => void;
	removeFromCart: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
	getItemCount: () => number;
	getItemTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
};

interface CartProviderProps {
	children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(cartReducer, initialState);

	// Load cart from localStorage on mount
	useEffect(() => {
		const savedCart = localStorage.getItem('cart');
		if (savedCart) {
			try {
				const parsedCart = JSON.parse(savedCart);
				dispatch({ type: 'LOAD_CART', payload: parsedCart });
			} catch (error) {
				console.error('Failed to load cart from localStorage:', error);
			}
		}
	}, []);

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		if (state.cart.items.length > 0) {
			localStorage.setItem('cart', JSON.stringify(state.cart));
		} else {
			localStorage.removeItem('cart');
		}
	}, [state.cart]);

	const addToCart = (product: Product, quantity?: number) => {
		try {
			dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
		} catch (error) {
			dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
		}
	};

	const removeFromCart = (productId: string) => {
		dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
	};

	const updateQuantity = (productId: string, quantity: number) => {
		try {
			dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
		} catch (error) {
			dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
		}
	};

	const clearCart = () => {
		dispatch({ type: 'CLEAR_CART' });
	};

	const getItemCount = () => {
		return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
	};

	const getItemTotal = () => {
		return state.cart.items.length;
	};

	const value: CartContextType = {
		...state,
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		getItemCount,
		getItemTotal
	};

	return (
		<CartContext.Provider value={value}>
			{children}
		</CartContext.Provider>
	);
};
