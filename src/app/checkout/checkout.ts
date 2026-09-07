import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { HttpClient } from '@angular/common/http';

import {
  CartService,
  CartItem
} from '../services/cart';


interface OrderItem {

  productId: number;

  productName: string;

  price: number;

  quantity: number;

  total: number;

}


interface Order {

  id?: number;

  customerName: string;

  email: string;

  phone: string;

  address: string;

  subtotal: number;

  shipping: number;

  total: number;

  status?: string;

  country: string;

  currency: string;

  items: OrderItem[];

}


@Component({

  selector: 'app-checkout',

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './checkout.html',

  styleUrl: './checkout.css'

})


export class Checkout implements OnInit {


  // =========================
  // CART
  // =========================

  cartItems: CartItem[] = [];

  subtotal = 0;

  shipping = 0;

  total = 0;


  // =========================
  // COUNTRY / CURRENCY
  // =========================

  country = 'Italy';

  currency = '€';


  // =========================
  // CUSTOMER DETAILS
  // =========================

  customerName = '';

  email = '';

  phone = '';

  address = '';


  // =========================
  // STATE
  // =========================

  loading = false;

  errorMessage = '';


  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(

    private cartService: CartService,

    private http: HttpClient,

    private router: Router,

    private cdr: ChangeDetectorRef

  ) {}


  // =========================
  // INITIALIZE
  // =========================

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


    // Get selected country

    this.country =
      this.cartService.getCountry();


    // Get correct currency

    this.currency =
      this.cartService.getCurrency();


    // Calculate prices

    this.calculateTotals();


    this.cdr.detectChanges();

  }


  // =========================
  // CALCULATE TOTALS
  // =========================

  calculateTotals(): void {

    this.subtotal =
      this.cartItems.reduce(

        (total, item) =>

          total +
          item.price *
          item.quantity,

        0

      );


    this.shipping =

      this.cartItems.length > 0

        ? 5

        : 0;


    this.total =

      this.subtotal +
      this.shipping;

  }


  // =========================
  // PLACE ORDER
  // =========================

  placeOrder(): void {

    this.errorMessage = '';


    // =========================
    // VALIDATE NAME
    // =========================

    if (!this.customerName.trim()) {

      this.errorMessage =
        'Please enter your full name.';

      return;

    }


    // =========================
    // VALIDATE EMAIL
    // =========================

    if (!this.email.trim()) {

      this.errorMessage =
        'Please enter your email.';

      return;

    }


    // =========================
    // VALIDATE PHONE
    // =========================

    if (!this.phone.trim()) {

      this.errorMessage =
        'Please enter your phone number.';

      return;

    }


    // =========================
    // VALIDATE ADDRESS
    // =========================

    if (!this.address.trim()) {

      this.errorMessage =
        'Please enter your delivery address.';

      return;

    }


    // =========================
    // VALIDATE CART
    // =========================

    if (this.cartItems.length === 0) {

      this.errorMessage =
        'Your cart is empty.';

      return;

    }


    // =========================
    // CREATE ORDER ITEMS
    // =========================

    const orderItems: OrderItem[] =

      this.cartItems.map(item => ({

        productId:
          item.id,

        productName:
          item.name,

        price:
          item.price,

        quantity:
          item.quantity,

        total:
          item.price *
          item.quantity

      }));


    // =========================
    // CREATE ORDER
    // =========================

    const order: Order = {

      customerName:
        this.customerName.trim(),

      email:
        this.email.trim(),

      phone:
        this.phone.trim(),

      address:
        this.address.trim(),

      subtotal:
        this.subtotal,

      shipping:
        this.shipping,

      total:
        this.total,

      status:
        'PLACED',

      // IMPORTANT:
      // Save country with order

      country:
        this.country,

      // IMPORTANT:
      // Save currency with order

      currency:
        this.currency,

      items:
        orderItems

    };


    // =========================
    // DEBUG LOGS
    // =========================

    console.log(
      'COUNTRY:',
      this.country
    );

    console.log(
      'CURRENCY:',
      this.currency
    );

    console.log(
      'SUBTOTAL:',
      this.subtotal
    );

    console.log(
      'SHIPPING:',
      this.shipping
    );

    console.log(
      'TOTAL:',
      this.total
    );

    console.log(
      'ORDER TO CREATE:',
      order
    );


    // =========================
    // START LOADING
    // =========================

    this.loading = true;


    // =========================
    // SEND TO BACKEND
    // =========================

    this.http

      .post<Order>(

        'http://localhost:8080/api/orders',

        order

      )

      .subscribe({

        // =========================
        // SUCCESS
        // =========================

        next: (response) => {

          console.log(
            'ORDER CREATED:',
            response
          );


          this.loading = false;


          // Clear cart only
          // after successful order

          this.cartService.clearCart();


          // Navigate to confirmation

          this.router.navigate(

            ['/order-confirmation'],

            {

              queryParams: {

                orderId:
                  response.id

              }

            }

          );

        },


        // =========================
        // ERROR
        // =========================

        error: (error) => {

          console.error(
            'ORDER CREATION FAILED:',
            error
          );


          this.loading = false;


          this.errorMessage =
            'Could not place your order. Please try again.';


          this.cdr.detectChanges();

        }

      });

  }


  // =========================
  // BACK TO PRODUCTS
  // =========================

  continueShopping(): void {

    this.router.navigate([
      '/products'
    ]);

  }

}