import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
let supabase = createClient('https://bmqblboosmqzcfdwnopt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcWJsYm9vc21xemNmZHdub3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDA5NTcsImV4cCI6MjA1NzQ3Njk1N30.vqGikebf3d58yqgMHqvRiF8Dzno89XJpgGfeVZBBSZU')

console.log('Supabase Instance: ', supabase);

const memid = "mem_cm2j78k6s0xg40srphrfpegh2";
const sbkey = "20f78bee-32fd-47bf-8eae-b253cf7cafba";

//////////////////////////////////ADD MAP//////////////////////////////////

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwa2luZCIsImEiOiJjbTQ3MGh1eTcwMGljMnFvc21ubjNqZ2xtIn0.82rbPi7HCJppPKcI6NU-GQ';//defaut token!!!! CHANGE

const mapDiv = document.createElement('div');
mapDiv.setAttribute('id', 'mapDiv');
mapDiv.style.width = '100%';
mapDiv.style.height = 800;
mapDiv.style.marginBottom = 60;
document.body.appendChild(mapDiv);

let map;

map = new mapboxgl.Map({
  container: 'mapDiv',
  style: 'mapbox://styles/mapkind/cltczfy6c00ok01o8bslg9acr?fresh=true',//MoW Outdoors
  center: [-107.67153, 38.02283],//Ouray 
  zoom: 14,
  attributionControl: false,
  logoPosition: 'top-left',
  preserveDrawingBuffer: true,
  hash: "map"
});

map.on('load', function() {
  var raw = JSON.stringify({"memID":memid, "sbkey":sbkey});
  // create a JSON object with parameters for API call and store in a variable
  var requestOptions = {
      method: 'POST',
      //mode: 'no-cors',
      //headers: myHeaders,
      body: raw,
      redirect: 'follow'
  };
  
  fetch('https://hook.us1.make.com/y2pmos4t4vqv4eq87sh0uhiypz4u16oi',requestOptions)
  .then(response => response.json())
  .then(result => memberAuthResult(result))
  .catch(error => console.log('error', error));


function memberAuthResult(r){
  console.log("Member Auth Result: ",r);
  const memAuth = r.access;

  if(memAuth == true){
    async function createSBuser(){
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {"msid": memid}
        }
      })
      console.log("auth data: ",data);
      getFeatures(memid);
    }

    async function getSBsession(){
      //const { data, error } = await supabase.auth.getSession()
      const { data, error } = await supabase.auth.refreshSession()
      const { session, user } = data
      if(error){
        createSBuser();
      }
      else{
        console.log("session data: ",data);
        getFeatures(memid);
      }
    }
    getSBsession();
  }

  async function getFeatures(id){
    if(memAuth == true){
      const { data, error } = await supabase
      .from('features')
      .select()
      //.not('globalid', 'eq', '111-111-111')
      .eq('memid', id)
      //.eq('sbkey', key)
      console.log("features: ", data);
    }
    else{
      console.log("Not authorized to get features.")
    }
  }

  
}

async function getMembers(){
    const { data, error } = await supabase
    .from('members')
    .select()
  
    console.log("members: ", data);
}
let pointCollection;
async function getPointFeatures(id){
    const { data, error } = await supabase
    .from('features')
    //.select('geom->geometry->type, ? (@ = fType)')
    .select('geom->geometry, geom->properties, geom->type, geom->source')
    .eq('fType','Point')
    .eq('memid', id)

    pointCollection = {
      type: 'FeatureCollection',
      features: data
      };
    console.log("Point feature collection: ", pointCollection);
    map.getSource('Point_Source').setData(pointCollection);
}

async function getLineFeatures(id){
  const { data, error } = await supabase
  .from('features')
  .select()
  .not('fType', 'eq', 'Point')
  .eq('memid',id)
  console.log("Line features: ", data);
}

async function getEpisodeFeatures(episode, id){
  const { data, error } = await supabase
  .from('features')
  //.select('globalid, name, ')
  .select(`
    name,
    globalid,
    geom,
    memid,
    features_in_episodes!inner (
    ),
    episodes!inner (
      name, GlobalID
    )
  `)
  .eq('features_in_episodes.eID',episode)
  .eq('memid', id)
  console.log("Episode features: ", data);
}

/*,
    episodes!inner (
      GlobalID
    )*/



getMembers();
getPointFeatures(memid);
getLineFeatures(memid);

var theEpisode = "111-111-111";
getEpisodeFeatures(theEpisode,memid);


