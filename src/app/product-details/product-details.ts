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
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart';
import { DatePipe } from '@angular/common';
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  indiaPrice: number;
  emoji: string;
  imageUrl: string;
  description: string;
}

interface Review {
  id?: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

@Component({
  selector: 'app-product-details',
  imports: [
  RouterLink,
  FormsModule,
  DatePipe
],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {

  product: Product | null = null;

  quantity = 1;

  loading = true;

  errorMessage = '';

  cartMessage = '';

  country = 'Italy';

  currency = '€';

  // =========================
  // REVIEWS
  // =========================

  reviews: Review[] = [];

  reviewName = '';

  reviewRating = 5;

  reviewComment = '';

  reviewMessage = '';

  reviewError = '';

  submittingReview = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.country =
      this.cartService.getCountry();

    this.currency =
      this.cartService.getCurrency();

    const productId =
      this.route.snapshot.paramMap.get('id');

    if (!productId) {

      this.errorMessage =
        'Product ID is missing.';

      this.loading = false;

      return;
    }

    this.loadProduct(Number(productId));
  }

  // =========================
  // LOAD PRODUCT
  // =========================

  loadProduct(id: number): void {

    this.http
      .get<Product>(
        `http://localhost:8080/api/products/${id}`
      )
      .subscribe({

        next: (data) => {

          console.log(
            'PRODUCT DETAILS:',
            data
          );

          this.product = data;

          this.loading = false;

          this.loadReviews(data.id);

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'PRODUCT DETAILS ERROR:',
            error
          );

          this.errorMessage =
            'Could not load this product.';

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }

  // =========================
  // LOAD REVIEWS
  // =========================

  loadReviews(productId: number): void {

    this.http
      .get<Review[]>(
        `http://localhost:8080/api/reviews/product/${productId}`
      )
      .subscribe({

        next: (data) => {

          this.reviews = data;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'REVIEWS ERROR:',
            error
          );

        }

      });
  }

  // =========================
  // QUANTITY
  // =========================

  increaseQuantity(): void {

    this.quantity++;

  }

  decreaseQuantity(): void {

    if (this.quantity > 1) {
      this.quantity--;
    }

  }

  // =========================
  // PRICE
  // =========================

  getProductPrice(): number {

    if (!this.product) {
      return 0;
    }

    if (this.country === 'India') {
      return this.product.indiaPrice;
    }

    return this.product.price;
  }

  // =========================
  // COUNTRY
  // =========================

  selectCountry(country: string): void {

    this.country = country;

    this.cartService.setCountry(country);

    this.currency =
      this.cartService.getCurrency();

  }

  // =========================
  // ADD TO CART
  // =========================

  addToCart(): void {

    if (!this.product) {
      return;
    }

    const selectedPrice =
      this.getProductPrice();

    for (let i = 0; i < this.quantity; i++) {

      this.cartService.addToCart({

        ...this.product,

        price: selectedPrice,

        quantity: 1

      });

    }

    this.cartMessage =
      `${this.quantity} item(s) added to cart.`;

    console.log(
      'Added to cart:',
      this.product
    );

    console.log(
      'Quantity:',
      this.quantity
    );

    console.log(
      'Country:',
      this.country
    );

    console.log(
      'Price:',
      selectedPrice
    );

  }

  // =========================
  // SUBMIT REVIEW
  // =========================

  submitReview(): void {

    if (!this.product) {
      return;
    }

    this.reviewMessage = '';
    this.reviewError = '';

    if (!this.reviewName.trim()) {

      this.reviewError =
        'Please enter your name.';

      return;
    }

    if (!this.reviewComment.trim()) {

      this.reviewError =
        'Please write a review.';

      return;
    }

    if (
      this.reviewRating < 1 ||
      this.reviewRating > 5
    ) {

      this.reviewError =
        'Please select a rating between 1 and 5.';

      return;
    }

    const review: Review = {

      productId: this.product.id,

      customerName:
        this.reviewName.trim(),

      rating:
        this.reviewRating,

      comment:
        this.reviewComment.trim()

    };

    this.submittingReview = true;

    this.http
      .post<Review>(
        'http://localhost:8080/api/reviews',
        review
      )
      .subscribe({

        next: (savedReview) => {

          this.reviews.unshift(savedReview);

          this.reviewName = '';

          this.reviewRating = 5;

          this.reviewComment = '';

          this.reviewMessage =
            'Thank you! Your review has been added.';

          this.submittingReview = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'REVIEW SUBMIT ERROR:',
            error
          );

          this.reviewError =
            'Could not submit your review.';

          this.submittingReview = false;

          this.cdr.detectChanges();
        }

      });

  }

  // =========================
  // AVERAGE RATING
  // =========================

  getAverageRating(): number {

    if (this.reviews.length === 0) {
      return 0;
    }

    const total =
      this.reviews.reduce(
        (sum, review) =>
          sum + review.rating,
        0
      );

    return total / this.reviews.length;
  }

}