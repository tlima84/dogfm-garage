import {database} from './config'
import mysql from 'mysql';

const pool = mysql.createPool(database);

let ESX = null;
setTick(() => {
    while (ESX === null || ESX === undefined){
        emit('esx:getSharedObject', (obj)=> {
            ESX = obj;
        });
    }
})
//for private garages
onNet('dogfm:checkGaragePermission', (garage, playerIdentifier, playerServerId) => {

    let sql = "select * from owned_properties where owner = ? AND garage = ?";

    pool.getConnection(function(err, connection) {
        if (err) throw err;        
        connection.query(sql, [playerIdentifier, garage.name], function (error, results, fields) {
            if (error) throw error;

            connection.release();
            if(results.length > 0){
                setImmediate(() => { 
                    emitNet("dogfm:allowedToEnter", playerServerId, garage);
                });
            }
        });
    });
});

onNet('dogfm:loadOwnedCars', (garage, playerIdentifier, playerServerId) => {

    console.log("loadOwnedCars");
    let sql = "SELECT * FROM `owned_vehicles` WHERE `owner` = ? AND `stored` = 1";

    pool.getConnection(function(err, connection) {
        if (err) throw err;        
        connection.query(sql, [playerIdentifier], function (error, results, fields) {
            if (error) throw error;

            connection.release();
            console.log(results);
            setImmediate(() => { 
                emitNet("dogfm:loadGarage", playerServerId, garage, results);
            });
        });
    });
});

onNet('dogfm-garage:storeVehicle', (vehicleProps, plate) => {
    console.log("dogfm-garage:storeVehicle")
    let sql = 'UPDATE `owned_vehicles` SET `stored`= 1, `vehicle`=? WHERE `plate` = ?';
    pool.getConnection(function(err, connection) {
        if (err) throw err;        
        connection.query(sql, [JSON.stringify(vehicleProps), plate], function (error, results, fields) {
            console.log(results);
            if (error) throw error;
            connection.release();
        });
    });
});

onNet('dogfm-garage:unloadVehicle', (plate) => {
  
    let sql = "UPDATE `owned_vehicles` SET `stored`= 0 WHERE `plate` = ?";
    pool.getConnection(function(err, connection) {
        if (err) throw err;        
        connection.query(sql, [plate], function (error, results, fields) {
            console.log(results);
            if (error) throw error;
            connection.release();
        });
    });
});
