var mongoose = require('mongoose');
var models = require('models');
var _ = require('underscore');
var async = require('async');

var wardList = [
    36,18,31,30,15,8,5,2,1,39,26,27,24,14,47,3,4,6,7,9,
    10,11,12,13,16,17,19,20,
    21,22,23,25,28,29,32,33,
    34,35,37,38,40,41,42,43,44,45,46,48,
    49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66
  ];


function assignColorToProp(prop){
	_.each(prop.permits, function(permit) {
    if (permit) {
      if (
				(permit['application_type'] == 'ZP_ZON/USE' &&
        permit['permit_type_code'] == 'NEWCON') ||
        (permit['application_type'] == 'BP_NEWCNST' &&
        permit['permit_type_code'] == 'FOUND') ||
        (permit['application_type'] == 'BP_NEWCNST' &&
        permit['work_description'] &&
        permit['work_description'].match(/.*SINGLE FAMILY.*/)) ||
        (permit['application_type'] == 'BP_NEWCNST' &&
        permit['permit_type_code'] == 'ENTIRE') ||
        (permit['application_type'] == 'BP_FIRESUP' &&
        permit['permit_type_code'] == 'NEWIN') ||
        permit['permit_type_name'] == 'DEM-COMPLETE') {
  			if ('MLS_data' in prop) {
  				return (prop['SPIM_color'] = '#00FF00');
  			}
  			else {
  				return (prop['SPIM_color'] = '#b2ffb2');
  			}
      }
    }
  });

	if (prop['no_water_use_in_last_3_scrapes']){
     return prop['fill_color'] = '#2980b9';
  }

  

}

mongoose.connect('mongodb://Patrick:alwaysbecobbling@candidate.32.mongolayer.com:10467,candidate.33.mongolayer.com:10429/aux_prop_prod_restore', function (err){
	async.eachSeries(wardList, function(listNum, nextWard){
		models.Property.find({ward : listNum}).exec(function(err, results){
				if(err){
					console.log(err);
					throw err;
				}
				async.each(results, function(prop, nextProp){
					assignColorToProp(prop);
					prop.save(function(err){
						if (err) {
							throw err;
						}
						nextProp();
					})
				}, function(err){
					if (err) {throw err; }
					nextWard();
				})
		})
	});
	
});