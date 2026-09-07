import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { HttpClient } from '@angular/common/http';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

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
  country: string;
  currency: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css'
})
export class OrderConfirmation implements OnInit {

  order: Order | null = null;

  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    console.log('ORDER CONFIRMATION INIT');

    this.route.queryParamMap.subscribe(params => {

      const orderId = params.get('orderId');

      console.log('ORDER ID:', orderId);

      if (!orderId) {

        this.errorMessage =
          'Order ID is missing.';

        this.cdr.detectChanges();

        return;
      }

      const url =
        `http://localhost:8080/api/orders/${orderId}`;

      console.log('GET:', url);

      this.http.get<Order>(url).subscribe({

        next: (data) => {

          console.log(
            'ORDER RECEIVED:',
            data
          );

          this.order = data;

          console.log(
            'ORDER ASSIGNED:',
            this.order
          );

          this.cdr.detectChanges();

          console.log(
            'CHANGE DETECTION COMPLETE'
          );

        },

        error: (error) => {

          console.error(
            'ORDER ERROR:',
            error
          );

          this.errorMessage =
            `Could not load order. HTTP ${error.status}`;

          this.cdr.detectChanges();

        }

      });

    });

  }

  getCurrency(): string {

    if (!this.order) {
      return '€';
    }

    if (this.order.currency) {
      return this.order.currency;
    }

    if (this.order.country === 'India') {
      return '₹';
    }

    return '€';
  }

  getCountryFlag(): string {

    if (!this.order) {
      return '🌍';
    }

    if (this.order.country === 'India') {
      return '🇮🇳';
    }

    if (this.order.country === 'Italy') {
      return '🇮🇹';
    }

    return '🌍';
  }

}