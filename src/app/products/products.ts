import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CartService } from '../services/cart';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;        // Italy price (€)
  indiaPrice: number;   // India price (₹)
  emoji: string;
  imageUrl: string;
  description: string;
}

@Component({
  selector: 'app-products',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {

  products: Product[] = [];

  categories: string[] = [
    'All',
    'Personalized',
    'Birthday',
    'Couples',
    'Graduation',
    'Special'
  ];

  selectedCategory = 'All';

  searchText = '';

  cartCount = 0;

  // =========================
  // COUNTRY / CURRENCY
  // =========================

  country = 'Italy';

  currency = '€';


  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {}


  // =========================
  // INITIALIZATION
  // =========================

 ngOnInit(): void {

  this.loadProducts();

  this.cartCount =
    this.cartService.getCartCount();

  this.country =
    this.cartService.getCountry();

  this.currency =
    this.cartService.getCurrency();

}


  // =========================
  // LOAD PRODUCTS
  // =========================

  loadProducts(): void {

    this.http
      .get<Product[]>(
        'http://localhost:8080/api/products'
      )
      .subscribe({

        next: (data) => {

          console.log(
            'PRODUCTS FROM API:',
            data
          );

          this.products = data;

        },

        error: (error) => {

          console.error(
            'Error loading products:',
            error
          );

        }

      });

  }


  // =========================
  // FILTER PRODUCTS
  // =========================

  get filteredProducts(): Product[] {

    let result = this.products;


    // CATEGORY FILTER

    if (this.selectedCategory !== 'All') {

      result = result.filter(
        product =>
          product.category ===
          this.selectedCategory
      );

    }


    // SEARCH FILTER

    if (this.searchText) {

      const search =
        this.searchText
          .toLowerCase()
          .trim();

      result = result.filter(product =>

        product.name
          .toLowerCase()
          .includes(search)

        ||

        product.category
          .toLowerCase()
          .includes(search)

        ||

        product.description
          .toLowerCase()
          .includes(search)

      );

    }


    return result;

  }


  // =========================
  // SELECT CATEGORY
  // =========================

  selectCategory(
    category: string
  ): void {

    this.selectedCategory =
      category;

  }


  // =========================
  // SELECT COUNTRY
  // =========================

  
 selectCountry(country: string): void {

  this.country = country;

  this.cartService.setCountry(country);

  this.currency =
    this.cartService.getCurrency();

}


  // =========================
  // GET PRODUCT PRICE
  // =========================

  getProductPrice(
    product: Product
  ): number {

    if (this.country === 'India') {

      return product.indiaPrice;

    }

    return product.price;

  }


  // =========================
  // ADD TO CART
  // =========================

  addToCart(
    product: Product
  ): void {

    const cartPrice =
      this.getProductPrice(product);


    this.cartService.addToCart({

      ...product,

      price: cartPrice,

      quantity: 1

    });


    this.cartCount =
      this.cartService.getCartCount();


    console.log(
      'Added to cart:',
      product
    );

    console.log(
      'Country:',
      this.country
    );

    console.log(
      'Price:',
      cartPrice
    );

  }

}