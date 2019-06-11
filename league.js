module.exports = function(){
    var express = require('express');
    var router = express.Router();


    function getLeagues(res, mysql, context, complete){
        mysql.pool.query("SELECT league.id as id, name, dh FROM league", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.leagues = results;
            complete();
        });
    }


    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        //context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getPlayers(res, mysql, context, complete);
        getTeams(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('league', context);
            }

        }
    });


    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        //console.log(req.body.homeworld)
        //console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO league (id, name, dh) VALUES (?,?,?)";
        var inserts = [req.body.name, req.body.dh];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/league');
            }
        });
    });