
function openUrl(url,_id,target,popup){
	url=url.replaceAll('{_id}',_id)
	if(target=='_blank' && popup!=true){
		window.open(url,target)
	}else if(popup){
		popupCenter(url,'Goster','900','600')
	}else{
		localStorage.setItem('returnUrl',window.location.href)
		window.location.href=url
	}

}

function openInNewTab(url) {
	var win = window.open(url, '_blank')
	win.focus()
	return win
}

function popupCenter(url, title, w, h,isDialog=false) {
	var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX
	var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY

	var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width
	var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height

	var systemZoom = width / window.screen.availWidth
	var left = (width - w) / 2 / systemZoom + dualScreenLeft
	var top = (height - h) / 2 / systemZoom + dualScreenTop
	if(!isDialog){
		var newWindow=window.open(url, title, 'scrollbars=yes, width=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left)
		if (window.focus)
			newWindow.focus()
	}else{
		var newWindow=openDialog(url, title, 'scrollbars=yes, width=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left)
		if (window.focus)
			newWindow.focus()
	}

}

var copyX_cb=null
var copyX_fields={}
function copyX(fields,title,cb=null){
	copyX_fields=fields
	copyX_cb=cb

	$('#modalCopyLabel').html(title)
	var s=``
	Object.keys(fields).forEach((key)=>{
		var field=fields[key]
		s+=`<div class="form-group">
		<label class="m-0 p-0">${field.title || ''}</label>
		<input type="text" class="form-control ${field.class || ''}" id="modalCopyField-${generateFormId(key)}" placeholder="${ field.placeholder || field.title || ''}" ${field.readonly==true?'readonly':''} autocomplete="off" autofill="off" spellcheck="false" value="${field.value}">
		</div>`
	})
	$('#modalCopy .modal-body').html(s)

	$('#modalCopy').modal('show')

}

function modalCopyOk(){
	$('#modalCopy').modal('hide')
	if(copyX_cb){
		var formData={}
		Object.keys(copyX_fields).forEach((key)=>{
			var field=copyX_fields[key]
			formData[key]=$(`#modalCopyField-${generateFormId(key)}`).val()
		})
		formData=listObjectToObject(clone(formData))

		copyX_cb(true,formData)

	}else{
		$('#modalCopy').modal('hide')
	}
}


function logout(){
	confirmX('Programdan çıkmak istiyor musunuz?',(resp)=>{
		
		if(resp)
			window.location.href=`/logout`
	})
}


var confirmX_response=false
function confirmX(message, type='info',cb){
	confirmX_response=false
	if(typeof type=='function'){
		cb=type
		type='info'
	}


	$('#modalConfirm .modal-content').removeClass('alert-warning')
	$('#modalConfirm .modal-content').removeClass('alert-info')
	$('#modalConfirm .modal-content').removeClass('alert-danger')

	$('#modalConfirm .modal-content').addClass(`alert-${type}`)

	$('#modalConfirm .modal-content .message').html(message.replaceAll('\n','<br>'))
	
	$('#modalConfirm').modal('show')
	
	$('#modalConfirm').on('hidden.bs.modal', function (e) {
		$('#modalConfirm').unbind('hidden.bs.modal')
		if(cb)
			cb(confirmX_response)
	})
	$('#modalConfirmOk').on('click', function (e) {
		$('#modalConfirmOk').unbind('click')
		confirmX_response=true
		$('#modalConfirm').modal('hide')
	})
}



function alertX(message, title='', type='info',cb){
	var icon='fas fa-exclamation-triangle'
	if(typeof title=='function'){
		cb=title
		title=''
		type='info'
	}else if(typeof type=='function'){
		cb=type
		type='info'
	}
	$('#modalMessageHeader').removeClass('alert-warning')
	$('#modalMessageHeader').removeClass('alert-info')
	$('#modalMessageHeader').removeClass('alert-danger')

	switch(type){
		case 'danger':
		icon='fas fa-skull-crossbones'
		$('#modalMessageHeader').addClass('alert-danger')
		break
		case 'warning':
		icon='fas fa-exclamation-triangle'
		$('#modalMessageHeader').addClass('alert-warning')
		break
		default:
		icon='fas fa-info-circle'
		$('#modalMessageHeader').addClass('alert-info')
		break
	}
	title=`<i class="${icon}"></i> ${title}`
	$('#modalMessageLabel').html(title)

	$('#modalMessage .modal-body').html(`${message.replaceAll('\n','<br>')}`)

	$('#modalMessage').modal('show')
	$('#modalMessage').on('hidden.bs.modal', function (e) {
		if(cb)
			cb('ok')
	})
}

function showError(err){
	alertX(`${err.code || err.name} - ${err.message || err.name}`,'Hata','danger')
}


function modalFormOptions(){
	var s=global.formOptionsLink
	if(s.indexOf('?')>-1){
		s+='&'
	}else{
		s+='?'
	}
	s+=`&module=${hashObj.module}`
	window.location.href=s
}

function modalFormOptions_OK(){
	var data={page:{}}
	data.page[windowPathToFieldName()]={programs:[null]}
	$(".programRow").each(function() {
		if(this.checked){
			var prg=JSON.parse(decodeURIComponent(this.value))

			data.page[windowPathToFieldName()].programs.push({_id:prg._id,type:prg.type,name:prg.name})
		}
	})
	
	
	$.ajax({
		url:`/dbapi/settings`,
		data:data,
		type:'PUT',
		dataType: 'json',
		success: function(result) {
			
			if(result.success){
				
				window.location.href=`/general/login/passport?r=${window.location.href}`
				
			}else{
				showError(result.error)
			}
		},
		error:function(err){
			showError(err)
		}
	})
	
}

