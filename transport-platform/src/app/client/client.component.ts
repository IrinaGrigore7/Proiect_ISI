import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  tracks: Array<TrackItem> = []
  idList: Array<string> = []
  constructor(
    private fb: FormBuilder,
    private fs: AngularFirestore,
    private localStorage: LocalStorageService
  ) {this.fs.collection('tracks').get().forEach(value =>
    value.forEach(value => {
      const val: TrackItem = value.data() as TrackItem
      this.tracks.push(val)
      this.idList.push(value.id)
    }
    )
  ); }

  ngOnInit(): void {
  }

  add: boolean = false;
  showtracks: boolean = false;

  addRequestForm = this.fb.group({
    data_plecare: ['', Validators.required],
    loc_plecare: ['', Validators.required],
    data_max_plecare: ['', Validators.required],
    data_sosire: ['', Validators.required],
    loc_sosire: ['', Validators.required],
    data_max_sosire: ['', Validators.required],
    tip_marfa: ['', Validators.required],
    masa: ['', Validators.required],
    volum: ['', Validators.required],
    buget: ['', Validators.required],
    numar_tel: ['', Validators.required]
  });

  addRequest() {
    this.add = true;
    this.showtracks = false
  }
  
  TakeTrack(i: number) {
    this.fs.collection('tracks').doc(this.idList[i]).delete()
    this.tracks.splice(i, 1)
    this.idList.splice(i, 1)
  }

  SubmitRequest() {
    let item: ReqItem = {
      id_transp: this.localStorage.getItem("UserID"),
      data_plecare: this.addRequestForm.value.data_plecare,
      loc_plecare: this.addRequestForm.value.loc_plecare,
      data_max_plecare: this.addRequestForm.value.data_max_plecare,
      data_sosire: this.addRequestForm.value.data_sosire,
      loc_sosire: this.addRequestForm.value.loc_sosire,
      data_max_sosire: this.addRequestForm.value.data_max_sosire,
      tip_marfa: this.addRequestForm.value.tip_marfa,
      masa: this.addRequestForm.value.masa,
      volum: this.addRequestForm.value.volum,
      buget: this.addRequestForm.value.buget,
      numar_tel: this.addRequestForm.value.numar_tel
    };
    this.fs.collection('requests').add(item)  
    this.addRequestForm.reset()
    this.add = false;
  }

  ShowTracks() {
    this.showtracks = true;
    this.add = false
  }
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

export interface TrackItem {
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
