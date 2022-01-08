import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  constructor(
    private fs: AngularFirestore,
    private fb: FormBuilder
  ) {this.fs.collection('users').get().forEach(value =>
    value.forEach(value => {
      const val: ITestItem = value.data() as ITestItem
      this.users.push(val)
    }
    )
  );
  this.fs.collection('products').get().forEach(value =>
    value.forEach(value => {
      const val: Product = value.data() as Product
      this.products.push(val)
    }
    )
  )  }
  data: any
  showusers: any = false
  showproducts: any = false
  users: Array<ITestItem> = []
  products: Array<Product> = []

  addProductForm = this.fb.group({
    name: ['', Validators.required]
  });

  ngOnInit(): void {
    
  }
  
  ShowUsers(){
    this.showusers = true
    this.showproducts = false
    this.users.forEach(value =>
      console.log(value.email, value.type, value.username))
  }
  
  ShowProducts() {
    this.showproducts = true
    this.showusers = false
    this.products.forEach(value =>
      console.log(value.name))
  }

  AddProducts(){
    let item: Product = {
      name: this.addProductForm.value.name
    };
    console.log(item.name)
    this.products.push(item)
    this.fs.collection('products').add(item)
    this.addProductForm.reset()
  }
}

export interface ITestItem {
  email: string,
  username: string,
  type: string
}

export interface Product {
  name: string
}