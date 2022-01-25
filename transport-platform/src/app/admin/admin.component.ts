import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { LocalStorageService } from '../services/local-storage.service';
import {ContractInfo} from "../transporter/transporter.component";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  constructor(
    private fs: AngularFirestore,
    private fb: FormBuilder,
    private localStorage: LocalStorageService

  ) {this.fs.collection('users').get().forEach(value =>
    value.forEach(value => {
        const val: ITestItem = value.data() as ITestItem
        this.users.push(val)
      }
    )
  );
    this.fs.collection('contracts').get().forEach(value =>
      value.forEach(value => {
          const val: ContractInfo = value.data() as ContractInfo
            this.contracts.push(val);
        }
      )
    );
    this.fs.collection('products').get().forEach(value =>
      value.forEach(value => {
          const val: Product = value.data() as Product
          this.products.push(val);
        }
      )
    )  }
  data: any
  showusers: any = false
  showproducts: any = false
  showcontracts : any = false
  users: Array<ITestItem> = []
  products: Array<Product> = []
  displayedColumnsOffers: string[] = [ 'username', 'email', 'type'];
  displayProducts: string[] = [ 'name'];
  displayedColumnsContracts: string[] = ['email_client', 'numar_tel_client', 'email_transp', 'numar_tel_transp', 'loc_plecare', 'loc_sosire', 'tarif', 'detalii_marfa', 'detalii_camion', 'instructiuni_speciale'];
  contracts: Array<ContractInfo> = []
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
    this.showcontracts = false
  }

  ShowProducts() {
    this.showproducts = true
    this.showusers = false
    this.showcontracts = false
    this.products.forEach(value =>
      console.log(value.name))
  }
  ShowContracts() {
    this.showproducts = false
    this.showusers = false
    this.showcontracts = true
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
