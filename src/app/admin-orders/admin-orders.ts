import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';


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
// ADMIN ORDERS COMPONENT
// ========================================

@Component({

  selector: 'app-admin-orders',

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './admin-orders.html',

  styleUrl: './admin-orders.css'

})
export class AdminOrders implements OnInit {


  // ========================================
  // DATA
  // ========================================

  orders: Order[] = [];

  filteredOrders: Order[] = [];


  // ========================================
  // STATE
  // ========================================

  loading = true;

  errorMessage = '';

  searchText = '';

  selectedStatus = 'ALL';

  updatingOrderId: number | null = null;


  // ========================================
  // CONSTRUCTOR
  // ========================================

  constructor(

    private http: HttpClient,

    private cdr: ChangeDetectorRef

  ) {}


  // ========================================
  // INIT
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

        next: (data) => {

          console.log(
            'ADMIN ORDERS:',
            data
          );


          this.orders = [...data];


          // Latest order first

          this.orders.sort(
            (a, b) => b.id - a.id
          );


          // Load product images

          this.loadProductImages();


          this.applyFilters();


          this.loading = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'ADMIN ORDERS ERROR:',
            error
          );


          this.loading = false;


          this.errorMessage =
            'Could not load orders. Please try again.';


          this.cdr.detectChanges();

        }

      });

  }


  // ========================================
  // LOAD PRODUCT IMAGES
  // ========================================

  loadProductImages(): void {

    this.orders.forEach(order => {

      order.items?.forEach(item => {

        this.http

          .get<any>(
            `http://localhost:8080/api/products/${item.productId}`
          )

          .subscribe({

            next: (product) => {

              item.imageUrl =
                product.imageUrl;

              this.cdr.detectChanges();

            },

            error: (error) => {

              console.error(
                'PRODUCT IMAGE ERROR:',
                error
              );

            }

          });

      });

    });

  }


  // ========================================
  // SEARCH + FILTER
  // ========================================

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredOrders =
      this.orders.filter(order => {


        const matchesSearch =

          !search ||

          order.id
            .toString()
            .includes(search) ||

          order.customerName
            ?.toLowerCase()
            .includes(search) ||

          order.email
            ?.toLowerCase()
            .includes(search);


        const matchesStatus =

          this.selectedStatus === 'ALL' ||

          order.status
            ?.toUpperCase() ===
          this.selectedStatus;


        return (
          matchesSearch &&
          matchesStatus
        );

      });

  }


  // ========================================
  // SEARCH
  // ========================================

  onSearch(): void {

    this.applyFilters();

  }


  // ========================================
  // STATUS FILTER
  // ========================================

  onStatusFilter(): void {

    this.applyFilters();

  }


  // ========================================
  // GET COUNT
  // ========================================

  getCount(
    status: string
  ): number {

    return this.orders.filter(

      order =>
        order.status
          ?.toUpperCase() ===
        status.toUpperCase()

    ).length;

  }


  // ========================================
  // UPDATE STATUS
  // ========================================

  updateStatus(

    order: Order,

    status: string

  ): void {


    if (
      !status ||
      status === order.status
    ) {

      return;

    }


    this.updatingOrderId =
      order.id;


    const url =
      `http://localhost:8080/api/orders/${order.id}/status?status=${encodeURIComponent(status)}`;


    this.http

      .put<Order>(
        url,
        null
      )

      .subscribe({

        next: (updatedOrder) => {

          console.log(
            'ORDER STATUS UPDATED:',
            updatedOrder
          );


          order.status =
            updatedOrder.status;


          this.updatingOrderId =
            null;


          this.applyFilters();


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'STATUS UPDATE ERROR:',
            error
          );


          this.updatingOrderId =
            null;


          alert(
            'Could not update order status.'
          );


          this.cdr.detectChanges();

        }

      });

  }


  // ========================================
  // CURRENCY
  // ========================================

  getCurrency(
    order: Order
  ): string {


    if (order.currency) {

      return order.currency;

    }


    if (
      order.country === 'India'
    ) {

      return '₹';

    }


    if (
      order.country === 'Italy'
    ) {

      return '€';

    }


    return '';

  }


  // ========================================
  // COUNTRY FLAG
  // ========================================

  getCountryFlag(
    order: Order
  ): string {


    if (
      order.country === 'India'
    ) {

      return '🇮🇳';

    }


    if (
      order.country === 'Italy'
    ) {

      return '🇮🇹';

    }


    return '🌍';

  }


  // ========================================
  // STATUS CLASS
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
  // FORMAT DATE
  // ========================================

  formatDate(
    date: string
  ): string {


    if (!date) {

      return '';

    }


    return new Date(date)

      .toLocaleDateString(

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


    return new Date(date)

      .toLocaleTimeString(

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


    if (!order.items) {

      return 0;

    }


    return order.items.reduce(

      (total, item) =>

        total + item.quantity,

      0

    );

  }


  // ========================================
  // TOTAL ORDERS
  // ========================================

  getTotalOrders(): number {

    return this.orders.length;

  }


  // ========================================
  // PLACED
  // ========================================

  getPlacedOrders(): number {

    return this.getCount(
      'PLACED'
    );

  }


  // ========================================
  // CONFIRMED
  // ========================================

  getConfirmedOrders(): number {

    return this.getCount(
      'CONFIRMED'
    );

  }


  // ========================================
  // SHIPPED
  // ========================================

  getShippedOrders(): number {

    return this.getCount(
      'SHIPPED'
    );

  }


  // ========================================
  // DELIVERED
  // ========================================

  getDeliveredOrders(): number {

    return this.getCount(
      'DELIVERED'
    );

  }


  // ========================================
  // CANCELLED
  // ========================================

  getCancelledOrders(): number {

    return this.getCount(
      'CANCELLED'
    );

  }


  // ========================================
  // ITALY SALES
  // ========================================

  getItalySales(): number {

    return this.orders

      .filter(order =>
        order.country === 'Italy'
      )

      .reduce(
        (total, order) =>
          total + order.total,
        0
      );

  }


  // ========================================
  // INDIA SALES
  // ========================================

  getIndiaSales(): number {

    return this.orders

      .filter(order =>
        order.country === 'India'
      )

      .reduce(
        (total, order) =>
          total + order.total,
        0
      );

  }


  // ========================================
  // REFRESH
  // ========================================

  refreshOrders(): void {

    this.loadOrders();

  }

}