import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
let supabase = createClient('https://bmqblboosmqzcfdwnopt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcWJsYm9vc21xemNmZHdub3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDA5NTcsImV4cCI6MjA1NzQ3Njk1N30.vqGikebf3d58yqgMHqvRiF8Dzno89XJpgGfeVZBBSZU')

console.log('Supabase Instance: ', supabase);

async function getMembers(){
    const { data, error } = await supabase
    .from('members')
    .select()
  
    console.log("members: ", data);
}

async function getFeatures(id){
    const { data, error } = await supabase
    .from('features')
    .select()
    //.not('globalid', 'eq', '111-111-111')
    .eq('memid', id)
    console.log("features: ", data);
}

async function getPointFeatures(){
    const { data, error } = await supabase
    .from('features')
    //.select('geom->geometry->type, ? (@ = fType)')
    .select()
    //.not('globalid', 'eq', '111-111-111')
    .eq('fType','Point')
    console.log("Point features: ", data);
}

async function getLineFeatures(){
  const { data, error } = await supabase
  .from('features')
  .select()
  .not('fType', 'eq', 'Point')
  //.eq('fType','Point')
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
var memid = "mem_1";
getFeatures(memid);
getPointFeatures();
getLineFeatures();

var theEpisode = "aaa-aaa-aaa";
getEpisodeFeatures(theEpisode,memid);


async function createFeature(){
    var uuid = self.crypto.randomUUID();
    const { data, error } = await supabase
  .from('features')
  .insert({ memid: 'mem_1', name: 'Pippin Place', globalid: uuid,  geom: {
    "type": "Feature",
    "properties": {
        "name": "Bear Sighting",
        "desc": "This was our 5th bear sighting during our 2022 trip to CO.",
        "time": "2022-10-04T11:40:50Z",
        "sym": "bear",
        "point_type": "wildlife",
        "vehicleCapacity": "",
        "sheltered": "",
        "waterside": "",
        "epicCamp": "",
        "campsiteFee": "",
        "campsiteLocation": "",
        "campsiteClass": "",
        "notes": "This was our 5th bear sighting during our 2022 trip to CO.",
        "title": "Bear Sighting",
        "state": "",
        "GlobalID": "6d5758e6-05a7-4aa2-9f70-db6fef653ba4",
        "OBJECTID": "",
        "video_episode": "",
        "video_episode2": "",
        "video_episode3": "",
        "archived": "yes",
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


