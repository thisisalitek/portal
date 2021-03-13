module.exports = function(req,res,callback){
    var data={
        html:'Merhaba dunya',
        list:[],
        filter:{}
    }
    
    var apiPath=req.query.path || '';

    var designId=req.query.designId || '';
    switch(req.params.func || ''){
        case 'preview':
            data.html = 'preview - ' + data.html
        break;
        
        default:
        break;
    }
    

    api.getFile('/' + req.query.db + apiPath,req,{designId:designId, print:true},(err,resp)=>{
       
        if(!err){
            
            data['html']=resp;
            callback(null,data);
        }else{
            data['html']=err.message;
            callback(null,data);
        }
    });
}