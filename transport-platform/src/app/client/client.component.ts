import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { LocalStorageService } from '../services/local-storage.service';
import { setDefaultOptions, loadModules } from 'esri-loader';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import localitati from '../../assets/localitati.json'
import DatePicker from 'esri/widgets/support/DatePicker';

export interface Settlements {
  id: number, nume: string,diacritice: string,judet: string,auto:string,zip: number,populatie: number,lat: number,lng: number
}

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit{
  myControl = new FormControl();
  options: Settlements[] = localitati
  filteredOptions1: Observable<Settlements[]> ;
  filteredOptions2: Observable<Settlements[]> ;
  selectedValue: string;

  ngOnInit() {
    this.filteredOptions1 = this.addRequestForm.controls['loc_plecare'].valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value.nume)),
      map(name => (name ? this._filter(name) : this.options.slice())),
    );
    this.filteredOptions2 = this.addRequestForm.controls['loc_sosire'].valueChanges.pipe(
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
  offers: Array<OfferInfo> = []
  currentOffer: OfferInfo

  idList: Array<string> = []
  contracts: Array<ContractInfo> = []
  displayedColumnsOffers: string[] = [ 'data_plecare', 'loc_plecare', 'data_sosire', 'loc_sosire', 'gabarit', 'greutate', 'volum', 'pret_gol', 'pret_incarcat', 'numar_tel','email', 'rezerva_camion'];
  displayedColumnsContracts: string[] = ['email_client', 'numar_tel_client', 'email_transp', 'numar_tel_transp', 'loc_plecare', 'loc_sosire', 'tarif', 'detalii_marfa', 'detalii_camion', 'instructiuni_speciale'];
  map: __esri.Map;
  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;
  view: __esri.MapView;
  timeoutHandler = null;
  pointGraphic: __esri.Graphic;
  graphicsLayer: __esri.GraphicsLayer;
  routeCoordinates: Array<any> = []
  // displayedColumnsReq: string[] = [ 'id_transp' ,'data_plecare','loc_plecare','data_sosire','loc_sosire','tip_camion','volum','gabarit','greutate','pret','numar_tel'];
  client : User1
  currentReq: ReqItem
  offersAux: Array<OfferInfo> = []
  offerId: string
  products: Array<string> = []
  _Map;
  _MapView;
  _FeatureLayer;
  _Graphic;
  _GraphicsLayer;
  _route;
  _RouteParameters;
  _FeatureSet;
  _config;
  constructor(
    private fb: FormBuilder,
    private fs: AngularFirestore,
    private localStorage: LocalStorageService
  ) {
    this.fs.collection('offers').get().forEach(value =>
      value.forEach(value => {
          const val: OfferInfo = value.data() as OfferInfo
          this.fs.collection("tracks").doc(val.id_camion).get().forEach(value => {
            let track = value.data() as Track
            val.gabarit = track.gabarit
            val.greutate = track.greutate
            val.volum = track.volum
            val.pret_gol = track.pret_gol
            val.pret_incarcat = track.pret_incarcat
            const date = new Date(val['data_plecare']['seconds']*1000);
            val['data_plecare'] = date.toLocaleDateString("en-US")
            val['data_sosire'] = (new Date(val['data_sosire']['seconds']*1000)).toLocaleDateString("en-US")
          })
          this.offers.push(val)
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
    this.fs.collection('products').get().forEach(value =>
      value.forEach(value => {
          const val: string = value.data() as string

          this.products.push(val['name'])
        }
      )
    );

    this.fs.collection("users").doc(this.localStorage.getItem("UserID")).get().forEach(value => {
      this.client = value.data() as User1
    })
  }


  addreq: boolean = false;
  showtracks: boolean = false;
  showmap: boolean = false
  showoffers: boolean = false
  showsugestions: boolean = false
  showcontracts: boolean = false

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
    this.addreq = true;
    this.showtracks = false
    this.showoffers = false
    this.showsugestions = false
    this.showcontracts = false
  }

  TakeTrack(i: number) {
    // this.fs.collection('tracks').doc(this.idList[i]).delete()
    // this.tracks.splice(i, 1)
    // this.idList.splice(i, 1)
  }
  ShowOffers() {
    this.showoffers = true
    this.addreq = false
    this.showtracks = false
    this.showsugestions = false
    this.offersAux = []
    this.showcontracts = false
  }

  showContracts() {
    this.showcontracts = true
    this.showoffers = false
    this.addreq = false
    this.showtracks = false
    this.showsugestions = false
  }

  SubmitRequest() {
    let id = this.fs.createId()
    let item: ReqItem = {
      id_cerere: id,
      id_client: this.localStorage.getItem("UserID"),
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

    this.fs.collection('requests').doc(id).set(item)
    this.addRequestForm.reset()
    this.addreq = false;
  }

  GiveProducts(oferta: OfferInfo) {
    console.log(this.currentReq)
    this.currentOffer = oferta
    this.fs.collection('users').doc(oferta.id_transp).get().forEach(value => {
      let transportator = value.data() as User1
      let item: ContractInfo = {
        id_client: this.localStorage.getItem("UserID"),
        id_transp: oferta.id_transp ,
        email_client: this.client.email,
        numar_tel_client: '',
        email_transp: transportator.email,
        numar_tel_transp: oferta.numar_tel,
        loc_plecare: oferta.loc_plecare,
        loc_sosire: oferta.loc_sosire,
        tarif: 0,
        detalii_marfa: '',
        detalii_camion: oferta.nr_inmatriculare,
        instructiuni_speciale: ''
      }
      this.fs.collection('contracts').add(item)
      let obj = this.fs.collection('offers').ref.where("nr_inmatriculare", "==", oferta.nr_inmatriculare).get().then(obj=> {
        obj.forEach(doc => this.offerId = doc.id)
      })
      this.fs.collection('offers').doc(this.offerId).delete()
      this.offers.forEach((element,index)=>{
        if(element.nr_inmatriculare==oferta.nr_inmatriculare) this.offers.splice(index,1);
      });

    })
  }
  MatchingOffers() {
    this.addreq = false
    this.showsugestions = true
    let id = this.fs.createId()
    let item: ReqItem = {
      id_cerere: id,
      id_client: this.localStorage.getItem("UserID"),
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
    this.currentReq = item
    this.offers.forEach(val => {
      if (item.loc_plecare['nume'] == val.loc_plecare['nume'] && item.loc_sosire['nume'] == val.loc_sosire['nume']) {
        this.offersAux.push(val)
      }
    })
    this.addRequestForm.reset()
  }

  ShowTracks() {
    this.showtracks = true;
    this.addreq = false
  }
  async initializeMap() {
    try {
      this.showmap = true

      // before loading the modules for the first time,
      // also lazy load the CSS for the version of
      // the script that you're loading from the CDN
      setDefaultOptions({ css: true });

      // Load the modules for the ArcGIS API for JavaScript
      const [Map, MapView, FeatureLayer, Graphic, GraphicsLayer, route, RouteParameters, FeatureSet, esriConfig, PictureMarkerSymbol] = await loadModules([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/rest/route",
        "esri/rest/support/RouteParameters",
        "esri/rest/support/FeatureSet",
        "esri/config",
        "esri/symbols/PictureMarkerSymbol"
      ]);

      this._Map = Map;
      this._MapView = MapView;
      this._FeatureLayer = FeatureLayer;
      this._Graphic = Graphic;
      this._GraphicsLayer = GraphicsLayer;
      this._route = route;
      this._RouteParameters = RouteParameters;
      this._FeatureSet = FeatureSet;
      this._config = esriConfig;
      this._config.apiKey= "AAPK046a40935c1e45e49250a5e5cfdf11ff0ztE-myr__KUXRSs62A1kRuDsqtokNKRk7e8C8M_2QbosShHsRUwF_vHNHtrh4-z";

      // Configure the Map
      const mapProperties = {
        basemap: "arcgis-navigation"
      };

      this.map = new Map(mapProperties);

      this.addFeatureLayers();

      const graphicsLayer = new GraphicsLayer();

      const pointCenterBucharest = { //Create a point
        type: "point",
        longitude: this.currentReq.loc_plecare['lng'],
        latitude: this.currentReq.loc_plecare['lat'],
      };

      const pointCenterClujNapoca = {
        type: "point",
        longitude:this.currentReq.loc_sosire['lng'],
        latitude: this.currentReq.loc_sosire['lat'],
      }


      const truckPictureMarkerSymbol = {
        type: "picture-marker",
        url: "../../assets/pickup.png",
        width: "28px",
        height: "28px"
      }
      const pictureMarkerSymbolBucharest = {
        type: "picture-marker",
        url: "../../assets/start_icon.png",
        width: "28px",
        height: "28px"
      };
      const pictureMarkerSymbolClujNapoca= {
        type: "picture-marker",
        url: "../../assets/finish_point.png",
        width: "28px",
        height: "28px"
      };

      const truck = new Graphic({
        geometry: pointCenterBucharest,
        symbol: truckPictureMarkerSymbol
      })
      const pointGraphicBucharest = new Graphic({
        geometry: pointCenterBucharest,
        symbol: pictureMarkerSymbolBucharest
      });
      const pointGraphicClujNapoca = new Graphic({
        geometry: pointCenterClujNapoca,
        symbol: pictureMarkerSymbolClujNapoca
      });

      graphicsLayer.add(pointGraphicBucharest);
      graphicsLayer.add(pointGraphicClujNapoca);
      graphicsLayer.add(truck);

      this.map.add(graphicsLayer);

      // Initialize the MapView
      const mapViewProperties = {
        container: this.mapViewEl.nativeElement,
        center: [ 25.601198, 45.939663],
        zoom: 6.5,
        map: this.map
      };

      this.view = new MapView(mapViewProperties);

      const routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

      const routeParams = new RouteParameters({
        stops: new FeatureSet({
          features: [pointGraphicBucharest, pointGraphicClujNapoca]
        }),

        returnDirections: true

      });

      route.solve(routeUrl, routeParams)
        .then(async (data) => {
          for (const result of data.routeResults) {
            result.route.symbol = {
              type: "simple-line",
              color: [5, 150, 255],
              width: 3
            };
            this.view.graphics.add(result.route);
            for await (let entry of result.route.geometry.paths[0]) {
              truck.geometry.longitude = entry[0];
              truck.geometry.latitude = entry[1];
              graphicsLayer.add(truck);

              this.map.add(graphicsLayer);
              await new Promise(r => setTimeout(r, 100));
            }
          }

          // Display directions
          if (data.routeResults.length > 0) {
            const directions = document.createElement("ol");
            // @ts-ignore
            directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
            directions.style.marginTop = "0";
            directions.style.padding = "15px 15px 15px 30px";
            const features = data.routeResults[0].directions.features;

            // Show each direction
            features.forEach(function (result, i) {
              const direction = document.createElement("li");
              direction.innerHTML = result.attributes.text + " (" + result.attributes.length.toFixed(2) + " miles)";
              directions.appendChild(direction);
            });

            this.view.ui.empty("top-right");
            this.view.ui.add(directions, "top-right");
          }

        }).catch(function(error){
        console.log(error);
      });


      // Fires `pointer-move` event when user clicks on "Shift"
      // key and moves the pointer on the view.
      this.view.on('pointer-move', ["Shift"], (event) => {
        let point = this.view.toMap({ x: event.x, y: event.y });
        console.log("map moved: ", point.longitude, point.latitude);
      });

      await this.view.when(); // wait for map to load
      console.log("ArcGIS map loaded");
      return this.view;
    } catch (error) {
      console.error("EsriLoader: ", error);
      throw error;
    }
  }


  addFeatureLayers() {
    // Trailheads feature layer (points)
    var trailheadsLayer: __esri.FeatureLayer = new this._FeatureLayer({
      url:
        "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0"
    });

    this.map.add(trailheadsLayer);


    // Trails feature layer (lines)
    var trailsLayer: __esri.FeatureLayer = new this._FeatureLayer({
      url:
        "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
    });

    this.map.add(trailsLayer, 0);

    // Parks and open spaces (polygons)
    var parksLayer: __esri.FeatureLayer = new this._FeatureLayer({
      url:
        "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0"
    });

    this.map.add(parksLayer, 0);

    console.log("feature layers added");
  }


}

export interface User1{
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
  data_plecare: string,
  loc_plecare: string,
  data_sosire: string,
  loc_sosire: string,
  numar_tel: string,
  email: string,
  volum: number,
  gabarit: number,
  greutate: number,
  pret_gol: number,
  pret_incarcat: number
}
export interface ReqItem {
  id_cerere: string,
  id_client: string,
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
