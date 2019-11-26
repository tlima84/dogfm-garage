let garages = [];
let ESX = null;
setTick(() => {
    while (ESX === null || ESX === undefined){
        emit('esx:getSharedObject', (obj)=> {
            ESX = obj;
        });
    }
});

emit('instance:registerType', 'garage');

on('instance:onCreate', (instance) => {
    if(instance.type === 'garage'){
        emit('instance:enter', instance);
    }
});

on('dogfm-garage:enterGarage', (garage)=>{
    let xPlayer = ESX.GetPlayerData();
    let playerServerId = GetPlayerServerId(PlayerId());
    emitNet('dogfm:checkGaragePermission', garage, xPlayer.identifier, playerServerId);
});

onNet('dogfm:allowedToEnter', (garage) => {

    let xPlayer = ESX.GetPlayerData();
    let playerServerId = GetPlayerServerId(PlayerId());
    emitNet('dogfm:loadOwnedCars', garage, xPlayer.identifier, playerServerId);

});

onNet("dogfm:loadGarage", (garage, cars) => {

    let playerPed = PlayerPedId();
    let spawnCoords = {
        x : garage.interiorSpawnPoint.pos.x,
        y : garage.interiorSpawnPoint.pos.y,
        z : garage.interiorSpawnPoint.pos.z + 0.5
    };
    
    if(IsPedInAnyVehicle(playerPed,  false)){
        let vehicle = GetVehiclePedIsIn(playerPed,  false);
        let vehicleProps = ESX.Game.GetVehicleProperties(vehicle);
        
        ESX.Game.DeleteVehicle(vehicle);

        ESX.Game.Teleport(playerPed, spawnCoords, () => {

            ESX.Game.SpawnLocalVehicle(vehicleProps.model, spawnCoords, garage.interiorSpawnPoint.heading, (vehicle) =>{
                TaskWarpPedIntoVehicle(playerPed,  vehicle,  -1);
                ESX.Game.SetVehicleProperties(vehicle, vehicleProps);
            });
        
            spawnOwnedCars(garage,cars);

        });
    }else{
        ESX.Game.Teleport(playerPed, spawnCoords, () => {
            spawnOwnedCars(garage,cars);
        });
    }

    
});

on('dogfm-garage:exitGarage', (garage) => {

    let playerPed = PlayerPedId();
    let spawnCoords = {
        x : garage.exteriorSpawnPoint.pos.x,
        y : garage.exteriorSpawnPoint.pos.y,
        z : garage.exteriorSpawnPoint.pos.z
    };

    if(IsPedInAnyVehicle(playerPed,  false)){
        let vehicle = GetVehiclePedIsIn(playerPed,  false);
        let vehicleProps = ESX.Game.GetVehicleProperties(vehicle);
        ESX.Game.DeleteVehicle(vehicle);

        ESX.Game.Teleport(playerPed, spawnCoords, () => {
            
            ESX.Game.SpawnVehicle(vehicleProps.model, spawnCoords, garage.exteriorSpawnPoint.heading, (vehicle) =>{
                TaskWarpPedIntoVehicle(playerPed,  vehicle,  -1);
                ESX.Game.SetVehicleProperties(vehicle, vehicleProps);
            });
          
            emitNet('dogfm-garage:unloadVehicle', vehicleProps.plate);
            clearGarage(garage);
        });
    }else{

        ESX.Game.Teleport(playerPed, spawnCoords, ()=>{
           clearGarage(garage);
        });
    }
});

on('dogfm-garage:clientStoreVehicle', () => {
    console.log("dogfm-garage:clientStoreVehicle");
    let playerPed = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(playerPed,  false);
    let vehicleProps = ESX.Game.GetVehicleProperties(vehicle);
    emitNet('dogfm-garage:storeVehicle', vehicleProps, vehicleProps.plate);
    ESX.Game.DeleteVehicle(vehicle);
    
});
	
function spawnOwnedCars(garage, cars){
    let garagePos = 0;
    
            cars.forEach(car => {
                
                let parkX = garage.parkings[garagePos].pos.x;
                let parkY = garage.parkings[garagePos].pos.y;
                let parkZ = garage.parkings[garagePos].pos.z;
                parkZ = parkZ + 0.05;
    
                let vehicleProps = JSON.parse(car.vehicle);
    
                //spawnVehicle(vehicleProps.model, parkX, parkY, parkZ)
                
                ESX.Game.SpawnVehicle(vehicleProps.model, {
                    x : parkX,
                    y : parkY,
                    z : parkZ
                }, garage.parkings[garagePos].heading, (vehicle) => {
                    ESX.Game.SetVehicleProperties(vehicle, vehicleProps);
                    SetVehicleNumberPlateText(vehicle, car.plate);
                });
                
                garagePos++;
            });
}

function clearGarage(garage){
    garage.parkings.forEach(park => {
        let vehicle = GetClosestVehicle(park.pos.x,  park.pos.y,  park.pos.z,  2.0,  0,  71);
        console.log("vehicle to be erased");
        console.log(vehicle);
        ESX.Game.DeleteVehicle(vehicle);
    });
}