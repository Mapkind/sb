import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
let supabase = createClient('https://bmqblboosmqzcfdwnopt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcWJsYm9vc21xemNmZHdub3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDA5NTcsImV4cCI6MjA1NzQ3Njk1N30.vqGikebf3d58yqgMHqvRiF8Dzno89XJpgGfeVZBBSZU')

console.log('Supabase Instance: ', supabase);

const memid = "mem_cm2j78k6s0xg40srphrfpegh2";//me
//const memid = "mem_cm2m3ci470be00rq6bjvb8omc";//rvo
//const memid = "mem_cm6zkxcuh01w50su38oio40jv";//lso
//const memid = "mem_cm7yxqpjj098x0tu60yg22sq4";
const sbkey = "20f78bee-32fd-47bf-8eae-b253cf7cafba";//me
//const sbkey = "974c08ba-2db7-4cd7-9cab-b3598ec3c86d";
//const sbkey = "787a4019-dff2-41a0-9261-4a972516df34";//rvo
//const sbkey = "27777d96-9ab8-483c-b7bd-61bc72c63a07";//lso

var randomid = self.crypto.randomUUID();
console.log("randomid:",randomid);

//////////////////////////////////ADD MAP//////////////////////////////////

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwa2luZCIsImEiOiJjbTQ3MGh1eTcwMGljMnFvc21ubjNqZ2xtIn0.82rbPi7HCJppPKcI6NU-GQ';//defaut token!!!! CHANGE

const mapContainer = document.createElement('div');
mapContainer.setAttribute('id', 'mapContainer');
mapContainer.style.display = "flex";
mapContainer.style.width = '100%';
mapContainer.style.height = 700;
mapContainer.style.alignItems = 'center';
mapContainer.style.marginBottom = 60;
document.body.appendChild(mapContainer);

const mapDiv = document.createElement('div');
mapDiv.setAttribute('id', 'mapDiv');
mapDiv.style.width = '100%';
mapDiv.style.height = 700;
mapContainer.appendChild(mapDiv);

const spinner = document.createElement('img');
spinner.src = 'icons/spinner.svg';
spinner.style.display = "none";
spinner.style.width = "100%";
spinner.style.position = "absolute";
mapContainer.appendChild(spinner);

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
  var raw = JSON.stringify({"memid":memid, "sbkey":sbkey});
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
      //getFeatures(memid);
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
        //getFeatures(memid);
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
    .select('globalid, geometry, properties, type, source')
    .eq('geometry->>type','Point')
    .eq('memid', id)

    pointCollection = {
      type: 'FeatureCollection',
      features: data
      };

    console.log("Point feature collection: ", pointCollection);

    map.getSource('Point_Source').setData(pointCollection);
}

let lineCollection;
async function getLineFeatures(id){
  const { data, error } = await supabase
  .from('features')
  .select('globalid, geometry, properties, type, source')
  .not('geometry->>type', 'eq', 'Point')
  .eq('memid',id)

  lineCollection = {
    type: 'FeatureCollection',
    features: data
    };

  console.log("Line feature collection: ", lineCollection);

  map.getSource('Data_Source').setData(lineCollection);
}

async function getEpisodeFeatures(episode, id){
  const { data, error } = await supabase
  .from('features')
  //.select('globalid, name, ')
  .select(`
    globalid,
    geometry,
    properties,
    memid,
    features_in_episodes!inner (
    ),
    episodes!inner (
      name, globalid
    )
  `)
  .eq('features_in_episodes.episodeid',episode)
  .eq('memid', id)
  console.log("Episode features: ", data);
}

