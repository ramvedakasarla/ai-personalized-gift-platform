import { Routes } from '@angular/router';
import { Checkout } from './checkout/checkout';
import { OrderConfirmation } from './order-confirmation/order-confirmation';
import { Orders } from './orders/orders';
import { AdminOrders } from './admin-orders/admin-orders';
import { ProductDetails } from './product-details/product-details';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home').then(m => m.Home)
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products').then(m => m.Products)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./cart/cart').then(m => m.Cart)
  },
  {
  path: 'checkout',
  component: Checkout
},
{
  path: 'order-confirmation',
  component: OrderConfirmation
},
{
  path: 'orders',
  component: Orders
},
{
  path: 'admin/orders',
  component: AdminOrders
},
{
  path: 'product/:id',
  component: ProductDetails
},
  {
    path: '**',
    redirectTo: ''
  }
];