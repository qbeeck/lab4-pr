import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  emails$: Observable<any> = this._http.get('http://localhost:3000/messages');

  form = new FormGroup({
    email: new FormControl('', Validators.required),
    text: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
  });

  constructor(
    private readonly _http: HttpClient,
  ) {}

  sendEmail(): void {
    this._http.get(`http://localhost:3000/send?email=${this.form.value.email}&text=${this.form.value.text}&title=${this.form.value.title}`).subscribe();
  }
}