/*,
    episodes!inner (
      globalid
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
    .insert({ memid: memid, globalid: uuid, geom: {
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
          "globalid": "6d5758e6-05a7-4aa2-9f70-db6fef653ba4",
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

map.on('mousemove', function (e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['myPoints','myTracks']
  });
    map.getCanvas().style.cursor = features.length
    ? 'pointer'
    : '';
})

map.on('click', function(e){
  selectFeature(e);
});

let selectedFeatures;

async function selectFeature(coordinates){

  selectedFeatures = map.queryRenderedFeatures(coordinates.point, {
    layers: ['myPoints', 'myTracks']
  });

  console.log("selected feature(s): ",selectedFeatures);


  if(selectedFeatures.length){

    featureName.value = selectedFeatures[0].properties.name;

    if(selectedFeatures[0].source == "Point_Source"){
      featurePointType.value = selectedFeatures[0].properties.point_type;
      featureLineType.value = "";
    }
    else{
      featureLineType.value = selectedFeatures[0].properties.track_type;
      featurePointType.value = "";
    }

          //Clear folder checkboxes

          for (var i = 0; i < folderCheckArray.length; i++) {
            document.getElementById(folderCheckArray[i].id).checked = false;
          }

          //if selected feature is in "features in folders" add check to checkbox

          for (var i = 0; i < featuresinfolders.length; i++) {
            if(featuresinfolders[i].globalid == selectedFeatures[0].properties.GlobalID){
              for (var f = 0; f < featuresinfolders[i].folders.length; f++) {
                var folderid = featuresinfolders[i].folders[f].globalid;
                document.getElementById(folderid).checked = true;
                //addFeatureToFolder(folderid,featuresinfolders[i]);
              }
            }
          }
        
          /*function addFeatureToFolder(id,feature){
            var targetFolderContainer = document.getElementById(id);
            var featureNameDiv = document.createElement('div');
            featureNameDiv.style.display = "flex";
            featureNameDiv.style.marginLeft = 56;
            if(feature.geometry.type == "Point"){
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
          }*/
  }
  else{
    featureName.value = "";
    featurePointType.value = "";
    featureLineType.value = "";
  }
}

const featureMenu = document.createElement('div');
featureMenu.style.position = "absolute";
featureMenu.style.display = "flex";
featureMenu.style.backgroundColor = "white";
featureMenu.style.height = 600;
//featureMenu.style.width = '300px';
featureMenu.style.marginLeft = 10;
//featureMenu.style.marginTop = 40;
//featureMenu.style.marginBottom = 50;
featureMenu.style.paddingLeft = 30;
featureMenu.style.paddingRight = 30;
featureMenu.style.paddingTop = 30;
mapContainer.appendChild(featureMenu);

// Create form
const featureForm = document.createElement('form');
//featureForm.style.height = '700px';
//featureForm.style.width = '300px';
featureForm.style.display = 'flex';
featureForm.style.flexDirection = 'column';

// Create input fields
const featureName = document.createElement('input');
featureName.setAttribute('type', 'text');
featureName.setAttribute('name', 'name');
featureName.setAttribute('placeholder', 'Feature Name');

const featurePointType = document.createElement('input');
featurePointType.setAttribute('type', 'text');
featurePointType.setAttribute('id', 'pointType');
featurePointType.setAttribute('placeholder', 'Point Type');
featurePointType.style.marginTop = 10;

const featureLineType = document.createElement('input');
featureLineType.setAttribute('type', 'text');
featureLineType.setAttribute('id', 'lineType');
featureLineType.setAttribute('placeholder', 'Line Type');
featureLineType.style.marginTop = 10;

/*const featureType = document.createElement('input');
featureType.setAttribute('type', 'text');
featureType.setAttribute('id', 'featureType');
featureType.setAttribute('hidden', true);*/


// Create submit button
const featureSubmitButton = document.createElement('input');
featureSubmitButton.style.marginTop = 20;
featureSubmitButton.setAttribute('type', 'submit');
featureSubmitButton.setAttribute('value', 'Update Feature');

// Add elements to form
featureForm.appendChild(featureName);
//featureForm.appendChild(featureType);
featureForm.appendChild(featurePointType);
featureForm.appendChild(featureLineType);


/*const folderSelectForm = document.createElement('form');
folderSelectForm.style.display = 'flex';
folderSelectForm.style.flexDirection = 'column';*/

