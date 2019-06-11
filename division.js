module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getLeagues(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM league", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.leagues  = results;
            complete();
        });
    }

    function getDivisions(res, mysql, context, complete){
        mysql.pool.query("SELECT division.id as id, league.name as league, region FROM division LEFT JOIN league ON league_id = league.id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.divisions = results;
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        //context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getDivisions(res, mysql, context, complete);
        getLeagues(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('division', context);
            }

        }
    });
    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        //console.log(req.body.homeworld)
        //console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO division (league_id, region) VALUES (?,?)";
        var inserts = [req.body.league, req.body.region];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/division');
            }
        });
    });


    return router;
}();