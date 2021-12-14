import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import { FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _snackBar:  MatSnackBar
    ) {}

    loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    signupForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      type: ['', Validators.required]
    });
    login: boolean = false;
  signup: boolean = false;
  public showLogIn() {
    if (this.signup) {
      this.signup = false;
    }
    this.login = !this.login;
  }

  public showSignUp() {
    if (this.login)
      this.login = false;
    this.signup = !this.signup;
  }
  
  LogIn() {
    this.afAuth.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password)
    .then(value => {
      console.log('Nice, it worked!');
      this.router.navigate(['profile']);
    })
    .catch(err => {
      this._snackBar.open(err.message, '', {
        duration: 2500
      });
      console.log('Something went wrong: ', err.message);
    });
  }

  SignUp () {
    this.afAuth.createUserWithEmailAndPassword(this.signupForm.value.email, this.signupForm.value.password)
    .then(value => {
      if (this.signupForm.value.type === 'transporter') {
        this.router.navigate(['transporter']);
      }
      if (this.signupForm.value.type === 'client') {
        this.router.navigate(['client']);
      }
      if (this.signupForm.value.type === 'admin') {
        this.router.navigate(['admin']);
      }
    })
    .catch(err => {
      this._snackBar.open(err.message, '', {
        duration: 2500
      });
      console.log('Something went wrong: ', err.message);
    });
  }
  ngOnInit(): void {
  }

}
