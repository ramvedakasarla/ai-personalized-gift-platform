import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';


// ========================================
// PRODUCT
// ========================================

interface Product {

  id: number;

  name: string;

  imageUrl: string;

  emoji: string;

}


// ========================================
// ORDER ITEM
// ========================================

interface OrderItem {

  productId: number;

  productName: string;

  price: number;

  quantity: number;

  total: number;

  imageUrl?: string;

  emoji?: string;

}


// ========================================
// ORDER
// ========================================

interface Order {

  id: number;

  customerName: string;

  email: string;

  phone: string;

  address: string;

  subtotal: number;

  shipping: number;

  total: number;

  status: string;

  createdAt: string;

  country?: string;

  currency?: string;

  items: OrderItem[];

}


// ========================================
// COMPONENT
// ========================================

@Component({

  selector: 'app-orders',

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './orders.html',

  styleUrl: './orders.css'

})


export class Orders implements OnInit {


  // ========================================
  // ORDERS
  // ========================================

  orders: Order[] = [];


  // ========================================
  // STATE
  // ========================================

  loading = true;

  errorMessage = '';


  // ========================================
  // EXPANDED ORDER
  // ========================================

  expandedOrderId: number | null = null;


  // ========================================
  // CONSTRUCTOR
  // ========================================

  constructor(

    private http: HttpClient,

    private cdr: ChangeDetectorRef

  ) {}


  // ========================================
  // INITIALIZE
  // ========================================

  ngOnInit(): void {

    this.loadOrders();

  }


  // ========================================
  // LOAD ORDERS
  // ========================================

  loadOrders(): void {

    this.loading = true;

    this.errorMessage = '';


    this.http

      .get<Order[]>(

        'http://localhost:8080/api/orders'

      )

      .subscribe({

        // ==================================
        // SUCCESS
        // ==================================

        next: (data) => {

          console.log(
            'MY ORDERS FROM API:',
            data
          );


          this.orders = [
            ...data
          ];


          // Expand latest order automatically

          if (this.orders.length > 0) {

            this.expandedOrderId =
              this.orders[
                this.orders.length - 1
              ].id;

          }


          // Load product images

          this.loadProductImages();

        },


        // ==================================
        // ERROR
        // ==================================

        error: (error) => {

          console.error(
            'MY ORDERS ERROR:',
            error
          );


          this.loading = false;


          this.errorMessage =
            'Could not load your orders. Please try again.';


          this.cdr.detectChanges();

        }

      });

  }


  // ========================================
  // LOAD PRODUCT IMAGES
  // ========================================

  loadProductImages(): void {

    const productIds =
      new Set<number>();


    this.orders.forEach(order => {

      if (!order.items) {
        return;
      }


      order.items.forEach(item => {

        productIds.add(
          item.productId
        );

      });

    });


    // No products

    if (productIds.size === 0) {

      this.loading = false;

      this.cdr.detectChanges();

      return;

    }


    let completed = 0;


    productIds.forEach(productId => {

      this.http

        .get<Product>(

          `http://localhost:8080/api/products/${productId}`

        )

        .subscribe({

          // ================================
          // PRODUCT SUCCESS
          // ================================

          next: (product) => {

            this.orders.forEach(order => {

              if (!order.items) {
                return;
              }


              order.items.forEach(item => {

                if (
                  item.productId ===
                  product.id
                ) {

                  item.imageUrl =
                    product.imageUrl;

                  item.emoji =
                    product.emoji;

                }

              });

            });

          },


          // ================================
          // PRODUCT ERROR
          // ================================

          error: (error) => {

            console.error(

              `Could not load product ${productId}`,

              error

            );

          },


          // ================================
          // COMPLETE
          // ================================

          complete: () => {

            completed++;


            if (
              completed ===
              productIds.size
            ) {

              this.loading = false;

              this.cdr.detectChanges();

            }

          }

        });

    });

  }


  // ========================================
  // TOGGLE ORDER
  // ========================================

  toggleOrder(
    orderId: number
  ): void {

    if (
      this.expandedOrderId ===
      orderId
    ) {

      this.expandedOrderId = null;

    } else {

      this.expandedOrderId =
        orderId;

    }

  }


  // ========================================
  // CHECK IF ORDER IS EXPANDED
  // ========================================

  isOrderExpanded(
    orderId: number
  ): boolean {

    return (
      this.expandedOrderId ===
      orderId
    );

  }


  // ========================================
  // GET CURRENCY
  // ========================================

  getCurrency(
    order: Order
  ): string {

    // New orders

    if (order.currency) {

      return order.currency;

    }


    // Fallback for India

    if (
      order.country ===
      'India'
    ) {

      return '₹';

    }


    // Default

    return '€';

  }


  // ========================================
  // GET COUNTRY FLAG
  // ========================================

  getCountryFlag(
    order: Order
  ): string {

    if (
      order.country ===
      'India'
    ) {

      return '🇮🇳';

    }


    return '🇮🇹';

  }


  // ========================================
  // GET STATUS CLASS
  // ========================================

  getStatusClass(
    status: string
  ): string {

    switch (
      status?.toUpperCase()
    ) {

      case 'PLACED':

        return 'status-placed';


      case 'CONFIRMED':

        return 'status-confirmed';


      case 'SHIPPED':

        return 'status-shipped';


      case 'DELIVERED':

        return 'status-delivered';


      case 'CANCELLED':

        return 'status-cancelled';


      default:

        return 'status-default';

    }

  }


  // ========================================
  // STATUS ORDER
  // ========================================

  getStatusStep(
    status: string
  ): number {

    switch (
      status?.toUpperCase()
    ) {

      case 'PLACED':

        return 1;


      case 'CONFIRMED':

        return 2;


      case 'SHIPPED':

        return 3;


      case 'DELIVERED':

        return 4;


      default:

        return 0;

    }

  }


  // ========================================
  // CHECK STATUS STEP
  // ========================================

  isStepCompleted(
    order: Order,
    step: number
  ): boolean {

    return (
      this.getStatusStep(
        order.status
      ) >= step
    );

  }


  // ========================================
  // FORMAT DATE
  // ========================================

  formatDate(
    date: string
  ): string {

    if (!date) {

      return '';

    }


    return new Date(
      date
    ).toLocaleDateString(

      'en-GB',

      {

        day: '2-digit',

        month: 'short',

        year: 'numeric'

      }

    );

  }


  // ========================================
  // FORMAT TIME
  // ========================================

  formatTime(
    date: string
  ): string {

    if (!date) {

      return '';

    }


    return new Date(
      date
    ).toLocaleTimeString(

      'en-GB',

      {

        hour: '2-digit',

        minute: '2-digit'

      }

    );

  }


  // ========================================
  // ITEM COUNT
  // ========================================

  getItemCount(
    order: Order
  ): number {

    if (
      !order.items
    ) {

      return 0;

    }


    return order.items.reduce(

      (total, item) =>

        total +
        item.quantity,

      0

    );

  }


  // ========================================
  // PRODUCT COUNT
  // ========================================

  getProductCount(
    order: Order
  ): number {

    if (
      !order.items
    ) {

      return 0;

    }


    return order.items.length;

  }


  // ========================================
  // TOTAL FORMATTING
  // ========================================

  formatPrice(
    order: Order,
    amount: number
  ): string {

    return (
      this.getCurrency(order) +
      amount.toFixed(2)
    );

  }


}