async function createFeature(){
    var uuid = self.crypto.randomUUID();
    const { data, error } = await supabase
    .from('features')
    .insert({ memid: memid, name: 'Auth Lake 2', globalid: uuid, fType: 'Point',  geom: {
      "type": "Feature",
      "properties": {
          "name": "Gollum Gulch",
          "desc": "",
          "point_type": "naturalWonder",
          "vehicleCapacity": "",
          "sheltered": "",
          "waterside": "",
          "epicCamp": "",
          "campsiteFee": "",
          "campsiteLocation": "",
          "campsiteClass": "",
          "notes": "",
          "title": "Gollum Gulch",
          "state": "",
          "GlobalID": "6d5758e6-05a7-4aa2-9f70-db6fef653ba4",
          "OBJECTID": "",
          "video_episode": "",
          "video_episode2": "",
          "video_episode3": "",
          "archived": "",
          "route": [],
          "trailerFriendly": "",
          "folder": [],
          "episode": []
      },
      "geometry": {
          "type": "Point",
          "coordinates": [
              -107.66666841063493,
              38.01706149466503,
              2485
          ]
      },
      "source": "Point_Source"
  }})
    .select()

  if(!error){
    console.log("Feature created:", data);
    //getFeatures();
  }
  else{
    console.log("error: ", error);
  }
}

var featurebutton = document.getElementById("featurebutton");

featurebutton.addEventListener("click", createFeature);

async function createEpisode(){
  var uuid = self.crypto.randomUUID();
  const { data, error } = await supabase
  .from('episodes')
  .insert({ memID: memid, name: 'S1E3', GlobalID: uuid})
  .select(`
    name,
    GlobalID,
    memID
  `)
  .eq('memID', memid)

if(!error){
  console.log("Episode created:", data);
}
else{
  console.log("error: ", error);
}
}

var episodebutton = document.getElementById("episodebutton");

episodebutton.addEventListener("click", createEpisode);

// Create form
const folderForm = document.createElement('form');
folderForm.style.display = 'flex';
folderForm.style.flexDirection = 'row';

// Create input fields
const folderName = document.createElement('input');
folderName.setAttribute('type', 'text');
folderName.setAttribute('name', 'name');
folderName.setAttribute('placeholder', 'Folder Name');

// Create submit button
const submitButton = document.createElement('input');
submitButton.setAttribute('type', 'submit');
submitButton.setAttribute('value', '+');

var submitButtonImage = document.createElement('img');
submitButtonImage.src = 'icons/folder-add.svg';
submitButtonImage.width = 24;
//submitButton.appendChild(submitButtonImage);

// Add elements to form
folderForm.appendChild(folderName);
folderForm.appendChild(submitButton);
//folderForm.appendChild(submitButtonImage);

// Append form to the document body
document.body.appendChild(folderForm);

// Add event listener for form submission
folderForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission
  //const name = folderName.value;
  console.log('Folder Name:', folderName.value);
  // Handle form data here, e.g., send it to a server

  async function createFolder(){
    var uuid = self.crypto.randomUUID();
    const { data, error } = await supabase
    .from('folders')
    .insert({ memID: memid, name: folderName.value, GlobalID: uuid})
    .select(`
      name,
      GlobalID,
      memID
    `)
    .eq('memID', memid)
  
  if(!error){
    console.log("Folder created:", data);
    getFolders();
  }
  else{
    console.log("error: ", error);
  }
  }

  createFolder();

});

