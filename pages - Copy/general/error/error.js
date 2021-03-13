  module.exports = function(req,res,callback){
 	var resp={title:'Error',err:{code:req.query.code||'000',message:req.query.message||'ERROR'}};

 	callback(null,resp);
 }