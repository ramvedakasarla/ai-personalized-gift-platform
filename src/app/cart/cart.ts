import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  CartService,
  CartItem
} from '../services/cart';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {

  cartItems: CartItem[] = [];

  subtotal = 0;

  shipping = 0;

  total = 0;

  country = 'Italy';

  currency = '€';


  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadCart();

  }


  // =========================
  // LOAD CART
  // =========================

  loadCart(): void {

    this.cartItems = [
      ...this.cartService.getItems()
    ];

    this.country =
      this.cartService.getCountry();

    this.currency =
      this.cartService.getCurrency();

    this.calculateTotals();

    this.cdr.detectChanges();

  }


  // =========================
  // CALCULATE TOTALS
  // =========================

  calculateTotals(): void {

    this.subtotal =
      this.cartService.getSubtotal();

    this.shipping =
      this.cartItems.length > 0
        ? 5
        : 0;

    this.total =
      this.subtotal +
      this.shipping;

  }


  // =========================
  // INCREASE
  // =========================

  increaseQuantity(
    item: CartItem
  ): void {

    this.cartService.increaseQuantity(
      item.id
    );

    this.loadCart();

  }


  // =========================
  // DECREASE
  // =========================

  decreaseQuantity(
    item: CartItem
  ): void {

    this.cartService.decreaseQuantity(
      item.id
    );

    this.loadCart();

  }


  // =========================
  // REMOVE
  // =========================

  removeItem(
    productId: number
  ): void {

    this.cartService.removeFromCart(
      productId
    );

    this.loadCart();

  }


  // =========================
  // CONTINUE SHOPPING
  // =========================

  continueShopping(): void {

    // Navigation is handled
    // by routerLink in HTML.

  }

}