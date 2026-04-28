'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import CartDrawer from './CartDrawer';

const CartButton: React.FC = () => {
	const { getItemCount } = useCart();
	const itemCount = getItemCount();

	return (
		<CartDrawer>
			<button className="btn-glass relative">
				<ShoppingCart size={24} />
				{itemCount > 0 && (
					<Badge 
						variant="destructive" 
						className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
					>
						{itemCount > 99 ? '99+' : itemCount}
					</Badge>
				)}
			</button>
		</CartDrawer>
	);
};

export default CartButton;
