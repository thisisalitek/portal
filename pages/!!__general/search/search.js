module.exports = function(req,res,callback){
    var data={
        form:{
            title:''
        },
        list:[],
        filter:{}
    }

    switch(req.params.func || ''){
        
        default:
            getList(req,res,data,callback);
        break;
    }
    
}

function getList(req,res,data,callback){
    if(req.method=='POST'){
        var filter={};
        
        for(let k in req.body){
            if(req.body[k] && k!='btnFilter'){
                filter[k]=req.body[k];
            }
        }

        res.redirect(`/general/search?${mrutil.encodeUrl(filter)}`);
    }else{
        data.filter=Object.assign(data.filter,req.query);

        api.get(`/{db}/search`,req,data.filter,(err,resp)=>{
            if(!err){
                data=mrutil.setGridData(data,resp);
            }
            callback(null,data);
        });
    }
}
