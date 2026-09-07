import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  imageUrl: string;
  description: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItems: CartItem[] = [];

  private cartCountSubject =
    new BehaviorSubject<number>(0);

  cartCount$ =
    this.cartCountSubject.asObservable();


  // =========================
  // COUNTRY
  // =========================

  private countrySubject =
    new BehaviorSubject<string>(
      localStorage.getItem('ramveda_country') || 'Italy'
    );

  country$ =
    this.countrySubject.asObservable();


  constructor() {

    const savedCart =
      localStorage.getItem('ramveda_cart');

    if (savedCart) {

      this.cartItems =
        JSON.parse(savedCart);

    }

    this.cartCountSubject.next(
      this.getCartCount()
    );
  }


  // =========================
  // COUNTRY METHODS
  // =========================

  getCountry(): string {

    return this.countrySubject.value;

  }


  setCountry(country: string): void {

    this.countrySubject.next(country);

    localStorage.setItem(
      'ramveda_country',
      country
    );

  }


  getCurrency(): string {

    return this.getCountry() === 'India'
      ? '₹'
      : '€';

  }


  // =========================
  // CART STORAGE
  // =========================

  private saveCart(): void {

    localStorage.setItem(
      'ramveda_cart',
      JSON.stringify(this.cartItems)
    );

    this.cartCountSubject.next(
      this.getCartCount()
    );

  }


  // =========================
  // GET CART ITEMS
  // =========================

  getItems(): CartItem[] {

    return this.cartItems;

  }


  // =========================
  // ADD TO CART
  // =========================

  addToCart(product: CartItem): void {

    const existingItem =
      this.cartItems.find(
        item => item.id === product.id
      );

    if (existingItem) {

      existingItem.quantity++;

    } else {

      this.cartItems.push({

        ...product,

        quantity: 1

      });

    }

    this.saveCart();

  }


  // =========================
  // REMOVE
  // =========================

  removeFromCart(
    productId: number
  ): void {

    this.cartItems =
      this.cartItems.filter(
        item => item.id !== productId
      );

    this.saveCart();

  }


  // =========================
  // INCREASE
  // =========================

  increaseQuantity(
    productId: number
  ): void {

    const item =
      this.cartItems.find(
        item => item.id === productId
      );

    if (item) {

      item.quantity++;

      this.saveCart();

    }

  }


  // =========================
  // DECREASE
  // =========================

  decreaseQuantity(
    productId: number
  ): void {

    const item =
      this.cartItems.find(
        item => item.id === productId
      );

    if (!item) {
      return;
    }

    if (item.quantity > 1) {

      item.quantity--;

      this.saveCart();

    } else {

      this.removeFromCart(productId);

    }

  }


  // =========================
  // CART COUNT
  // =========================

  getCartCount(): number {

    return this.cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  }


  // =========================
  // SUBTOTAL
  // =========================

  getSubtotal(): number {

    return this.cartItems.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    );

  }


  // =========================
  // CLEAR CART
  // =========================

  clearCart(): void {

    this.cartItems = [];

    this.saveCart();

  }

}