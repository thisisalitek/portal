module.exports = function(req,res,callback){
	var data={
		filter:{},
		form:{
			locationName:'deneme',
			locationType:1,
			hasSubLocations:false,
			passive:false,
		}
	}
	data.filter=getFilter(data.filter,req,res)
	callback(null,data)
}