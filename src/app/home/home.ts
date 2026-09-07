import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  cartCount = 0;

  constructor(
    private cartService: CartService
  ) {}

  ngOnInit(): void {

    this.cartService.cartCount$.subscribe(
      count => {
        this.cartCount = count;
      }
    );

  }
}