const folderSelectContainer = document.createElement('div');
folderSelectContainer.style.display = 'flex';
folderSelectContainer.style.flexDirection = 'column';
folderSelectContainer.style.marginTop = 10;
folderSelectContainer.style.paddingTop = 5;
folderSelectContainer.style.paddingLeft = 5;
folderSelectContainer.style.paddingBottom = 5;
folderSelectContainer.style.border = "1px solid grey";

featureForm.appendChild(folderSelectContainer);

featureForm.appendChild(featureSubmitButton);

// Append form to the document body
featureMenu.appendChild(featureForm);


// Add event listener for form submission
/*featureForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission
  //const name = folderName.value;
  console.log('Feature Name:', featureName.value);
  // Handle form data here, e.g., send it to a server

});*/

featureForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission

  spinner.style.display = "flex";

  const theFeature = selectedFeatures[0];
  async function updateFeature(){
    console.log("Updating theFeature: ",theFeature);
    let updatedProperties;
    if(theFeature.source == "Point_Source"){
      updatedProperties = {
        "GlobalID": theFeature.properties.GlobalID,
        "state": theFeature.properties.state,
        "title": featureName.value,
        "name": featureName.value,
        "notes": theFeature.properties.notes,
        "folder": theFeature.properties.folder,
        "point_type": featurePointType.value,
        "campsiteClass": theFeature.properties.campsiteClass,
        "campsiteLocation": theFeature.properties.campsiteLocation,
        "campsiteFee": theFeature.properties.campsiteFee,
        "archived": theFeature.properties.archived,
        "epicCamp": theFeature.properties.epicCamp,
        "waterside": theFeature.properties.waterside,
        "trailerFriendly": theFeature.properties.trailerFriendly,
        "sheltered": theFeature.properties.sheltered,
        "vehicleCapacity": theFeature.properties.vehicleCapacity,
        "route": theFeature.properties.route,
        "episode": theFeature.properties.episode
      }
    }
    else{
      updatedProperties = {
        "GlobalID": theFeature.properties.GlobalID,
        "title": featureName.value,
        "name": featureName.value,
        "notes": theFeature.properties.notes,
        "track_type": featureLineType.value,
        "distance": theFeature.properties.distance,
        "total_ascent": theFeature.properties.total_ascent,
        "total_descent": theFeature.properties.total_descent,
        "stopped_time": theFeature.properties.stopped_time,
        "total_time": theFeature.properties.total_time,
        "average_speed": theFeature.properties.average_speed,
        "moving_time": theFeature.properties.moving_time,
        "moving_speed": theFeature.properties.moving_speed,
        "folder": theFeature.properties.folder,
        "state": theFeature.properties.state,
        "track_surface": theFeature.properties.track_surface,
        "track_difficulty": theFeature.properties.track_difficulty,
        "vehicle_requirement": theFeature.properties.vehicle_requirement,
        "Shape__Length": theFeature.properties.Shape__Length,
        "archived": theFeature.properties.archived,
        "route": theFeature.properties.route,
        "fullSizeFriendly": theFeature.properties.fullSizeFriendly,
        "trailerFriendlyTrack": theFeature.properties.trailerFriendlyTrack,
        "coordTimes": theFeature.properties.coordTimes,
        "episode": theFeature.properties.episode
      }
    }

    console.log("updatedProperties: ",updatedProperties);

    const { data, error } = await supabase
    .from('features')
    .update({
      udate: new Date().toISOString(),
      properties: updatedProperties
    })
    .eq('globalid', theFeature.properties.GlobalID)
    .eq('memid', memid)
    .select()

    if(!error){
      console.log("Feature updated:", data);
      if(theFeature.source == "Point_Source"){

        const updateFeatureInCollection = pointCollection.features.find(({GlobalID}) => GlobalID===theFeature.properties.GlobalID);
        console.log("updateFeatureInCollection: ", updateFeatureInCollection);

        if(updateFeatureInCollection){
          updateFeatureInCollection.properties = updatedProperties;
          map.getSource('Point_Source').setData(pointCollection);
          spinner.style.display = "none";
        }

      }
      else{
        const updateFeatureInCollection = lineCollection.features.find(({GlobalID}) => GlobalID===theFeature.properties.GlobalID);
        console.log("updateFeatureInCollection: ", updateFeatureInCollection);

        if(updateFeatureInCollection){
          updateFeatureInCollection.properties = updatedProperties;
          map.getSource('Data_Source').setData(lineCollection);
          spinner.style.display = "none";
        }
      }
    }
    else{
      console.log("error: ", error);
    }
  }

  updateFeature(event);

  async function addFeatureToFolder(array){
    const { data, error } = await supabase
    .from('features_in_folders')
    .upsert(array)
    //.eq('globalid', theFeature.properties.globalid)
    //.eq('memid', memid)
    .select()

    if(!error){
      console.log("Feature added to folder:", data);
      refreshFeaturesInFolders();
    }
  }

  async function removeFeatureFromFolder(array){
    const { data, error } = await supabase
    .from('features_in_folders')
    .delete()
    .in('folderid', array)
    //.eq('folderid', theFeature.properties.globalid)
    .eq('featureid', theFeature.properties.GlobalID)
    .eq('memid', memid)
    .select()

    if(!error){
      console.log("Feature removed from folder:", data);
      refreshFeaturesInFolders();
    }
  }

  if(addFeatureToFolderArray.length){
    //loop through array and build submit array
    var addFeatureToFolderSubmitArray = [];
    for (var i = 0; i < addFeatureToFolderArray.length; i++) {
      var json = {memid: memid, folderid: addFeatureToFolderArray[i], featureid: theFeature.properties.GlobalID};
      addFeatureToFolderSubmitArray.push(json)
    }
    console.log("addFeatureToFolderSubmitArray: ",addFeatureToFolderSubmitArray);
    addFeatureToFolder(addFeatureToFolderSubmitArray);
  }
  if(removeFeatureFromFolderArray.length){
    removeFeatureFromFolder(removeFeatureFromFolderArray);
  }

  async function refreshFeaturesInFolders(){
    const { data, error } = await supabase
    .from('features')
    //.select()
    .select(`
      globalid,
      geometry,
      properties,
      memid,
      features_in_folders!inner (
      ),
      folders!inner (
        name, globalid, parent
      )
    `)
    .eq('features_in_folders.memid',memid)
    .eq('memid', memid)
    console.log("Refreshed Features in Folders: ", data);
  
    featuresinfolders = data;
    spinner.style.display = "none";
  }



});

