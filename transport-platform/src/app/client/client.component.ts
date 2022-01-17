import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { LocalStorageService } from '../services/local-storage.service';
import { setDefaultOptions, loadModules } from 'esri-loader';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  tracks: Array<TrackItem> = []
  showmap: boolean = false
  routeCoordinates: Array<any> = []
  idList: Array<string> = []
  map: __esri.Map;
  @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;
  view: __esri.MapView;
  timeoutHandler = null;
  pointGraphic: __esri.Graphic;
  graphicsLayer: __esri.GraphicsLayer;


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
        longitude: 26.102866,
        latitude: 44.428054,
      };

      const pointCenterClujNapoca = {
        type: "point",
        longitude: 23.589971,
        latitude: 46.770952,
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
