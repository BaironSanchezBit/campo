import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: any[] = [];

  constructor() {
    this.loadCartFromLocalStorage();
  }

  // Agregar producto al carrito
  addToCart(producto: any) {
    // Aquí verificamos tanto el _id como otras características clave para evitar confusiones con productos diferentes
    const itemInCart = this.items.find(item => item._id === producto._id && item.usuarioId._id === producto.usuarioId._id);

    if (itemInCart) {
      // Si el producto ya está en el carrito, incrementa la cantidad
      itemInCart.cantidad += 1;
    } else {
      // Si el producto no está en el carrito, agrégalo con cantidad 1
      this.items.push({ ...producto, cantidad: 1 });
    }
    this.saveCartToLocalStorage();
  }

  getItems() {
    return this.items;
  }

  removeFromCart(index: number) {
    this.items.splice(index, 1);
    this.saveCartToLocalStorage();
  }

  updateCart(items: any[]) {
    this.items = items;
    this.saveCartToLocalStorage();
  }

  saveCartToLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.items));
  }

  loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('carrito');
    if (storedCart) {
      this.items = JSON.parse(storedCart);
    }
  }
}