let folders;
let featureFolderCheckChangedArray = [];
let addFeatureToFolderArray = [];
let removeFeatureFromFolderArray = [];
let folderCheckArray = [];

async function getFolders(){
  folderCheckArray = [];
  featureFolderCheckChangedArray = [];
  const { data, error } = await supabase
  .from('folders')
  .select()
  .eq('memid', memid)
  console.log("Folders: ", data);
  folders = data;
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
    while (folderSelectContainer.hasChildNodes()) {
      folderSelectContainer.removeChild(folderSelectContainer.firstChild);
    }


  for (var i = 0; i < data.length; i++) {
    if(!data[i].parent){
      
      /////////////FEATURE SELECT FOLDER MENU//////////////////

      const folderSelect = document.createElement('div');
      folderSelect.style.display = 'flex';
      folderSelect.style.flexDirection = 'column';
      folderSelect.setAttribute("id", data[i].globalid + '_select');

      const folderSelectDiv = document.createElement('div');
      folderSelectDiv.style.display = 'flex';
      folderSelectDiv.style.flexDirection = 'row';

      var folderCheck = document.createElement("input");
      folderCheck.setAttribute("type", "checkbox");
      folderCheck.setAttribute("id", data[i].globalid);
      folderCheckArray.push(folderCheck);

      folderCheck.addEventListener("change", function(){
        console.log("Checkbox clicked: ", this.checked + " | " + this.id);
        var checkID = this.id;
        if(this.checked){
          if(addFeatureToFolderArray.includes(checkID)){
            //feature already exists. skip.
          }
          else{
            addFeatureToFolderArray.push(checkID);
          }
          //If id in "remove from folder" array, remove it
          if(removeFeatureFromFolderArray.includes(checkID)){
            const index = removeFeatureFromFolderArray.indexOf(checkID);
            if (index > -1) { // only splice array when item is found
              removeFeatureFromFolderArray.splice(index, 1); // 2nd parameter means remove one item only
            }
          }
        }
        else{
          if(removeFeatureFromFolderArray.includes(checkID)){
            //feature already exists. skip.
          }
          else{
            removeFeatureFromFolderArray.push(this.id);
          }
          if(addFeatureToFolderArray.includes(checkID)){
            const index = addFeatureToFolderArray.indexOf(checkID);
            if (index > -1) { // only splice array when item is found
              addFeatureToFolderArray.splice(index, 1); // 2nd parameter means remove one item only
            }
          }
        }
        console.log("addFeatureToFolderArray: ",addFeatureToFolderArray);
        console.log("removeFeatureFromFolderArray: ",removeFeatureFromFolderArray);
      })


      folderSelectDiv.appendChild(folderCheck);

      var folderCheckLabel = document.createElement("div");
      folderCheckLabel.innerText = data[i].name;

      folderSelectDiv.appendChild(folderCheckLabel);

      folderSelect.appendChild(folderSelectDiv);

      folderSelectContainer.appendChild(folderSelect);

      ///////////CREATE FOLDER MENU//////////////
      var folderContainer = document.createElement('div');
      folderContainer.style.flexDirection = 'column';
      folderContainer.setAttribute('id', data[i].globalid + '_create');

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

      /*const subFolderForm = document.createElement('form');
      subFolderForm.style.display = 'flex';
      subFolderForm.style.flexDirection = 'row';
      subFolderForm.style.marginLeft = 28;
      subFolderForm.style.marginBottom = 0;
      subFolderForm.setAttribute('id', data[i].globalid);

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
      subFolderForm.appendChild(submitButton2);*/
      //folderForm.appendChild(submitButtonImage);

      // Append form to the document body
      //document.body.appendChild(subFolderForm);

      // Add event listener for form submission
      /*subFolderForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        console.log("Parent ID: ",event.target.id);
        //const name = folderName.value;
        console.log('Folder Name:', subFolderName.value);
        // Handle form data here, e.g., send it to a server

        async function createSubFolder(){
          var uuid = self.crypto.randomUUID();
          const { data, error } = await supabase
          .from('folders')
          .insert({ memid: memid, name: subFolderName.value, globalid: uuid, parent: event.target.id})
          .select(`
            name,
            globalid,
            memid
          `)
          .eq('memid', memid)
        
        if(!error){
          console.log("Folder created:", data);
          getFolders();
        }
        else{
          console.log("error: ", error);
        }
        }

        createSubFolder();

      });*/
      
      folderContainer.appendChild(folder);
      //folderContainer.appendChild(subFolderForm);
      folderList.appendChild(folderContainer);

    }
  }

  for (var i = 0; i < data.length; i++) {
    if(data[i].parent){
      var parentCreateFolder = document.getElementById(data[i].parent + '_create');
      var parentSelectFolder = document.getElementById(data[i].parent + '_select');

      const subFolderSelect = document.createElement('div');
      subFolderSelect.style.display = 'flex';
      subFolderSelect.style.flexDirection = 'column';
      subFolderSelect.style.marginLeft= '16px';
      subFolderSelect.setAttribute("id", data[i].globalid + '_select');

      const subFolderSelectDiv = document.createElement('div');
      subFolderSelectDiv.style.display = 'flex';
      subFolderSelectDiv.style.flexDirection = 'row';

      var subFolderCheck = document.createElement("input");
      subFolderCheck.setAttribute("type", "checkbox");
      subFolderCheck.setAttribute("id", data[i].globalid);
      folderCheckArray.push(subFolderCheck);

      subFolderCheck.addEventListener("change", function(){
        console.log("Checkbox clicked: ", this.checked + " | " + this.id);

        var checkID = this.id;
        if(this.checked){
          if(addFeatureToFolderArray.includes(checkID)){
            //feature already exists. skip.
          }
          else{
            addFeatureToFolderArray.push(checkID);
          }
          //If id in "remove from folder" array, remove it
          if(removeFeatureFromFolderArray.includes(checkID)){
            const index = removeFeatureFromFolderArray.indexOf(checkID);
            if (index > -1) { // only splice array when item is found
              removeFeatureFromFolderArray.splice(index, 1); // 2nd parameter means remove one item only
            }
          }
        }
        else{
          if(removeFeatureFromFolderArray.includes(checkID)){
            //feature already exists. skip.
          }
          else{
            removeFeatureFromFolderArray.push(this.id);
          }
          if(addFeatureToFolderArray.includes(checkID)){
            const index = addFeatureToFolderArray.indexOf(checkID);
            if (index > -1) { // only splice array when item is found
              addFeatureToFolderArray.splice(index, 1); // 2nd parameter means remove one item only
            }
          }
        }
        console.log("addFeatureToFolderArray: ",addFeatureToFolderArray);
        console.log("removeFeatureFromFolderArray: ",removeFeatureFromFolderArray);
      })

      subFolderSelectDiv.appendChild(subFolderCheck);

      var subFolderCheckLabel = document.createElement("div");
      subFolderCheckLabel.innerText = data[i].name;

      subFolderSelectDiv.appendChild(subFolderCheckLabel);

      subFolderSelect.appendChild(subFolderSelectDiv);

      parentSelectFolder.appendChild(subFolderSelect);

      var subFolderContainer = document.createElement('div');
      subFolderContainer.setAttribute('id', data[i].globalid + '_create');
      
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
      parentCreateFolder.appendChild(subFolderContainer);
    }
  }

  console.log("folderCheckArray: ",folderCheckArray);

  getFeaturesInFolders();

}

