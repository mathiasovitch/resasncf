var _ = require('underscore');
var fs = require('fs');
var requestsetup = 'sncf_config_';

// common setup file
var basesetup = 'sncf_baserequest.json';
try {
	var stats = fs.statSync(basesetup);
} catch (e) {
	console.log('Erreur:' + basesetup + ' not found');
	return ;
}

var base = fs.readFileSync('sncf_baserequest.json', 'UTF8');
var i = 0;

// trip setup file
console.log('Loading setup files...');
while (true) {
	i++;
	var filename = requestsetup + i + '.json';
	try {
		var stats = fs.statSync(filename);
	} catch (e) {
		console.log('End loading setup files.');
		return ;
	}
	var setup = fs.readFileSync(filename, 'UTF8');
	
	var userSetup = JSON.parse(setup);
	if (userSetup.conf.active == 1) {
		// merge setup files
		console.log('#' + i + ' : ' + filename);
		query = _.extend( JSON.parse(base), userSetup.sncf);
		doRequest(query, userSetup.conf, i)
	}
}

function doRequest(query, conf, index) {
	var request = require('request');
	request.debug = false;
	request({
		// HTTP Archive Request Object
		har: {
		  url: 'http://proposition.voyages-sncf.com/rest/search-travels/outward',
		  method: 'POST',
		  postData: {
			"mimeType": "application/json;charset=utf-8",
			"text": JSON.stringify(query)
		  }
		}
	  }, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		doParseResponse(body, conf, index);
	  }  else {	  
		// TODO notify error
		console.log('error'+error);
	  }
	})
}

function doParseResponse(response, conf, index) {
	trips = response.results;
	var hasPrice = false;
	for (var i =0 ; i< trips.length ; i++) {
		trip = trips[i];
		//console.log(trip);
		transporter = trip.transporters;
		// transporter train : TGV, iDTGV, ICE, TER, EUROSTAR, OUIGO, THALYS, IZY, TGV 100% Prem's, INTERCITÉS DE NUIT, INTERCITÉS, TGV Lyria, TGV Lyria Mini, EuroNight Train, Railjet)
		// transporter bus : Autocar, OUIBUS)
		//console.log(transporter)
		// WARNING ne gère pas les voyages avec correspondances
		if (conf.transporters == 'ANY' || _.contains(conf.transporters, transporter.toString())) {				
			if (!_.isEmpty(trip.priceProposals)) {
				hasPrice = true;
			}
		} 
		//else {
		//	console.log('#' + index + 'Transporteur ignoré : '+ transporter );
		//}
	}
	if (hasPrice) {
		// price found for trip
		onPriceFound(index);
	} else {
		// no price found for trip
		console.log( '#' + index + ' : No price');
	}
}

function onPriceFound(index) {
	var filename = requestsetup + index + '.json';
	var fs = require('fs');
	var setupFs = fs.readFileSync(filename, 'UTF8');
	setup = JSON.parse(setupFs);
	setup.conf.active = 0; // disable this trip
	fs.writeFileSync(filename, JSON.stringify(setup));
	var moment = require('moment');
	var datefr = moment(setup.sncf.departureDate, "YYYY-MM-DD").locale('fr').format('LL');
	console.log("Ouverture réservation " + datefr + " : " + setup.sncf.origin +"->" + setup.sncf.destination);
	// notify the way you like...
}