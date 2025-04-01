import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
let supabase = createClient('https://bmqblboosmqzcfdwnopt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcWJsYm9vc21xemNmZHdub3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDA5NTcsImV4cCI6MjA1NzQ3Njk1N30.vqGikebf3d58yqgMHqvRiF8Dzno89XJpgGfeVZBBSZU')

console.log('Supabase Instance: ', supabase);

const memid = "mem_cm2j78k6s0xg40srphrfpegh2";
const sbkey = "20f78bee-32fd-47bf-8eae-b253cf7cafba";

/*var raw = JSON.stringify({"memID":memid});
// create a JSON object with parameters for API call and store in a variable
var requestOptions = {
    method: 'POST',
    //mode: 'no-cors',
    //headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch('https://hook.us1.make.com/tqixz7mlqvtyohuw7iutf97vofyshven',requestOptions)
.then(response => response.json())
.then(result => memberAuthTemp(result))
.catch(error => console.log('error', error));

function memberAuthTemp(r){
  console.log("Supabase sbkey update result: ",r);
}*/

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



async function getPointFeatures(id){
    const { data, error } = await supabase
    .from('features')
    //.select('geom->geometry->type, ? (@ = fType)')
    .select('geom->geometry, geom->properties, geom->type, geom->source')
    .eq('fType','Point')
    .eq('memid', id)

    var pointCollection = {
      type: 'FeatureCollection',
      features: data
      };
    console.log("Point feature collection: ", pointCollection);
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

      const subFolderForm = document.createElement('form');
      subFolderForm.style.display = 'flex';
      subFolderForm.style.flexDirection = 'row';
      subFolderForm.style.marginLeft = 28;
      subFolderForm.style.marginBottom = 0;

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
  //const name = folderName.value;
  console.log('Folder Name:', subFolderName.value);
  // Handle form data here, e.g., send it to a server

  async function createFolder(){
    var uuid = self.crypto.randomUUID();
    const { data, error } = await supabase
    .from('folders')
    .insert({ memID: memid, name: subFolderName.value, GlobalID: uuid, parent: data[i].GlobalID})
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

}

getFolders();
