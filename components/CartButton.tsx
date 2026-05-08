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
			<button className="text-gray-100 hover:text-gray-50 py-1 px-2 relative">
				<ShoppingCart size={18} />
				{itemCount > 0 && (
					<Badge 
						variant="destructive" 
						className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
					>
						{itemCount > 99 ? '99+' : itemCount}
					</Badge>
				)}
			</button>
		</CartDrawer>
	);
};

export default CartButton;
