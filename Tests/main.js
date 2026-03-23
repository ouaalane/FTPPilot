import { clsFTPPilotClient } from "../clsFTPilotClient.js";   


const client =  new clsFTPPilotClient("192.168.100.52", 4806, "pc", "280524", false, false);

await client.connect();


client.GetListOfFilesInRemoteDirectory("/device/DCIM/Camera").then(files=>{
    console.log("Files in root directory:", files);
}).catch(err=>{
    console.error("Error getting files in root directory:", err);
});

// client.GetListOfDirectoriesInRemoteDirectory("/device/DCIM/Camera").then(directories=>{
//     console.log("Directories in root directory:", directories);
// }).catch(err=>{
//     console.error("Error getting directories in root directory:", err);
// });


