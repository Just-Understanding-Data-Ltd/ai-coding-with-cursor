import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onRemoveFromCart: (id: number) => void;
  onUpdateQuantity: (id: number, newQuantity: number) => void;
}

export function Cart({ items, onRemoveFromCart, onUpdateQuantity }: CartProps) {
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleQuantityChange = (id: number, change: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      onUpdateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" />
        Cart
      </h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty</p>
      ) : (
        <>
          <ScrollArea className="flex-grow">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setItemToDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this item from your
                          cart?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            if (itemToDelete !== null) {
                              onRemoveFromCart(itemToDelete);
                            }
                          }}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold">Total:</p>
              <p className="text-lg font-bold">${total.toFixed(2)}</p>
            </div>
            <Button className="w-full">Checkout</Button>
          </div>
        </>
      )}
    </div>
  );
}