getFolders();

async function createEpisode(){
  var uuid = self.crypto.randomUUID();
  const { data, error } = await supabase
  .from('episodes')
  .insert({ memid: memid, name: 'S1E3', globalid: uuid})
  .select(`
    name,
    globalid,
    memid
  `)
  .eq('memid', memid)

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
    .insert({ memid: memid, name: folderName.value, globalid: uuid})
    .select(`
      name,
      globalid,
      memid
    `)
    .eq('memid', memid)
  
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


let featuresinfolders;
async function getFeaturesInFolders(){
  const { data, error } = await supabase
  .from('features')
  //.select()
  .select(`
    globalid,
    geometry,
    properties,
    memid,
    features_in_folders!inner (
    ),
    folders!inner (
      name, globalid, parent
    )
  `)
  .eq('features_in_folders.memid',memid)
  .eq('memid', memid)
  console.log("Features in Folders: ", data);

  featuresinfolders = data;

  //Add features to folders

  for (var i = 0; i < featuresinfolders.length; i++) {
    if(featuresinfolders[i].folders.length > 1){
      //loop over folders
      for (var f = 0; f < featuresinfolders[i].folders.length; f++) {
        var folderid = featuresinfolders[i].folders[f].globalid;
        var parentid = featuresinfolders[i].folders[f].parent;
        populateFeatureInFolder(folderid,featuresinfolders[i],parentid);
      }
    }
    else{
      var folderid = featuresinfolders[i].folders[0].globalid;
      var parentid = featuresinfolders[i].folders[0].parent;
      populateFeatureInFolder(folderid,featuresinfolders[i]);
    }
  }

  async function populateFeatureInFolder(id,feature,parent){
    var targetFolderContainer = document.getElementById(id + "_create");
    var featureNameDiv = document.createElement('div');
    featureNameDiv.style.display = "flex";
    if(parent){
      featureNameDiv.style.marginLeft = 56;
    }
    else{
      featureNameDiv.style.marginLeft = 28;
    }
    
    if(feature.geometry.type == "Point"){
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
    featureNameText.innerText = feature.properties.name;

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

map.addSource("Data_Source", {
  type: "geojson",
  data: '',
  generateId: true,
});

map.addLayer({
  id: "myTracksBG",
  type: "line",
  minzoom: 3,
  source: "Data_Source",
  filter: ["all", ["!=", "$type", "Point"], ["!=", "$type", "Polygon"], ['!=', 'archived', 'yes']],
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
    },
    'paint': {
      'line-color': [
        'case',
        ['==', ['get', 'track_type'], 'offroad'],
        'black',
        ['==', ['get', 'track_type'], 'scenicDrive'],
        'black',
        ['==', ['get', 'track_type'], ''],
        'black',
        'white'
      ],
      'line-width': 6,
      'line-opacity': 1
    }
},
//firstSymbolId
);

map.addLayer({
  id: "myTracksFG",
  type: "line",
  minzoom: 3,
  source: "Data_Source",
  filter: ["all", ["!=", "$type", "Point"], ["!=", "$type", "Polygon"], ['!=', 'archived', 'yes']],
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
    },
    'paint': {
      //'line-color': 'white',
      'line-width': 3,
      'line-opacity': 1,
      "line-color": [
        'case',
        ['==', ['get', 'track_type'], 'offroad'],
        'white',
        ['==', ['get', 'track_type'], 'connector'],
        'black',
        ['==', ['get', 'track_type'], 'scenicDrive'],
        'gray',
        ['==', ['get', 'track_type'], 'hiking'],
        'red',
        ['==', ['get', 'track_type'], 'boat'],
        'blue',
        ['==', ['get', 'track_type'], 'atvutv'],
        'purple',
        ['==', ['get', 'track_type'], 'horse'],
        'brown',
        ['==', ['get', 'track_type'], 'biking'],
        'green',
        ['==', ['get', 'track_type'], 'motorcycle'],
        'black',
        '#ebef61' // default yellow
      ],
      "line-dasharray": [
        "match", ["get", "track_type"],
        'hiking', ["literal", [0.2, 2]],
        'atvutv', ["literal", [0.2, 2]],
        'motorcycle', ["literal", [0.2, 2]],
        ["literal", [1,0]]
      ]
    }
},
//firstSymbolId
);

map.addLayer({
id: "myTracks",
type: "line",
minzoom: 3,
source: "Data_Source",
filter: ["all", ["!=", "$type", "Point"], ["!=", "$type", "Polygon"], ['!=', 'archived', 'yes']],
layout: {
'line-join': 'round',
'line-cap': 'round'
},
'paint': {
  'line-color': 'white',
  'line-width': 8,
  'line-opacity': .01
}
},
//firstSymbolId
);

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

let inputFile = document.getElementById("input_file");

let pointPropertyArray = ['name','point_type','vehicleCapacity','sheltered','waterside','epicCamp','campsiteFee','campsiteLocation','campsiteClass','notes','title','state','globalid','OBJECTID','video_episode','video_episode2','video_episode3','archived','route','trailerFriendly'];
//console.log("pointPorpertyArray: ",pointPropertyArray);

let linePropertyArray = ['name','track_type','track_difficulty','track_surface','vehicle_requirement','coordTimes','time_stamp','fullSizeFriendly','notes','title','state','globalid','OBJECTID','video_episode','video_episode2','video_episode3','archived','route','trailerFriendlyTrack'];
//console.log("linePropertyArray: ",linePropertyArray);

inputFile.addEventListener("change", function(ev) {
  //console.log("A file has been added!");

  var theName = ev.target.value.toLowerCase();
  //console.log('theName: ', theName);

  let extension = theName.substring(theName.lastIndexOf('.') + 1);
  console.log("extension: ", extension);

  let fileName = theName.split(".");
  fileName = fileName[0].replace("c:\\fakepath\\", "");
  //console.log('File name: ', fileName);

  

  let file = inputFile.files[0];

  console.log("File: ",file);

  var imageReader = new FileReader();

  console.log("imageReader: ",imageReader);

  //image turned to base64-encoded Data URI.
  //let dataURL = imageReader.readAsDataURL(file);
  //console.log("dataURL: ", dataURL);
  imageReader.name = file.name;//get the image's name
  imageReader.size = file.size; //get the image's size
  let fileType;
  fileType = file.type;

  console.log("fileType: ",fileType);

  if(fileType == 'image/png' || fileType == 'image/jpeg'){
      //Geocode image
  }
  else{

    console.log("Not an IMAGE");
    
      let reader = new FileReader();
      
      reader.readAsText(file);

      reader.onload = function() {

        let readerResult = reader.result;
        console.log("Reader result: ",readerResult);

        var geojsonFile = JSON.parse(readerResult);
        console.log("geojsonFile: ",geojsonFile);

        let uploadArray = [];

        for (var i = 0; i < geojsonFile.features.length; i++) {

          var theFeature = geojsonFile.features[i];

          var theSource;
          if(theFeature.geometry.type == 'Point'){
            theSource = "Point_Source";
          }
          else{
            theSource = "Data_Source";
          }

          var uuid = self.crypto.randomUUID();

          if(!theFeature.properties.archived){
            theFeature.properties.archived = "";
          }
          let featureGlobalID;
          if(theFeature.properties.GlobalID){
            featureGlobalID = theFeature.properties.GlobalID;
          }
          else{
            featureGlobalID = uuid;
          }

          var feature = {memid: memid, source: theSource, globalid: featureGlobalID, properties: theFeature.properties,  geometry: theFeature.geometry, archived: theFeature.properties.archived};

          uploadArray.push(feature);

        }

        async function uploadFeatures(array){

          const { data, error } = await supabase
          .from('features')
          .insert(array)
          //.select()
      
        if(!error){
          console.log("Features created:", data);
          getPointFeatures(memid);
          getLineFeatures(memid);
          //getFeatures();
        }
        else{
          console.log("error: ", error);
        }
      }
      
      console.log("uploadArray: ", uploadArray);
      uploadFeatures(uploadArray);

      }

  }
});

});


