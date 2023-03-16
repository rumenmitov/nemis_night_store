import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  goToInstagram() {
    location.href = 'https://www.instagram.com/nemisnight/';
  }

  formNotify() {
    if (Notification.permission != 'granted') Notification.requestPermission().then((permission) => {
      if (permission == 'granted') {
	let welcomeNotification = new Notification("Welcome to Nemi's Night!");
	setTimeout(()=>{
	  welcomeNotification.close();
	}, 3000);
      }
    })
  }  
}