async function getFolders(){
  const { data, error } = await supabase
  .from('folders')
  .select()
  .eq('memID', memid)
  console.log("Folders: ", data);
  if(document.getElementById('folderList')){
    while (folderList.hasChildNodes()) {
      folderList.removeChild(folderList.firstChild);
    }
  }
  else{
    const folderList = document.createElement('div');
    folderList.setAttribute('id', 'folderList');
    folderList.style.flexDirection = 'column';
    document.body.appendChild(folderList);
  }

  for (var i = 0; i < data.length; i++) {
    if(!data[i].parent){
      var folderContainer = document.createElement('div');
      folderContainer.style.flexDirection = 'column';
      folderContainer.setAttribute('id', data[i].GlobalID);

      var folder = document.createElement('div');
      folder.style.display = 'flex';
      //folder.style.alignItems = 'center';
      folder.style.marginTop = '10px';
      folder.style.marginBottom = '5px';
  
      var folderImage = document.createElement('img');
      folderImage.src = 'icons/folder.svg';
      folderImage.width = 18;
      folder.appendChild(folderImage);
  
      var folderName = data[i].name;
      var folderNameDiv = document.createElement('div');
      folderNameDiv.style.height = 14;
      folderNameDiv.innerText = folderName;
      folderNameDiv.style.paddingLeft = '10px';
      folderNameDiv.style.alignItems = 'center';
      folder.appendChild(folderNameDiv);

      var shareImage = document.createElement('img');
      shareImage.src = 'icons/send-2.svg';
      shareImage.width = 12;
      shareImage.style.marginLeft = 130;
      folder.appendChild(shareImage);

      const subFolderForm = document.createElement('form');
      subFolderForm.style.display = 'flex';
      subFolderForm.style.flexDirection = 'row';
      subFolderForm.style.marginLeft = 28;
      subFolderForm.style.marginBottom = 0;
      subFolderForm.setAttribute('id', data[i].GlobalID);

      // Create input fields
      const subFolderName = document.createElement('input');
      subFolderName.setAttribute('type', 'text');
      subFolderName.setAttribute('name', 'name');
      subFolderName.setAttribute('placeholder', 'Subfolder Name');

      // Create submit button
      const submitButton2 = document.createElement('input');
      submitButton2.setAttribute('type', 'submit');
      submitButton2.setAttribute('value', '+');

      // Add elements to form
      subFolderForm.appendChild(subFolderName);
      subFolderForm.appendChild(submitButton2);
      //folderForm.appendChild(submitButtonImage);

      // Append form to the document body
      //document.body.appendChild(subFolderForm);

      // Add event listener for form submission
      subFolderForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        console.log("Parent ID: ",event.target.id);
        //const name = folderName.value;
        console.log('Folder Name:', subFolderName.value);
        // Handle form data here, e.g., send it to a server

        async function createSubFolder(){
          var uuid = self.crypto.randomUUID();
          const { data, error } = await supabase
          .from('folders')
          .insert({ memID: memid, name: subFolderName.value, GlobalID: uuid, parent: event.target.id})
          .select(`
            name,
            GlobalID,
            memID
          `)
          .eq('memID', memid)
        
        if(!error){
          console.log("Folder created:", data);
          getFolders();
        }
        else{
          console.log("error: ", error);
        }
        }

        createSubFolder();

      });
      
      folderContainer.appendChild(folder);
      folderContainer.appendChild(subFolderForm);
      folderList.appendChild(folderContainer);

    }
  }

  for (var i = 0; i < data.length; i++) {
    if(data[i].parent){
      var parent = document.getElementById(data[i].parent);

      var subFolderContainer = document.createElement('div');
      subFolderContainer.setAttribute('id', data[i].GlobalID);
      
      var subFolder = document.createElement('div');
      subFolder.style.display = 'flex';
      subFolder.style.alignItems = 'center';
      subFolder.style.marginTop= '2px';
      subFolder.style.marginLeft= '28px';
      
  
      var folderImage = document.createElement('img');
      folderImage.src = 'icons/folder.svg';
      folderImage.width = 18;
      subFolder.appendChild(folderImage);
  
      var folderName = data[i].name;
      var folderNameDiv = document.createElement('div');
      folderNameDiv.innerText = folderName;
      folderNameDiv.style.height = 14;
      folderNameDiv.style.paddingLeft = '10px';
      subFolder.appendChild(folderNameDiv);
  
      subFolderContainer.appendChild(subFolder);
      parent.appendChild(subFolderContainer);
    }
  }

  getFeaturesInFolders();

}

getFolders();

async function getFeaturesInFolders(){
  const { data, error } = await supabase
  .from('features')
  //.select()
  .select(`
    name,
    globalid,
    geom,
    memid,
    fType,
    features_in_folders!inner (
    ),
    folders!inner (
      name, GlobalID, parent
    )
  `)
  .eq('features_in_folders.memID',memid)
  .eq('memid', memid)
  console.log("Features in Folders: ", data);

  //Add features to folders

  for (var i = 0; i < data.length; i++) {
    if(data[i].folders.length > 1){
      //loop over folders
      for (var f = 0; f < data[i].folders.length; f++) {
        var folderID = data[i].folders[f].GlobalID;
        addFeatureToFolder(folderID,data[i]);
      }
    }
    else{
      var folderID = data[i].folders[0].GlobalID;
      addFeatureToFolder(folderID,data[i]);
    }
  }

  function addFeatureToFolder(id,feature){
    var targetFolderContainer = document.getElementById(id);
    var featureNameDiv = document.createElement('div');
    featureNameDiv.style.display = "flex";
    featureNameDiv.style.marginLeft = 56;
    if(feature.fType == "Point"){
      var featureIcon = document.createElement('img');
      featureIcon.src = "icons/location.svg";
      featureIcon.width = 14;
      featureNameDiv.appendChild(featureIcon)
    }
    else{
      var featureIcon = document.createElement('img');
      featureIcon.src = "icons/routing.svg";
      featureIcon.width = 14;
      featureNameDiv.appendChild(featureIcon)
    }
    var featureNameText = document.createElement('div');
    featureNameText.style.marginLeft = 5;
    featureNameText.innerText = feature.name;

    featureNameDiv.appendChild(featureNameText);
    targetFolderContainer.appendChild(featureNameDiv);
  }

}

