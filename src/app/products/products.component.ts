import { Component } from '@angular/core';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  products: any = [
    { name: 'Sweater', id: 'price_1MlbO8LxattdPQR8QNDMZUnw', price: 50, isAlt: false },
    { name: 'Beanie', id: 'price_1Mm0uDLxattdPQR8vJbYmCjP', price: 20, isAlt: false },
    { name: 'Bunny', id: 'price_1Mm0vWLxattdPQR8icOybZi7', price: 18, isAlt: false },
    { name: 'Turtle', id: 'price_fake_id_here', price: 10, isAlt: false }
  ];

  checkout: boolean = false;
  Cart: any = null;
  total: number = 0;

  addToCart(name: string, id: string, price: number, quantity: any): void {
    quantity = Number(quantity);
    if (quantity > 99) quantity = 99;
    if (quantity < 1) quantity = 1;
    let cart: any = localStorage.getItem('cart');
    if (cart) {
      cart = JSON.parse(cart as string);
      let itemExists: boolean = false;
      cart.forEach((item: any) => {
        if (item.id === id) {
          item.quantity += quantity;
          item.cost += quantity * price;
          localStorage.setItem('cart', JSON.stringify(cart));
          itemExists = true;
        }
      });
      if (!itemExists) {
        cart.push({
          name: name,
          id: id,
          price: price,
          quantity: quantity,
          cost: price * quantity
        });
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    } else {
      cart = [
        {
          name: name,
          id: id,
          price: price,
          quantity: quantity,
          cost: price * quantity
        }
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    this.notify(
      'Added to Cart!',
      name + ' (' + quantity + ') --- ' + price * quantity + ' €',
      '../../assets/tick.png',
      2000
    );
  }

  removeItem(name: string, id: string, price: number, cost: number): void {
    if (this.Cart) {
      this.Cart.forEach((item: any, index: number) => {
        if (item.id === id) {
          item.quantity--;
          item.cost -= price;
          this.total -= price;
          if (item.quantity < 1) {
            this.Cart.splice(index, 1);
          }
          localStorage.setItem('cart', JSON.stringify(this.Cart));
          this.notify(
            'Item Removed!',
            `${name} --- ${price} €`,
            '../../assets/trash-bin.png',
            2000
          );
        }
      });
    }
  }

  goToCheckout() {
    this.checkout = true;
    let cart: any = localStorage.getItem('cart');
    if (cart) {
      cart = JSON.parse(cart as string);
      this.Cart = cart;
      cart.forEach((item: any) => {
        this.total += item.cost;
      });
    }
  }

  completeCheckout() {
    let cart: any = localStorage.getItem('cart');
    if (cart) {

      let xhttp = new XMLHttpRequest();
      xhttp.open('POST', 'https://localhost/checkout');
      xhttp.setRequestHeader('Content-type', 'application/json');
      xhttp.send(cart);
      xhttp.onload = function() {
	location.href = this.responseText;
      };
    }
  }

  clearCart() {
    localStorage.clear();
    this.Cart = null;
    this.checkout = false;
    this.total = 0;
    this.notify(
      'Cart Cleared!',
      'We hope you find something else you might like! :)',
      '../../assets/trash-bin.png',
      2000
    );
  }

  closeCart() {
    this.checkout = false;
    this.total = 0;
  }

  notify(title: string, message: string, icon: string, duration: number) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: icon
      });
      setTimeout(() => {
        notification.close();
      }, duration);
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          const welcomeNotification = new Notification(
            "Welcome to Nemi's Night!"
          );
          setTimeout(() => {
            welcomeNotification.close();
          }, 3000);

          const notification = new Notification(title, {
            body: message,
            icon: icon
          });
          setTimeout(() => {
            notification.close();
          }, duration);
        }
      });
    }
  }
}
