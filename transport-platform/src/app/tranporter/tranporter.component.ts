import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'app-tranporter',
  templateUrl: './tranporter.component.html',
  styleUrls: ['./tranporter.component.css']
})
export class TranporterComponent implements OnInit {
  requests: Array<ReqItem> = []
  idList: Array<string> = []
  constructor( 
    private fb: FormBuilder,
    private fs: AngularFirestore,
    private localStorage: LocalStorageService
    ) {
      this.fs.collection('requests').get().forEach(value =>
      value.forEach(value => {
        console.log("kskkksksksk")
        const val: ReqItem = value.data() as ReqItem
        this.requests.push(val)
        this.idList.push(value.id)
      }
      )
    ); }

  addTrackForm = this.fb.group({
    data_plecare: ['', Validators.required],
    loc_plecare: ['', Validators.required],
    data_sosire: ['', Validators.required],
    loc_sosire: ['', Validators.required],
    tip_camion: ['', Validators.required],
    volum: ['', Validators.required],
    gabarit: ['', Validators.required],
    greutate: ['', Validators.required],
    pret: ['', Validators.required],
    numar_tel: ['', Validators.required]
  });


  ngOnInit(): void {
  }
  
  add: boolean = false;
  showreq: boolean = false;

  addTrack() {
    this.add = true;
    this.showreq = false;
  }

  ShowRequests() {
    this.showreq = true;
    this.add = false
  }

  TakeProducts(i: number) {
    // this.fs.collection('requests').doc(this.idList[i]).delete()
    this.requests.splice(i, 1)
    this.idList.splice(i, 1)
  }

  SubmitTrack() {
    let item: Item = {
      id_transp: this.localStorage.getItem("UserID"),
      data_plecare: this.addTrackForm.value.data_plecare,
      loc_plecare: this.addTrackForm.value.loc_plecare,
      data_sosire: this.addTrackForm.value.data_sosire,
      loc_sosire: this.addTrackForm.value.loc_sosire,
      tip_camion: this.addTrackForm.value.tip_camion,
      volum: this.addTrackForm.value.volum,
      gabarit: this.addTrackForm.value.gabarit,
      greutate: this.addTrackForm.value.greutate,
      pret: this.addTrackForm.value.pret,
      numar_tel: this.addTrackForm.value.numar_tel
    };
    this.fs.collection('tracks').add(item)  
    this.addTrackForm.reset()
    this.add = false;
  }
}

export interface Item {
  id_transp: string,
  data_plecare: Date,
  loc_plecare: string,
  data_sosire: Date,
  loc_sosire: string,
  tip_camion: string,
  volum: number,
  gabarit: number,
  greutate: number,
  pret: number,
  numar_tel: string
}

export interface ReqItem {
  id_transp: string,
  data_plecare: Date,
  loc_plecare: string,
  data_max_plecare: Date,
  data_sosire: Date,
  loc_sosire: string,
  data_max_sosire: Date,
  tip_marfa: string,
  masa: number,
  volum: number,
  buget: number,
  numar_tel: string
}