////////////////////////ADD DATA TO MAP///////////////////////////////

map.addSource("Point_Source", {
  type: "geojson",
  data: '',
  generateId: true,
});

map.addLayer({
  id: "myPoints",
  type: "symbol",
  source: "Point_Source",
  //filter: ['==', '$type', 'Point'],
  filter: ["all", ["!=", "$type", "LineString"], ["!=", "$type", "Polygon"], ['!=', 'archived', 'yes']],
  layout: {
  //'visibility': 'none',
  'icon-allow-overlap': true,
  'text-allow-overlap': true,
  'icon-size': 1,
  'text-field': '{name}',
  'text-anchor': "bottom",
  'text-font': [
    'literal',
    ['DIN Offc Pro Bold', 'Arial Unicode MS Regular']
    ],
  'text-size': 12,
  'text-offset': [0,-1.5],
  "symbol-sort-key":["get","vehicleCapacity"],
  'icon-image': [
    'case',
    ['==', ['get', 'point_type'], 'obstacle'],
    'caution-circle-border',
    ['==', ['get', 'point_type'], 'naturalWonder'],
    'naturalwonder-circle-border',
    ['==', ['get', 'point_type'], 'historic'],
    'historic-circle-border',
    ['==', ['get', 'point_type'], 'beach'],
    'beach-circle-border',
    ['==', ['get', 'point_type'], 'art'],
    'art-circle-border',
    ['==', ['get', 'point_type'], 'coffee'],
    'cafe-circle-border',
    ['==', ['get', 'point_type'], 'repairShop'],
    'car-repair-circle-border',
    ['==', ['get', 'point_type'], 'cultural'],
    'cultural-circle-border',
    ['==', ['get', 'point_type'], 'watersource'],
    'drinking-water-circle-border',
    ['==', ['get', 'point_type'], 'fuelStation'],
    'fuel-circle-border',
    ['==', ['get', 'point_type'], 'grocery'],
    'grocery-circle-border',
    ['==', ['get', 'point_type'], 'medical'],
    'hospital-circle-border',
    ['==', ['get', 'point_type'], 'hotspring'],
    'hot-spring-circle-border',
    ['==', ['get', 'point_type'], 'laundromat'],
    'laundry-circle-border',
    ['==', ['get', 'point_type'], 'lodging'],
    'lodging-circle-border',
    ['==', ['get', 'point_type'], 'park'],
    'park-circle-border',
    ['==', ['get', 'point_type'], 'parking'],
    'parking-circle-border',
    ['==', ['get', 'point_type'], 'picnic'],
    'picnic-site-circle-border',
    ['==', ['get', 'point_type'], 'poi'],
    'poi-circle-border',
    ['==', ['get', 'point_type'], 'restaurant'],
    'restaurant-circle-border',
    ['==', ['get', 'point_type'], 'retailStore'],
    'shop-circle-border',
    ['==', ['get', 'point_type'], 'toilet'],
    'toilet-circle-border',
    ['==', ['get', 'point_type'], 'trailhead'],
    'trailhead-circle-border',
    ['==', ['get', 'point_type'], 'trash'],
    'trash-circle-border',
    ['==', ['get', 'point_type'], 'overlook'],
    'viewpoint-circle-border',
    ['==', ['get', 'point_type'], 'wildlife'],
    'wildlife-circle-border',
    ['==', ['get', 'point_type'], 'potentialCampsite'],
    'campsite-potential-border',
    ['==', ['get', 'point_type'], 'campsite'],
    'campsite-confirmed-border',
    'yellow-marker' // default yellow-marker
  ]
},
paint: {
'text-opacity': {
  "stops": [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
    [6, 0],
    [7, 0],
    [8, 0],
    [9, 0],
    [10, 0],
    [10.1, 0],
    [10.2, 0],
    [10.3, 0],
    [10.4, 0],
    [10.5, 0],
    [11, 1]
  ]
},
'text-color': '#2c2c2c',
'text-halo-color': '#f2ede2',
'text-halo-width': 2,
}
});

////////////////////////UPLOAD DATA///////////////////////////////////



});
