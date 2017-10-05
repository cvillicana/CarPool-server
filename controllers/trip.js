var Trip = require('../models/trip');
var User = require('../models/user');

exports.create = function(req, res, next){

    var email = req.user._doc.email;

    if(!email){
        return res.status(422).send({error: 'Not a valid token'});
    }

    User.findOne({email:email}, function(err, user){

        if(err){
          return next(err);
        }

        if(user){

            var trip = new Trip({
              start : req.body.start,
              end : req.body.end,
              distance : req.body.distance,
              options : req.body.options,
              user : user
            });

            trip.save(function(err, tripSaved){

                if(err){
                     return next(err);
                }

                res.status(201).json({
                  message: "TRIP SAVED"
                });
            });

        }
    });

}

exports.myActiveTrips = function(req, res, next){

    var _id = req.user.id;

    if(!_id){
        return res.status(422).send({error: 'Not a valid token'});
    }

    function callback(err, trips){

        if(err){
            return next(err);
        }

        if(trips){
            res.status(201).json({
              trips:trips
            });
        }
    }

    Trip.find(
      {
          $or: [
              {'user._id':_id, finished:false},
              {passengers: { $elemMatch: {_id:_id} }}
          ]
      }).
      select('start end passengers options distance').
      exec(callback);


}

exports.nearTrips = function(req, res, next){

    var lat = parseFloat(req.body.lat);
    var lng = parseFloat(req.body.lng);

    var point = { type : "Point", coordinates : [lng,lat] };

    Trip.db.db.command({ geoNear : "trips",
        near : point,
        maxDistance: 50000,
        distanceMultiplier: 0.001,
        spherical : true,
        limit : 10}, function(err, results) {

            if(err){
                return next(err);
            }

            if(results){
                res.status(201).json({
                  trips:results.results
                });
            }


    });

}