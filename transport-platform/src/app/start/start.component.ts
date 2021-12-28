import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})

export class StartComponent implements OnInit {
  login: boolean = false;
  signup: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private fb: FormBuilder,
    private _snackBar:  MatSnackBar,
    private fs: AngularFirestore
    ) {}

  loginForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  signupForm = this.fb.group({
    username:  ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
    type: ['', Validators.required]
  });
  
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
      this.afAuth.currentUser.then(value => {
        const uid = value?.uid
        console.log(uid)
        const jlogin = this.fs.collection('users').doc(uid)
        jlogin.ref.get().then((doc) => {
          const data: ITestItem = doc.data() as ITestItem
          if (data.type === 'client')
            this.router.navigate(['client']);
          if (data.type === 'transporter')
            this.router.navigate(['transporter']);
          if (data.type === 'admin')
            this.router.navigate(['admin']);
        })
      
      })
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
      let item: ITestItem = {
        email: this.signupForm.value.email,
        username: this.signupForm.value.username,
        type: this.signupForm.value.type
      };
      this.afAuth.currentUser.then(value => {
        const uid = value?.uid
        this.fs.collection('users').doc(uid).set(item);
      })
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

export interface ITestItem {
  email: string,
  username: string,
  type: string
}

