import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { LocalStorageService } from '../services/local-storage.service';
import localitati from '../../assets/localitati.json'
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';


export interface Settlements {
  id: number, nume: string,diacritice: string,judet: string,auto:string,zip: number,populatie: number,lat: number,lng: number
}
@Component({
  selector: 'app-tranporter',
  templateUrl: './tranporter.component.html',
  styleUrls: ['./tranporter.component.css']
})


export class TranporterComponent implements OnInit {
  options: Settlements[] = localitati
  filteredOptions1: Observable<Settlements[]> ;
  filteredOptions2: Observable<Settlements[]> ;
  selectedValue: string;

  ngOnInit() {
    this.filteredOptions1 = this.addOfferForm.controls['loc_plecare'].valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value.nume)),
      map(name => (name ? this._filter(name) : this.options.slice())),
    );
    this.filteredOptions2 = this.addOfferForm.controls['loc_sosire'].valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value.nume)),
      map(name => (name ? this._filter(name) : this.options.slice())),
    );
  }

  displayFn(user: Settlements): string {
    return user && user.nume ? user.nume : '';
  }

  private _filter(name: string): Settlements[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.nume.toLowerCase().includes(filterValue));
  }
  requests: Array<ReqItem> = []
  tracks: Array<Track> = []
  offers: Array<OfferInfo> = []
  idList: Array<string> = []
  contracts: Array<ContractInfo> = []
  requestsAux: Array<ReqItem> = []
  displayedColumns: string[] = ['nr_inmatriculare', 'tip_camion', 'volum', 'gabarit', 'greutate', 'pret_gol', 'pret_incarcat', 'actiune'];
  displayedColumnsReq: string[] = [ 'data_plecare', 'data_max_plecare', 'data_sosire', 'data_max_sosire', 'loc_plecare', 'loc_sosire', 'tip_marfa','masa','volum','buget','numar_tel','actiune'];
  displayedColumnsOffers: string[] = ['nr_inmatriculare', 'data_plecare', 'loc_plecare', 'data_sosire', 'loc_sosire', 'numar_tel','email'];
  displayedColumnsContracts: string[] = ['email_client', 'numar_tel_client', 'email_transp', 'numar_tel_transp', 'loc_plecare', 'loc_sosire', 'tarif', 'detalii_marfa', 'detalii_camion', 'instructiuni_speciale'];
  trackId: string
  nr_inmatriculare: string
  currentOffer: OfferInfo
  transporter: User
  constructor(
    private fb: FormBuilder,
    private fs: AngularFirestore,
    private localStorage: LocalStorageService
  ) {
    this.fs.collection('requests').get().forEach(value =>
      value.forEach(value => {
          const val: ReqItem = value.data() as ReqItem
          const date = new Date(val['data_plecare']['seconds']*1000);
          val['data_plecare'] = date.toLocaleDateString("en-US")
          val['data_sosire'] = (new Date(val['data_sosire']['seconds']*1000)).toLocaleDateString("en-US")
          val['data_max_sosire'] = (new Date(val['data_max_sosire']['seconds']*1000)).toLocaleDateString("en-US")
          val['data_max_plecare'] = (new Date(val['data_max_plecare']['seconds']*1000)).toLocaleDateString("en-US")
          console.log(val)
          this.requests.push(val)
          this.idList.push(value.id)
        }
      )
    );

    this.fs.collection('tracks').get().forEach(value =>
      value.forEach(value => {
          const val: Track = value.data() as Track
          this.tracks.push(val)
        }
      )
    );
    this.fs.collection('offers').get().forEach(value =>
      value.forEach(value => {
          const val: OfferInfo = value.data() as OfferInfo
          this.offers.
          push(val)
        }
      )
    );
    this.fs.collection('contracts').get().forEach(value =>
      value.forEach(value => {
          const val: ContractInfo = value.data() as ContractInfo
          if (val.id_transp == this.localStorage.getItem("UserID"))
            this.contracts.push(val)
        }
      )
    );
    this.fs.collection("users").doc(this.localStorage.getItem("UserID")).get().forEach(value => {
      this.transporter = value.data() as User
    })
  }

  addTrackForm = this.fb.group({
    nr_inmatriculare: ['', Validators.required],
    tip_camion: ['', Validators.required],
    volum: ['', Validators.required],
    gabarit: ['', Validators.required],
    greutate: ['', Validators.required],
    pret_gol: ['', Validators.required],
    pret_incarcat: ['', Validators.required]
  });
  addOfferForm = this.fb.group({
    data_plecare: ['', Validators.required],
    loc_plecare: ['', Validators.required],
    data_sosire: ['', Validators.required],
    loc_sosire: ['', Validators.required],
    numar_tel: ['', Validators.required],
    email: ['', Validators.required],
  });

  addtrack: boolean = false;
  addoffer: boolean = false;
  showreq: boolean = false;
  showtracks: boolean = false
  showoffers: boolean = false
  showsugestions: boolean = false
  showcontracts: boolean = false

  addTrack() {
    this.addtrack = true;
    this.showreq = false;
    this.addoffer = false
    this.showtracks = false;
    this.showoffers = false
    this.showsugestions = false
    this.showcontracts = false
  }

  ShowRequests() {
    this.showreq = true;
    this.addtrack = false
    this.addoffer = false
    this.showtracks = false;
    this.showoffers = false
    this.showsugestions = false
    this.showcontracts = false
  }

  ShowTracks() {
    this.showtracks = true;
    this.showreq = false;
    this.addtrack = false
    this.addoffer = false
    this.showoffers = false
    this.showsugestions = false
    this.requestsAux = []
    this.showcontracts = false
  }

  showOffers() {
    this.showoffers = true
    this.showtracks = false;
    this.showreq = false;
    this.addtrack = false
    this.addoffer = false
    this.showsugestions = false
    this.showcontracts = false
  }

  addOffer(nr_inmatriculare: string) {
    this.addoffer = true
    this.showreq = false;
    this.addtrack = false
    this.showtracks = false;
    this.showcontracts = false
    this.nr_inmatriculare = nr_inmatriculare
    let obj = this.fs.collection('tracks').ref.where("nr_inmatriculare", "==", nr_inmatriculare).get().then(obj=> {
      obj.forEach(doc => this.trackId = doc.id)
    })
  }

  addTrackOffer() {
    console.log("jdjdjdjdjj")
    let item: OfferInfo = {
      id_camion: this.trackId,
      id_transp: this.localStorage.getItem("UserID"),
      nr_inmatriculare: this.nr_inmatriculare,
      data_plecare: this.addOfferForm.value.data_plecare,
      loc_plecare: this.addOfferForm.value.loc_plecare,
      data_sosire: this.addOfferForm.value.data_sosire,
      loc_sosire: this.addOfferForm.value.loc_sosire,
      numar_tel: this.addOfferForm.value.numar_tel,
      email: this.addOfferForm.value.email,
    };
    this.fs.collection('offers').add(item)
    this.addOfferForm.reset()
    this.addoffer = false
  }

  MatchingRequests() {
    this.addoffer = false
    let item: OfferInfo = {
      id_camion: this.trackId,
      id_transp: this.localStorage.getItem("UserID"),
      nr_inmatriculare: this.nr_inmatriculare,
      data_plecare: this.addOfferForm.value.data_plecare,
      loc_plecare: this.addOfferForm.value.loc_plecare,
      data_sosire: this.addOfferForm.value.data_sosire,
      loc_sosire: this.addOfferForm.value.loc_sosire,
      numar_tel: this.addOfferForm.value.numar_tel,
      email: this.addOfferForm.value.email,
    };
    this.currentOffer = item
    this.requests.forEach(val => {
        if (item.loc_plecare == val.loc_plecare && item.loc_sosire == val.loc_sosire) {
          console.log(val.id_cerere)
          this.requestsAux.push(val)
        }
      }
    )
    this.showsugestions = true
    this.addOfferForm.reset()
  }

  TakeProducts(cerere: ReqItem) {
    this.fs.collection('users').doc(cerere.id_client).get().forEach(value => {
      let client = value.data() as User
      let item: ContractInfo = {
        id_client: cerere.id_client,
        id_transp: this.currentOffer.id_transp,
        email_client: client.email,
        numar_tel_client: cerere.numar_tel,
        email_transp: this.transporter.email,
        numar_tel_transp: this.currentOffer.numar_tel,
        loc_plecare: cerere.loc_plecare['nume'],
        loc_sosire: cerere.loc_sosire['nume'],
        tarif: 0,
        detalii_marfa: cerere.tip_marfa,
        detalii_camion: this.currentOffer.nr_inmatriculare,
        instructiuni_speciale: ''
      }
      this.fs.collection('contracts').add(item)
      this.fs.collection('requests').doc(cerere.id_cerere).delete()
      this.requests.forEach((element,index)=>{
        if(element.id_cerere==cerere.id_cerere) this.requests.splice(index,1);
      });

    })
  }

  SubmitTrack() {
    let item: Track = {
      id_transp: this.localStorage.getItem("UserID"),
      nr_inmatriculare: this.addTrackForm.value.nr_inmatriculare,
      tip_camion: this.addTrackForm.value.tip_camion,
      volum: this.addTrackForm.value.volum,
      gabarit: this.addTrackForm.value.gabarit,
      greutate: this.addTrackForm.value.greutate,
      pret_gol: this.addTrackForm.value.pret_gol,
      pret_incarcat: this.addTrackForm.value.pret_incarcat,
    };
    this.fs.collection('tracks').add(item).then((docRef) => {
      console.log("ID = ", docRef.id)
    })
    this.addTrackForm.reset()
    this.addtrack = false;
  }

  ShowContracts() {
    this.showcontracts = true
    this.showoffers = false
    this.showtracks = false;
    this.showreq = false;
    this.addtrack = false
    this.addoffer = false
    this.showsugestions = false
  }

}
export interface User{
  email: string,
  username: string,
  type: string
}
export interface Track {
  id_transp: string,
  nr_inmatriculare: string,
  tip_camion: string,
  volum: number,
  gabarit: number,
  greutate: number,
  pret_gol: number,
  pret_incarcat: number
}
export interface OfferInfo {
  id_camion: string,
  id_transp:string,
  nr_inmatriculare: string,
  data_plecare: Date,
  loc_plecare: string,
  data_sosire: Date,
  loc_sosire: string,
  numar_tel: string,
  email: string,
}
export interface ReqItem {
  id_cerere: string,
  id_client: string,
  data_plecare: string,
  loc_plecare: string,
  data_max_plecare: string,
  data_sosire: string,
  loc_sosire: string,
  data_max_sosire: string,
  tip_marfa: string,
  masa: number,
  volum: number,
  buget: number,
  numar_tel: string
}

export interface ContractInfo {
  id_client: string,
  id_transp: string,
  email_client: string,
  numar_tel_client: string,
  email_transp: string,
  numar_tel_transp: string,
  loc_plecare: string,
  loc_sosire: string,
  tarif: number,
  detalii_marfa: string,
  detalii_camion: string,
  instructiuni_speciale: string
}
