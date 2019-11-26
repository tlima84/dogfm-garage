import garagesJson from './garages'; 

const DRAW_DISTANCE = 100.0;
const MARKER_TYPE = 36;
const PARKING_MARKER_TYPE = 1;
const MARKER_SIZE = {x : 1.0, y : 1.0, z :1.0};
const MARKER_COLOR = {r : 255, g : 0, b : 0};
const PARKING_MARKER_SIZE = {x : 3.0, y : 3.0, z : 2.0};
const PARKING_MARKER_COLOR = {r : 102, g : 102, b : 204};
const NOTIFY_DISTANCE = 2.9;
const STORE_DISTANCE = 2.0;


let ESX = null;
setTick(() => {
    while (ESX === null || ESX === undefined){
        emit('esx:getSharedObject', (obj)=> {
            ESX = obj;
        });
    }
});

//create blips for public garages on map

/*
setTick(()=> {
    garagesJson.garages.forEach(garage => {
       if(garage.isClosed){
           let blip = AddBlipForCoord(garage.exteriorEntryPoint.pos.x, garage.exteriorEntryPoint.pos.y, garage.exteriorEntryPoint.pos.z);

           SetBlipSprite(blip, 357);
           SetBlipDisplay(blip, 4);
           SetBlipScale(blip, 0.5);
           SetBlipColour(blip, 3);
           SetBlipAsShortRange(blip, true);
           BeginTextCommandSetBlipName("STRING");
           AddTextComponentString("Garage");
           EndTextCommandSetBlipName(blip);
       }
   });
});
*/


//Draw markers and in/out notifications
setTick(() =>{
    let playerPed = PlayerPedId();
    let coords    = GetEntityCoords(playerPed);

    garagesJson.garages.forEach(garage => {

       
        if(garage.isClosed){

            if(!garage.disabled && GetDistanceBetweenCoords(coords[0],coords[1],coords[2], garage.exteriorEntryPoint.pos.x, garage.exteriorEntryPoint.pos.y, garage.exteriorEntryPoint.pos.z, true) < DRAW_DISTANCE){
                
                DrawMarker(MARKER_TYPE, garage.exteriorEntryPoint.pos.x, garage.exteriorEntryPoint.pos.y, garage.exteriorEntryPoint.pos.z, 0.0, 0.0, 0.0, 0, 0.0, 0.0, MARKER_SIZE.x, MARKER_SIZE.y, MARKER_SIZE.z, MARKER_COLOR.r,MARKER_COLOR.g, MARKER_COLOR.b, 100, false, true, 2, false, false, false, false);
                
                if(GetDistanceBetweenCoords(coords[0],coords[1],coords[2], garage.exteriorEntryPoint.pos.x, garage.exteriorEntryPoint.pos.y, garage.exteriorEntryPoint.pos.z,true) < NOTIFY_DISTANCE){
                    drawText("Press E to enter", garage.exteriorEntryPoint.pos.x + 1, garage.exteriorEntryPoint.pos.y-0.5, garage.exteriorEntryPoint.pos.z+1);
                    if(IsControlJustReleased(1, 38)){
                        emit('dogfm-garage:enterGarage', garage);
                    }
                }
            }

            if(!garage.disabled && GetDistanceBetweenCoords(coords[0],coords[1],coords[2], garage.interiorExitPoint.pos.x, garage.interiorExitPoint.pos.y, garage.interiorExitPoint.pos.z, true) < DRAW_DISTANCE){
                DrawMarker(MARKER_TYPE, garage.interiorExitPoint.pos.x, garage.interiorExitPoint.pos.y, garage.interiorExitPoint.pos.z,0.0, 0.0, 0.0, 0, 0.0, 0.0, MARKER_SIZE.x, MARKER_SIZE.y, MARKER_SIZE.z, MARKER_COLOR.r,MARKER_COLOR.g, MARKER_COLOR.b, 100, false, true, 2, false, false, false, false);
                if(GetDistanceBetweenCoords(coords[0],coords[1],coords[2], garage.interiorExitPoint.pos.x, garage.interiorExitPoint.pos.y, garage.interiorExitPoint.pos.z, true) < NOTIFY_DISTANCE){
                    drawText("Press E to exit", garage.interiorExitPoint.pos.x + 1, garage.interiorExitPoint.pos.y-0.5, garage.interiorExitPoint.pos.z+1);
                    
                    if(IsControlJustReleased(1, 38)){
                        emit('dogfm-garage:exitGarage', garage);
                    }
                }
            }
        }
        if (IsPedInAnyVehicle(playerPed, false)) {
            garage.parkings.forEach(parking => {
                if(!garage.disabled && GetDistanceBetweenCoords(coords[0],coords[1],coords[2], parking.pos.x, parking.pos.y, parking.pos.z, true) < DRAW_DISTANCE) {
                        DrawMarker(PARKING_MARKER_TYPE, parking.pos.x, parking.pos.y, parking.pos.z, 0.0, 0.0, 0.0, 0, 0.0, 0.0,PARKING_MARKER_SIZE.x, PARKING_MARKER_SIZE.y, PARKING_MARKER_SIZE.z, PARKING_MARKER_COLOR.r,PARKING_MARKER_COLOR.g, PARKING_MARKER_COLOR.b, 100, false, true, 2, false, false, false, false);
                        
                        if(GetDistanceBetweenCoords(coords[0],coords[1],coords[2], parking.pos.x, parking.pos.y, parking.pos.z, true) < STORE_DISTANCE){
                            
                            drawText("Press E to store vehicle", parking.pos.x -1 , parking.pos.y-0.5, parking.pos.z+1);
                            
                            if(IsControlJustReleased(1, 38)){
                                emit('dogfm-garage:clientStoreVehicle');
                            }
                        }
                }
            });
        }
    });
});

function drawText(text, x, y, z){
    let arrayPosWorld = World3dToScreen2d(x,y,z);
    let _x = arrayPosWorld[1];
    let _y = arrayPosWorld[2];

    SetTextFont(0);
	SetTextProportional(0);
	SetTextScale(0.4, 0.4);
	SetTextColour(255, 255, 255, 255);
	SetTextEntry("STRING");
	AddTextComponentString(text);
    DrawText(_x,_y);
}
