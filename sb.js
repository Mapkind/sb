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