//////////////////////////////////////////////////////////////////

const folderDropdownDiv = document.createElement('div');
folderDropdownDiv.style.marginBottom = 60;
document.body.appendChild(folderDropdownDiv);

folderDropdownDiv.appendChild(document.getElementById("folderMultiselect"));

const multiselectContainer = document.querySelector('.multiselect-container');
const selectedOptions = document.querySelector('.selected-options');
const dropdown = document.querySelector('.dropdown');
const options = document.querySelectorAll('.option input[type="checkbox"]');
const selectedList = document.querySelector('.selected-list');
const placeholder = document.querySelector('.placeholder');

selectedOptions.addEventListener('click', () => {
 dropdown.classList.toggle('open');
});

options.forEach(option => {
 option.addEventListener('change', () => {
 updateSelectedList();
 });
});

function updateSelectedList() {
 selectedList.innerHTML = '';
 let selectedCount = 0;

 options.forEach(option => {
 if (option.checked) {
 const listItem = document.createElement('li');
 listItem.textContent = document.querySelector(`label[for="${option.id}"]`).textContent;
 selectedList.appendChild(listItem);
 selectedCount++;
 }
 });

 if (selectedCount > 0) {
 placeholder.style.display = 'none';
 } else {
 placeholder.style.display = 'block';
 }
}

document.addEventListener('click', (event) => {
 if (!multiselectContainer.contains(event.target)) {
 dropdown.classList.remove('open');
 }
});