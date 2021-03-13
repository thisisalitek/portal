module.exports = function(req,res,callback){
	var data={
		filter:{}
	}
	data.filter=getFilter(data.filter,req,res)
	callback(null,data)
}