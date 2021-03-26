(function(exports) {

	var script=''
	var defaultButtons={

		add:[false,''],
		copy:[false,''],
		view:[false,''],
		print:[false,''],
		edit:[false,''],
		delete:[false,'']
	}
	var rootGridId=0
	var controlItem
	var _bRoot=false
	var _divId=''

	exports.FormControl = Object.freeze({
		build:build,
		card:card,
		tab:tab,
		group:group,
		textBox:textBox,
		label:label,
		numberBox:numberBox,
		dateBox:dateBox,
		timeBox:timeBox,
		lookup:lookup,
		remoteLookup:remoteLookup,
		checkBox:checkBox,
		checkBoxLookup:checkBoxLookup,
		dateRangeBox:dateRangeBox,
		imageBox:imageBox,
		fileBox:fileBox,
		button:button,

		grid:grid,
		gridHtml:gridHtml,
		// gridModalAddRow:gridModalAddRow,
		// gridModalEditRow:gridModalEditRow,
		// gridModalOK:gridModalOK,
		gridRefresh:gridRefresh,
		generateControls:generateControls,
		get item(){
			return controlItem
		},
		set item(value){
			controlItem=value
		},
		get divId(){
			return _divId
		},
		set divId(value){
			_divId=value
		},

		get bRoot(){
			return _bRoot
		},
		set bRoot(value){
			_bRoot=value
		},
		get script(){
			return script
		},
		set script(value){
			script=value
		}
	})

	function build(sayfalar,divId){

		_divId=divId


		var mainCtrl=document.getElementById(divId)
		if(mainCtrl.tagName=='DIV'){
			mainCtrl.innerHTML=''
		}

		script=''
		try{

			$('#headerButtons').html('')

			var s='<form><div class="row">'

			var index=0

			function calistir(cb){
				if(index>=sayfalar.length)
					return cb()

				if(sayfalar[index].type=='filter' && (hashObj.query.cbDate || '')==''){
					if(pageSettings.getItem('cbDate')){
						var obj=cboEasyDateChange(pageSettings.getItem('cbDate'))

						h=getHashObject()
						h.query.cbDate=pageSettings.getItem('cbDate')
						h.query.date1=obj.date1
						h.query.date2=obj.date2
						setHashObject(h)
						return cb()
					}
				}

				var sayfa=clone(sayfalar[index])

				getRemoteData(sayfa,(err,data)=>{
					if(!err){
						var fieldList=collectFieldList(sayfa)

						script+=`

						`
						if(sayfa.type=='form' && sayfa.dataSource){
							var hbtn=``

							hbtn=`
							<a href="javascript:formKaydet('#${divId}');" class="btn btn-primary  btn-form-header" title="Kaydet"><i class="fas fa-save"></i></a>
							<a href="javascript:history.back(-1);" class="btn btn-dark  btn-form-header ml-2" title="Vazgeç"><i class="fas fa-reply"></i></a>`
							if(sayfa.options){
								if(sayfa.options.mode=='view'){
									hbtn=`<a href="javascript:history.back(-1);" class="btn btn-dark  btn-form-header ml-2" title="Vazgeç"><i class="fas fa-reply"></i></a>`
								}
							}
							$('#headerButtons').html(hbtn)
							script+=`
							function formKaydet(divId){
								var dataSource=${JSON.stringify(sayfa.dataSource)}
								var formData=getFormData(\`\${divId} form\`)
								formSave(dataSource,formData)
							}

							$('#${divId} input,select').on('change',(e)=>{
								var fields=${JSON.stringify(fieldList)}
								var valueObj=getDivData('#${divId}')
								Object.keys(fields).forEach((key)=>{
									if(fields[key].id!=e.target.id && fields[key].calc){
										try{
											$(\`#\${fields[key].id}\`).val(eval(replaceUrlCurlyBracket(fields[key].calc,valueObj)))
										}catch(tryErr){
											$(\`#\${fields[key].id}\`).val(replaceUrlCurlyBracket(fields[key].calc,valueObj))
										}

									}
								})
							})
							`
						}

						s+=generateControls(sayfa,data,true)


						index++
						setTimeout(calistir,0,cb)
					}else{
						cb(err)
					}
				})
			}

			calistir((err)=>{
				if(!err){
					s+=`</div></form>`
					if(mainCtrl.tagName=='DIV'){
						mainCtrl.innerHTML=s
						loadCardCollapses()
						
						$(`#${divId}`).append(`<script type="text/javascript">${script}<\/script>`)

					}else if(mainCtrl.tagName=='IFRAME'){
						var iframe = mainCtrl.contentWindow || ( mainCtrl.contentDocument.document || mainCtrl.contentDocument)
						iframe.document.open()
						iframe.document.write(s)
						iframe.document.write(`<script type="text/javascript">${script}<\/script>`)
						iframe.document.close()
					}


				}else{
					s+=`Hata:${err.code || err.name || ''} - ${err.message || err.name || ''}</div></form>`
					mainCtrl.innerHTML=s
					if(err.code=='SESSION_NOT_FOUND'){
						window.location.href=`/changedb?sid=${global.sessionId}&r=${window.location.href}`
						
					}
				}
				script=''
				$('#spinner').hide()
			})


		}catch(err){
			console.error('Hata:',err)
			mainCtrl.innerHTML=`Oppsss! Render Hatasi: <br>${err.name || ''}<br>${err.message || ''}<br>${(err.stack || '').replaceAll('\n','<br>')}`
		}
	}

	function generateControls(item,data,bRoot=false,insideOfModal=false){
		var s=''
		var autocol=item.options?(item.options.autocol===true?true:false):false
		var queryValues=item.options?(item.options.queryValues===true?true:false):false
		if(item.script!=undefined){
			if(Array.isArray(item.script)){
				script+=item.script.join('\r\n')
			}else{
				script+=`${item.script || ''}\r\n`
			}
		}

		if(item.fields){
			Object.keys(item.fields).forEach((key)=>{
				item.fields[key].field=key
				item.fields[key]=itemDefaultValues(item.fields[key],autocol,insideOfModal,queryValues)
				if(item.type=='grid'){
					item.fields[key].parentField=item.field || ''
					item.parentField=item.field || ''
				}
			})
		}else if(item.tabs){
			item.tabs.forEach((tab)=>{
				if(tab.fields){
					Object.keys(tab.fields).forEach((key)=>{
						tab.fields[key].field=key
						tab.fields[key]=itemDefaultValues(tab.fields[key],autocol,insideOfModal,queryValues)
					})
				}
			})
		}
		if(!data){
			data={value:{}}
		}

		item.insideOfModal=insideOfModal

		switch((item.type || '').toLowerCase()){
			case 'string' :
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=textBox(item)
			break
			case 'number' :
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || 0
			s+=numberBox(item)
			break

			case 'money' :
			if(item.readonly){
				item.value=Number(getPropertyByKeyPath(data.value,item.field) || item.value || 0).formatMoney()
				item.class+=' text-right'
				s+=textBox(item)
			}else{
				item.value=getPropertyByKeyPath(data.value,item.field) || item.value || 0
				s+=numberBox(item)
			}
			break
			case 'identity' :

			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || 0
			item.readonly=true
			s+=numberBox(item)
			break
			case 'date' : 
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=dateBox(item)
			break
			case 'time' : 
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=timeBox(item)
			break
			case 'filebase64image' :
			case 'image' :
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=imageBox(item)
			break
			case 'filebase64' :
			case 'file' :
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=fileBox(item)
			break
			case 'strings':
			case 'textarea':
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=textareaBox(item)
			break
			case 'code':
			item.rows=item.rows || 40
			item.encoding=item.encoding || 'base64'
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=textareaBox(item)
			break
			case 'json':
			item.rows=item.rows || 40
			item.encoding=item.encoding || 'base64'
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=textareaBox(item)
			break
			case 'button' : 
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=button(item)
			break
			case 'lookup' :
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=lookup(item)
			break
			case 'html' :
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=formHtml(item)
			
			break
			case 'label' :
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=label(item)
			break
			case 'remotelookup' : 
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value
			if(item.lookupTextField){
				item.valueText=getPropertyByKeyPath(data.value,item.lookupTextField) || item.valueText || ''
			}
			s+=remoteLookup(item)

			break
			case 'boolean' :
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=checkBox(item)
			break
			case 'daterange' : 
			s+=dateRangeBox(item)
			break
			case 'w-100': 
			case 'w100': 
			case 'divisor': 
			s+=`<div class="w-100"></div>`
			break
			case 'grid':

			if(bRoot){
				item.value=data.value || []
				item.paging=data.paging
				s+=grid(item, bRoot,insideOfModal)
			}else{
				item.value=getPropertyByKeyPath(data.value,item.field)
				item.controls=grid(item, bRoot,insideOfModal)
				s+=card(item)
			}

			break
			case 'filter':
			if(item.fields){
				item.controls=`<div id="filterForm" class="col-12 m-0 p-0"><div class="row m-0 p-0">`
				Object.keys(item.fields).forEach((key)=>{
					item.fields[key].value=hashObj.query[key] || ''
					item.fields[key].showAll=true
					item.fields[key].class='my-0'
					item.controls+=generateControls(item.fields[key],{value:{}},false,insideOfModal)
				})
				item.controls+=`${filterFormButton('filterForm')}</div></div>`

				if(bRoot){
					s+=item.controls
				}else{

					s+=card(item)
				}
			}
			break
			case 'tab':
			case 'form':
			case 'group':
			case 'modal':


			if(item.fields){
				item.controls=''
				Object.keys(item.fields).forEach((key)=>{
					item.controls+=generateControls(item.fields[key],data,false,insideOfModal)
				})

				if(bRoot || item.type=='modal'){
					s+=item.controls
				}else{

					s+=card(item)
				}
			}else if(item.tabs){
				item.tabs.forEach((tab,index)=>{
					tab.controls=''
					if(tab.fields){
						Object.keys(tab.fields).forEach((key)=>{
							tab.controls+=generateControls(tab.fields[key],data,false,insideOfModal)
						})
					}
				})
				s+=tab(item)
			}

			break

			default:
			item.value=getPropertyByKeyPath(data.value,item.field) || item.value || ''
			s+=textBox(item)
			break
		}



		return s
	}


	function grid(item,bRoot,insideOfModal){

		// if(item.options){
		// 	if(item.options.root!=undefined)
		// 		bRoot=item.options.root
		// }
		
		var s=``
		item=gridDefaults(item,bRoot,insideOfModal)
		if(insideOfModal==false){

			script+=`
			var grid${item.id}=FormControl.FormControl
			grid${item.id}.item=${JSON.stringify(item)}
			grid${item.id}.bRoot=${bRoot}
			grid${item.id}.gridRefresh()

			document.getElementById('${item.id}').item=${JSON.stringify(item)}

			$('.modal-dialog').draggable({handle: '.modal-header'})
			`
			this.bRoot=bRoot

			s=`<div id="${item.id}" class="table-responsive ${item.options.show.infoRow?'mt-1':''}"></div>
			${gridModalTemplate(item)}
			`
		}else{
			s=`<div id="${item.id}" class="table-responsive ${item.options.show.infoRow?'mt-1':''}">${gridHtml(item,false,true)}</div>`

			script+=`
			document.getElementById('${item.id}').item=${JSON.stringify(item)}

			`
		}

		return s
	}

	function gridButtonOptions(item,bRoot,insideOfModal){
		var options=item.options || {}
		var buttonCount=0
		var currentPath=window.location.pathname

		if(options.buttons==undefined){
			options.buttons=defaultButtons
		}else{
			options.buttons=Object.assign({},defaultButtons, options.buttons)
			Object.keys(options.buttons).forEach((key)=>{
				if(typeof options.buttons[key]=='boolean'){
					options.buttons[key]=[options.buttons[key],'']
				}else if(Array.isArray(options.buttons[key])){
					if(options.buttons[key].length<2)
						options.buttons[key].push('')
				}
			})
		}
		var q={}
		if(hashObj.query.mid)
			q={mid:hashObj.query.mid}
		if(options.queryValues){
			q=hashObj.query
		}else{

		}
		if(options.buttons.add[0]==true && options.buttons.add[1]==''){
			if(bRoot){
				options.buttons.add[1]=`<a href="${menuLink(hashObj.path + '/addnew',q)}" class="btn btn-primary  btn-sm far fa-plus-square" target="_self"  title="Yeni Ekle"></a>`
			}else{
				if(item.modal && !item.insideOfModal){
					options.buttons.add[1]=`<a href="javascript:gridModalAddRow('${item.id}',${insideOfModal})" class="btn btn-primary  btn-sm far fa-plus-square" target="_self"  title="Yeni Ekle (modal)"></a>`
				}else{
					options.buttons.add[1]=``
				}
			}
		}

		if(options.buttons.copy[0]==true && options.buttons.copy[1]==''){
			options.buttons.copy[1]=`<a href="javascript:gridCopyItem({rowIndex},'${item.id}')" class="btn btn-grid-row btn-success " title="Kopyala"><i class="fas fa-copy"></i></a>`
		}

		if(options.buttons.print[0]==true && options.buttons.print[1]==''){
				// options.buttons.print[1]=`<a href="javascript:popupCenter('/haham?view=plain#${hashObj.path + '/print/{_id}'}','Yazdır','900','600')" class="btn btn-grid-row btn-info " title="Yazdır"><i class="fas fa-print"></i></a>`
				var q2=clone(q)
				q2['view']='print'
				
				if(hashObj.settings.print){
					if(hashObj.settings.print.form){
						q2['designId']=hashObj.settings.print.form._id 
					}
					
				}
				
				options.buttons.print[1]=`<a href="javascript:popupCenter('${menuLink(hashObj.path + '/print/{_id}',q2)}','Yazdır','900','600')" class="btn btn-grid-row btn-info " title="Yazdır"><i class="fas fa-print"></i></a>`
			}

			if(options.buttons.view[0]==true && options.buttons.view[1]==''){
				options.buttons.view[1]=`<a href="${menuLink(hashObj.path + '/view/{_id}',q)}" class="btn btn-info btn-grid-row fas fa-eye" title="İncele"></a>`
			}

			if(options.buttons.edit[0]==true && options.buttons.edit[1]==''){
				if(bRoot){
					options.buttons.edit[1]=`<a href="${menuLink(hashObj.path + '/edit/{_id}',q)}" class="btn btn-primary btn-grid-row fas fa-edit" target="_self"  title="Düzenle"></a>`
				}else{
					options.buttons.edit[1]=`<a href="javascript:gridSatirDuzenle({rowIndex},'${item.id}',${insideOfModal})" class="btn btn-info btn-grid-row fas fa-edit" title="Satır Düzenle"></a>`
					if(item.modal && !item.insideOfModal){
						options.buttons.edit[1]+=`<a href="javascript:gridModalEditRow({rowIndex},'${item.id}',${insideOfModal})" class="btn btn-success btn-grid-row fas fa-window-restore" title="Modal Düzenle"></a>`
					}
					
				}
			}

			if(options.buttons.delete[0]==true && options.buttons.delete[1]==''){
				if(bRoot){
					options.buttons.delete[1]=`<a href="javascript:gridDeleteItem({rowIndex},'${item.id}')" class="btn btn-danger btn-grid-row fas fa-trash-alt" title="Sil"></a>`
				}else{
					if(item.modal && !item.insideOfModal){
						options.buttons.delete[1]=`<a href="javascript:gridSatirSil({rowIndex},'${item.id}',${insideOfModal})" class="btn btn-danger btn-grid-row fas fa-trash-alt" title="Sil"></a>`
					}else{
						options.buttons.delete[1]=`<a href="javascript:gridSatirSil({rowIndex},'${item.id}',${insideOfModal})" class="btn btn-danger btn-grid-row fas fa-trash-alt" title="Sil"></a>`
					}
				}
			}

			Object.keys(options.buttons).forEach((key)=>{
				buttonCount +=options.buttons[key][0]?1:0
			})
			if(buttonCount>1 && options.buttons.add[0])
				buttonCount--

			buttonCount=buttonCount>4?4:buttonCount

			if(bRoot){
				options.buttonWidth=`${buttonCount*45+10}px`
			}else{
				options.buttonWidth=`${3*45+10}px`
			}
			item.options=options

			return item
		}

		function panelButtons(item){
			var s=''

			if(item.panelButtons){
				Object.keys(item.panelButtons).forEach((key)=>{
					item.panelButtons[key].noGroup=true
					item.panelButtons[key].class=item.panelButtons[key].class || 'btn btn-primary'
					item.panelButtons[key].class+=' mr-2'
					
					if(!item.panelButtons[key].href && item.panelButtons[key].dataSource){
						item.panelButtons[key].href=`javascript:runPanelButtons('${item.panelButtons[key].dataSource.url}','${item.panelButtons[key].dataSource.method}')`
					}

					s+=generateControls(item.panelButtons[key])
				})
				
			}
			return s
		}

		function gridHtml(item,bRoot,insideOfModal=false){

			var sayfaProgramlari=bRoot?programButtons(panelButtons(item)):''
			var s=``
			if(item.options.show.infoRow || sayfaProgramlari!=''){
				s+=`
				${sayfaProgramlari}
				<!-- info row -->
				<div class="row m-0 border">
				<div class="col-12 pt-1 px-1">
				<div class="float-left form-inline m-0 p-0 mt-1 mb-1">
				${item.options.show.filter?'<a class="btn btn-secondary btn-sm mr-3" data-toggle="collapse" href="#filterRow" role="button" aria-expanded="false" aria-controls="filterRow" title="Filtre satırını göster/gizle"><i class="fas fa-filter"></i></a>':''}
				${item.options.show.pageSize?gridPageSize(item,bRoot):''}
				${item.options.show.pageCount?gridPageCount(item,bRoot):''}
				</div>
				${item.options.show.pagerButtons?'<div class="float-right">' + gridPagerButtons(item,bRoot) + '</div>':''}
				</div>
				</div>
				<!-- ./info row -->
				`
			}
			s+=`
			<!-- table -->
			<table id="table${item.id}" class="table table-striped border m-0 ${!bRoot?'table-bordered':''}"  cellspacing="0">
			
			${item.options.show.header?gridHeader(item):''}
			${gridBody(item,bRoot,insideOfModal)}
			${item.options.show.footer?gridFooter(item):''}
			</table>
			<!-- ./table -->
			`
			if(item.options.show.infoRow){
				//				<a class="btn btn-success btn-sm" href="javascript:gridCSVExport('${btoa2(JSON.stringify(item))}')" title="CSV indir"><i class="far fa-file-excel"></i><i class="ml-2 fas fa-download"></i></a>
				s+=`
				<!-- info row -->
				<div class="row m-0 border">
				<div class="col-12 pt-1 px-1">
				<div class="float-left form-inline m-0 p-0 mt-1 mb-1">
				<div class="">
				<a class="btn btn-success btn-sm" href="javascript:gridCSVExport('${item.id}')" title="CSV indir"><i class="far fa-file-excel"></i><i class="ml-2 fas fa-download"></i></a>
				</div>
				${item.options.show.pageCount?gridPageCount(item,bRoot):''}
				</div>
				${item.options.show.pagerButtons?'<div class="float-right">' + gridPagerButtons(item,bRoot) + '</div>':''}
				</div>
				</div>
				<!-- ./info row -->
				`
			}

			if(bRoot){
				script+=`
				programFileUploaderChangeEvent()
				`
			}
			
			return s
		}

		function filterFormButton(divId){
			var s=`
			<div class="ml-auto col text-right" style="padding-top: 1.2rem !important;">
			<a href="javascript:runFilter('#${divId}')" class="btn btn-primary" title="Filtrele" ><i class="fas fa-sync-alt"><i class="fas fa-filter  ml-2"></i> </i></a>
			</div>
			`

			return s
		}



		function itemDefaultValues(item,autocol=false,insideOfModal=false,queryValues=false){
			var field=item.field
			var lookupTextField=item.lookupTextField || ''
			if(item.parentField){
				field=`${item.parentField}.${field}`

			}
			if(item.lookupTextField){
				var lookupTextField=item.lookupTextField
				if(item.parentField){
					lookupTextField=`${item.parentField}.${item.lookupTextField}`
				}
				item.lookupTextFieldId=generateFormId(lookupTextField)
				item.lookupTextFieldName=generateFormName(lookupTextField)

			}
			item.id=generateFormId(field)
			item.name=generateFormName(field)
			item.title=item.title || ''
			item.icon=item.icon || ''

			item.type=item.type || ''

			if(item.type=='' && item.fields){
				item.type='group'
			}
			if(item.type=='' && item.tabs){
				item.type='tab'
			}

			if(!isNaN(item.col)){
				item.col='col-md-' + item.col
			}else{
				if(autocol){
					switch(item.type.toLowerCase()){
						case 'identity':
						item.col='col-md-1'
						break
						case 'number':
						case 'money':
						item.col='col-md-2'
						break
						case 'remotelookup':
						item.col='col-md-6'
						break
						case 'lookup':
						item.col='col-md-2'
						if(maxLookupLength(item.lookup || {})>30){
							item.col='col-md-4'
						}
						break
						case 'boolean':
						item.col='col-md-2'
						break
						case 'grid':
						item.col='col-md-12'
						break
						default:
						item.col='col-md-4'
						break
					}
				}else{
					if(item.type.toLowerCase()=='daterange'){
						item.col=item.col || 'col-md-5'
					}else{
						item.col=item.col || 'col-md-12'
					}
					
				}
			}

			
			item.required=item.required==undefined?false:item.required
			item.visible=item.visible==undefined?true:item.visible
			item.collapsed=item.collapsed==undefined?false:item.collapsed
			

			item.lookup=item.lookup || {}

			if(item.staticValues){
				item.lookup=global.staticValues[item.staticValues] || {}
			}
			item.class=item.class || ''
			item.readonly=item.readonly || false

			if(item.required){
				if(item.title.substr(0,1)!='*'){
					item.title=`*${item.title}`
				}
			}

			item.insideOfModal=insideOfModal
			if(!item.value){
				if(queryValues){
					item.value=hashObj.query[item.field] || ''
				}else if(item.type=='date'){
					item.value=(new Date()).yyyymmdd()
				}else if(item.type=='time'){
					item.value=(new Date()).hhmmss()
				}else if(item.lastRecord===true){
					var lastRecord= pageSettings.getItem('lastRecord')
					if(lastRecord){
						item.value=getPropertyByKeyPath(lastRecord,item.field)
					}
					
				}
			}
			
			
			return item
		}
		
		var gridRefreshCalisiyor=false

		function gridRefresh(){
			script=''
			if(gridRefreshCalisiyor)
				return
			gridRefreshCalisiyor=true
			
			if(!this.item.paging){
				this.item.paging={
					page:hashObj.query.page || 1,
					pageSize:hashObj.query.pageSize || pageSettings.getItem(`pageSize`) || 10
				}
			}
			$(`#${this.item.id}`).html(this.gridHtml(this.item,this.bRoot))

			$(`#pageSize${this.item.id}`).on('change',()=>{
				
				hashObj.query.pageSize=$(`#pageSize${this.item.id}`).val()
				hashObj.query.page=1
				pageSettings.setItem(`pageSize`,$(`#pageSize${this.item.id}`).val())
				
				setHashObject(hashObj)
			})

			$(`#selectAll${this.item.id}`).on(`change`,(e)=>{
				$(`input:checkbox`).not($(`#selectAll${this.item.id}`)).prop(`checked`, $(`#selectAll${this.item.id}`).prop(`checked`))
			})

			if(pageSettings.getItem(`filterButton`)==true){
				$(`#filterRow`).collapse('show');
			}else{
				$(`#filterRow`).collapse('hide');
			}

			$(`#filterRow`).on(`hidden.bs.collapse`, function () {
				pageSettings.setItem(`filterButton`,false)
			})
			$(`#filterRow`).on(`shown.bs.collapse`, function () {
				pageSettings.setItem(`filterButton`,true)
			})

			gridFilterRow_changes(this.item)

			$('.modal-dialog').draggable({handle: '.modal-header'})
			$(`#${this.item.id}`).append(`<script type="text/javascript">${script}<\/script>`)

			if(this.item.onchange){
				var onchange=this.item.onchange
				if(onchange.indexOf('this.value')>-1){
					onchange=onchange.replace('this.value',`JSON.parse(decodeURIComponent('${encodeURIComponent2(JSON.stringify(this.item.value))}'))`)
					eval(onchange)
				}else if(onchange.indexOf('this')>-1){
					onchange=onchange.replace('this',`JSON.parse(decodeURIComponent('${encodeURIComponent2(JSON.stringify(this.item))}'))`)
					eval(onchange)
				}else{
					eval(onchange)
				}
			}
			gridRefreshCalisiyor=false
		}

		function gridModalTemplate(item){
			if(item.insideOfModal){
				return ''
			}
			var s=`
			<div class="modal" id="modalRow${item.id}" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="true" aria-labelledby="modalRow${item.id}Label" aria-hidden="true">
			<div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered" role="document">
			<div class="modal-content">
			<div class="modal-header p-2 ">
			<label class="modal-title" id="modalRow${item.id}Label"></label>
			<button class="close" type="button" data-dismiss="modal" aria-label="Close">
			<span aria-hidden="true">&times;</span>
			</button>
			</div>
			<div class="modal-body p-2" style="overflow: auto;">

			</div>
			<div class="modal-footer">
			</div>
			</div>
			</div>
			</div>
			`
			return s
		}

		function gridBody(item,bRoot,insideOfModal){
			var s=`<tbody>`
			
			var nextIdentity=1
			var remoteList={}
			var fieldList=clone(item.fields)
			var fields=clone(item.fields)
			if(item.value){
				nextIdentity=item.value.length+1
				item.value.forEach((listItem,rowIndex)=>{
					s+=`<tr>`
					if(item.options.selection){
						s+=`<td><input class="grid-checkbox checkSingle" type="checkbox" value="${listItem._id || ''}" /></td>`
					}
					Object.keys(fields).forEach((key)=>{
						var field=fields[key]
						field.field=key
						
						field.class=replaceUrlCurlyBracket(field.class,listItem)
						var td=''
						var tdClass=`${field.class || 'ml-1'} `
						var itemValue=''
						if(field.type.toLowerCase()=='identity' || field.type.toLowerCase()=='autoincrement' || field.type.toLowerCase()=='autoinc'){
							itemValue=rowIndex+1
						}else{
							if(field.html && field.type!='lookup'){
								itemValue=replaceUrlCurlyBracket(field.html,listItem) || ''
							}else{
								itemValue=getPropertyByKeyPath(listItem,key)
								if(itemValue==undefined){
									itemValue=''
									if(field.type=='number' || field.type=='money'){
										itemValue=0
									}else if(field.type=='boolean'){
										itemValue=false
									}
								}
							}
						}

						switch(field.type.toLowerCase()){
							case 'lookup':
							var valueText=''
							var o=Object.assign({},listItem)
							Object.keys(field.lookup || {}).forEach((key2)=>{
								if(key2===itemValue.toString()){
									td+= field.lookup[key2]
									valueText=field.lookup[key2]
									return
								}
							})
							if(td==''){
								td+=itemValue
							}
							
							if(field.lookupTextField){
								o[field.lookupTextField]=valueText
								if(!bRoot){
									td+=`<input type="hidden" name="${generateFormName((field.parentField?field.parentField + '.':'') + rowIndex + '.' + field.lookupTextField)}" value="${valueText}" />`
								}
							}
							if(field.html){

								o[field.field]=itemValue.toString()
								o['valueText']=valueText

								td=replaceUrlCurlyBracket(field.html,o) || ''
							}
							break

							case 'number':
							tdClass=field.class || 'text-right mr-1'
							td=Number(itemValue).formatQuantity()
							break

							case 'money':
							tdClass=field.class || 'text-right mr-1'
							td=Number(itemValue).formatMoney()
							break
							case 'date':
							td=(new Date(itemValue)).yyyymmdd()
							break
							case 'time':
							td=(new Date(itemValue)).hhmmss()
							break
							case 'datetime':
							td=(new Date(itemValue)).yyyymmddhhmmss()
							break
							case 'fromnow':
							td=moment((new Date(itemValue))).fromNow()
							break
							case 'boolean':
							tdClass=field.class || 'text-center'
							itemValue=(itemValue || '').toString()==='true'?true:false
							td=itemValue?'<i class="fas fa-check-square text-primary font-size-150"></i>':'<i class="far fa-square text-dark font-size-150"></i>'
							break
							case 'remotelookup':
							var bRemoteOlarakBulalim=true
							if(itemValue==undefined){
								itemValue=''
							}
							if(typeof itemValue=='object' && itemValue._id!=undefined){
								td=`<div class="">${replaceUrlCurlyBracket((field.dataSource.label || '{name}'), itemValue)}</div>`
								bRemoteOlarakBulalim=false
							}else	if(field.lookupTextField){
								var valueText=getPropertyByKeyPath(listItem,field.lookupTextField)
								td=`<div class="">${valueText}</div>`
								if(!bRoot){
									td+=`<input type="hidden" name="${generateFormName((field.parentField?field.parentField + '.':'') + rowIndex + '.' + field.lookupTextField)}" value="${valueText}" />`
								}

								if(valueText=='' && itemValue!=''){
									bRemoteOlarakBulalim=true
								}else{
									bRemoteOlarakBulalim=false
								}
							}

							if(bRemoteOlarakBulalim){
								var cellId=''
								if(itemValue!=''){
									cellId=`${item.id}-cell-${itemValue}`
									if(remoteList==undefined){
										remoteList={}
									}

									if(remoteList[field.field]==undefined){
										remoteList[field.field]={
											dataSource:field.dataSource,
											list:{
											}
										}
									}

									if(remoteList[field.field].list[itemValue]==undefined){
										remoteList[field.field].list[itemValue]={
											cellId:'.' + cellId,
											text:''
										}
										if(field.lookupTextField){
											remoteList[field.field].list[itemValue]['lookupTextField']=`${generateFormName((field.parentField?field.parentField + '.':'') + rowIndex + '.' + field.lookupTextField)}`
										}
									}
								}
								td+=`<div class="${cellId}">${itemValue?'<span class="text-danger bold">(bulunamadı)</span>':''}</div>`
							}
							break
							// case 'link':
							// case 'badge':

							// td=`<span class="${tdClass}>`
							// if(field.href){
							// 	td+=`<a href="${replaceUrlCurlyBracket(field.href,listItem)}"></a>`
							// }
							// td+=`</span>`
							// break
							default:
							td=itemValue
							break
						}
						if(!field.html && !bRoot){
							var prefix=(field.parentField?field.parentField + '.':'') + rowIndex
							if(Array.isArray(itemValue)){
								
								itemValue.forEach((e,index)=>{
									if(typeof e=='object'){
										Object.keys(e).forEach((k)=>{
											td+=`<input type="hidden" name="${generateFormName(prefix + '.' + key + '.' + index + '.' + k)}" value="${e[k]}" />`
										})
									}else{
										td+=`<input type="hidden" name="${generateFormName(prefix + '.' + key + '.' + index)}" value="${e}" />`
									}
								})
							}else if(typeof itemValue=='object'){
								
								itemValue=objectToListObject(itemValue)
								Object.keys(itemValue).forEach((e)=>{
									td+=`<input type="hidden" name="${generateFormName(prefix + '.' + key + '.' + e)}" value="${itemValue[e]}" />`
								})

							}else{
								td+=`<input type="hidden" name="${generateFormName(prefix + '.' + key)}" value="${itemValue}" />`
							}
						}

						s+=`<td class="${tdClass || ''} ${field.visible===false?'hidden':''}">${td}</td>`
					})

s+=`<td class="text-center">${buttonRowCell(listItem,rowIndex,item,bRoot)}</td>`
s+=`</tr>`

})
}

// if((insideOfModal || !item.modal)  && item.options.buttons.add[0] && !bRoot){
	if(item.options.buttons.add[0] && !bRoot){
		s+=`<tr id="${item.id}-row-editor">`

		Object.keys(fieldList).forEach((key)=>{
			var field=fieldList[key]
			var cls=''
			field.field=`${item.parentField}.-1.${key}`
			field.noGroup=true
			field.id=generateFormId(field.field)
			field.name=generateFormName(field.field)
			field.value=undefined
			delete field.value
			field.valueText=undefined
			delete field.valueText

			if(field.type=='boolean'){
			//cls+=' text-center'
			field.class='grid-checkbox'
		}else if(field.type=='identity'){
			field.value=nextIdentity
		}
		if(field.visible===false){
			cls+=' hidden'
		}
		var td=`<td class="${cls || ''}">${generateControls(field,{}, bRoot,insideOfModal)}</td>`

		s+=td
	})
		s+=`<td class="text-center">
		<a href="javascript:gridSatirOK('${item.id}','${item.id}-row-editor',-1,${insideOfModal})" class="btn btn-primary btn-grid-row" title="Tamam"><i class="fas fa-check"></i></a>
		<a href="javascript:gridSatirVazgec('${item.id}','${item.id}-row-editor',-1,${insideOfModal}) "class="btn btn-dark btn-grid-row" title="Vazgeç"><i class="fas fa-reply"></i></a>
		</td>`
		s+=`</tr>`




		script+=`
		editRowCalculation('#${item.id}-row-editor','${item.parentField}.-1', ${JSON.stringify(fieldList)})

		`
	}

	script+=`
	refreshRemoteList(${JSON.stringify(remoteList)})
	`


	s+=`</tbody>`
	return s
}

function buttonRowCell(listItem,rowIndex,item,bRoot){
	var s=``

	listItem['rowIndex']=rowIndex
	Object.keys(item.options.buttons).forEach((key)=>{
		if(key!='add'){
			s+=`${item.options.buttons[key][0]?replaceUrlCurlyBracket(item.options.buttons[key][1],listItem):''}`
		}
	})

	return s
}

function gridPageSize(item,bRoot){

	var s=`<div class="mt-1 align-items-center" style="display: inline-flex">
	Sayfada
	<select class="form-control input-inline input-sm" id="pageSize${item.id}">
	<option value="10" ${item.paging.pageSize==10?'selected':''}>10</option>
	<option value="20" ${item.paging.pageSize==20?'selected':''}>20</option>
	<option value="50" ${item.paging.pageSize==50?'selected':''}>50</option>
	<option value="100" ${item.paging.pageSize==100?'selected':''}>100</option>
	<option value="250" ${item.paging.pageSize==250?'selected':''}>250</option>
	<option value="500" ${item.paging.pageSize==500?'selected':''}>500</option>
	</select>
	</div>`

	return s
}

function gridPageCount(item,bRoot){
	var s=`<div class="ml-2" style="display: inline-block">`
	if(item.paging.pageSize>0 && item.paging.recordCount>0){
		s+=`${((item.paging.page-1)*item.paging.pageSize)+1} - ${(item.paging.page*item.paging.pageSize<item.paging.recordCount)?item.paging.page*item.paging.pageSize:item.paging.recordCount} arası, Toplam: ${item.paging.recordCount} kayit, ${item.paging.pageCount} sayfa`
	}else{
		s+=`Toplam: ${item.paging.recordCount} kayit`
	}
	s+=`</div>`

	return s
}

function gridPagerButtons(item,bRoot){
	if(!item.paging)
		return ''
	if((item.paging.pageCount || 0)<=1)
		return ''


	var d=item.paging
	

	var s=`
	<ul class="pagination mb-1">`
	if(d.page>1){
		s+=`<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(1))}">|&lt;</a></li>
		<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(d.page-1))}">&lt;</a></li>`
	}

	var sayfalar=pagination(d.page,d.pageCount)
	sayfalar.forEach((e)=>{
		if(e==d.page.toString()){
			s+=`<li class="page-item active"><span class="page-link">${d.page}</span></li>`
		}else if(e=='...'){
			s+=`<li class="page-item"><span class="page-link">...</span></li>`
		} else {
			s+=`<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(e))}">${e}</a></li>`
		}
	})

	if(d.page<d.pageCount){
		s+=`<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(d.page+1))}">&gt;</a></li>
		<li class="page-item"><a class="page-link" href="${menuLink(hashObj.path,pageNo(d.pageCount))}">&gt;|</a></li>`
	}

	s+=`</ul>`
	return s

	function pageNo(page){
		var query=clone(hashObj.query)
		query['page']=page
		return query
	}
}


function gridHeader(item){
	var s=`
	<thead>
	<tr class="text-nowrap">`
	if(item.options.selection===true){
		s+=`<th style="width: 30px;"><input class="grid-checkbox" type="checkbox" value="true" name="selectAll${item.id}" id="selectAll${item.id}" title="Tümünü seç"></th>`
	}
	
	Object.keys(item.fields).forEach((key)=>{
		var field=item.fields[key]
		var cls=''
		switch(item.fields[key].type ){
			case 'money':
			case 'number':
			cls='text-right mr-1'
			break
			case 'boolean':
			cls='text-center'
			break
		}
		if(field.visible===false){
			cls+=' hidden'
		}
		s+=`<th class="${cls}" style="${field.width?'width:' + field.width + ';min-width:' + field.width + ';':''}">${field.icon?'<i class="' + field.icon + '"></i>':''} ${field.title || ''}</th>`
	})

	s+=`<th class="text-center" style="width:${item.options.buttonWidth}">
	${item.options.buttons.add[0]==true?item.options.buttons.add[1]:''}
	</th>
	</tr>
	${item.options.show.filterRow===true?gridFilterRow(item):''}
	</thead>
	`

	return s
}

function gridFilterRow(item){
	var fields=clone(item.fields)
	
	var s=`<tr id="filterRow" class="text-nowrap collapse">
	${item.options.selection===true?'<th></th>':''}
	`

	Object.keys(fields).forEach((key,index)=>{
		var field=fields[key]
		var cell=''
		//field.visible=field.visible==undefined?field.visible:true
		field.filter=field.filter==undefined?item.options.filter:field.filter
		field.filterField=field.filterField || key
		field.id=generateFormId(`${item.id}_filter_${field.filterField}`)
		field.name=generateFormName(`${item.id}_filter.${field.filterField}`)
		field.class='grid-filter'
		field.noGroup=true
		field.placeholder=' '
		if(field.filter){
			if((hashObj.query[field.filterField] || '')!=''){
				field.value=hashObj.query[field.filterField]
			}
			switch(field.type.toLowerCase()){
				case 'lookup':
				field.showAll=true
				cell=lookup(field)
				break
				case 'remotelookup':
				cell=remoteLookup(field)
				break
				case 'boolean':
				cell=checkBoxLookup(field)
				break
				case 'date':
				cell=dateBox(field)
				break
				case 'time':
				cell=timeBox(field)
				break
				case 'number':
				cell=textBox(field)
				break
				case 'money':
				cell=textBox(field)
				break
				default:
				cell=textBox(field)
				break
			}
		}
		s+=`<th class="${field.visible===false?'hidden':''}">${cell}</th>`
	})

	s+=`
	<th></th>
	</tr>
	`
	return s
}

function gridFilterRow_changes(item){
	var fields=clone(item.fields)

	Object.keys(fields).forEach((key,index)=>{
		var field=fields[key]
		var cell=''
		field.visible=field.visible==undefined?field.visible:true
		field.filter=field.filter==undefined?item.options.filter:field.filter
		field.filterField=field.filterField || key
		field.id=generateFormId(`${item.id}_filter_${field.filterField}`)
		field.name=generateFormName(`${item.id}_filter.${field.filterField}`)
		field.class='grid-filter'
		field.noGroup=true

		if(field.filter){
			if(field.type.toLowerCase()=='lookup' || field.type.toLowerCase()=='boolean'){
				
				$(`#${field.id}`).on('change',(e)=>{
					keyupTimer=0
					runFilter(`#filterRow`,`${item.id}_filter`)
				})
				
			}else if(field.type.toLowerCase()=='remotelookup'){
				
				$(`#${field.id}-autocomplete-text`).on('change',(e)=>{
					keyupTimer=0
					runFilter(`#filterRow`,`${item.id}_filter`)
				})
				
			}else{
				
				$(`#${field.id}`).on('keyup',(e)=>{
					setTimeout(()=>{
						keyupTimer=1
						runTimer(`#filterRow`,`${item.id}_filter`)
					},800)
				})
				
			}
		}

	})

}

function gridFooter(item){
	return ``
}

function gridDefaults(item,bRoot,insideOfModal){
	if(item.id==undefined && bRoot){
		rootGridId++
		item.id=`rootGrid${rootGridId}`
	}
	item=gridButtonOptions(item,bRoot,insideOfModal)
	let optShow={}

	if(!bRoot){
		optShow={
			filter:false,
			pageSize:false,
			pageCount:false,
			pagerButtons:false,
			header:true,
			footer:false
		}
	}else{
		optShow={
			filter:true,
			pageSize:true,
			pageCount:true,
			pagerButtons:true,
			header:true,
			footer:true
		}
	}
	item.options.show=Object.assign({},optShow,item.options.show)
	if(item.options.show.infoRow==undefined){
		if(item.options.show.filter || item.options.show.pageSize || item.options.show.pageCount || item.options.show.pagerButtons){
			item.options.show.infoRow=true
		}else{
			item.options.show.infoRow=false
		}
	}
	item.options.show.filterRow=item.options.filter || false
	if(bRoot===false)
		item.options.show.filterRow=false

	if(item.options.show.filterRow){
		var bFound=false
		Object.keys(item.fields).forEach((key)=>{
			item.fields[key].filter=item.fields[key].filter==undefined?true:false
			if(item.fields[key].filter===true){
				bFound=true
				return
			}
		})
		if(bFound==false){
			item.options.show.filterRow=false
		}
	}

	item.value=objectArrayControl(item.value)

	return item
}

function card(item){
	var s=`<div class="card cerceve1 ${item.col || ''} p-0 m-0 mb-2 ${item.visible===false?'hidden':''}">
	<div class="card-header">
	<a class="btn btn-collapse ${item.collapsed?'collapsed':''}" data-toggle="collapse" data-target="#cardCollapse${item.id}" aria-expanded="${!item.collapsed?'false':'true'}" aria-fields="cardCollapse${item.id}" href="#"><i class="far fa-caret-square-up fa-2x"></i></a>
	${item.title}${helpButton(item)}
	</div>
	<div  id="cardCollapse${item.id}" class="card-body p-1 card-collapse collapse ${item.collapsed?'collapsed':'show'}">
	<div class="row">
	${item.html || item.controls || ''}
	</div>
	</div>
	</div>`
	return s
}

function tab(item){
	var bActive=false
	item.tabs.forEach((tab)=>{
		if(tab.active===true){
			bActive=true
			return
		}
	})
	if(!bActive && item.tabs.length>0){
		item.tabs[0].active=true
	}
	var s=`
	<div class="col-12">
	<ul class="nav nav-tabs" role="tablist">`
	item.tabs.forEach((tab,tabIndex)=>{
		s+=`<li class="nav-item">
		<a class="nav-link ${tab.active?'active':''}" href="#formTab${item.id}${tabIndex}" role="tab" data-toggle="tab" id="IDformTab${item.id}${tabIndex}" aria-controls="formTab${item.id}${tabIndex}" aria-selected="${tab.active?'true':'false'}">
		${tab.icon?'<i class="' + tab.icon + '"></i>':''} ${tab.title || ''}
		</a>
		</li>`
	}) 
	s+=`</ul>
	<div class="tab-content" style="min-height: 70vh;overflow: auto;">`
	item.tabs.forEach((tab,tabIndex)=>{
		s+=`<div class="tab-pane ${tab.active?'show active':''}" id="formTab${item.id}${tabIndex}" role="tabpanel" aria-labelledby="IDformTab${item.id}${tabIndex}">
		<div class="row">
		${tab.controls || ''}
		</div>
		</div>`
	})
	s+=`</div>
	</div>
	`
	return s
}

function group(input,item){
	if(item.noGroup===true){
		return input
	}else{
		return `<div class="form-group ${item.col || ''} ${item.visible===false?'hidden':''}">
		<label class="m-0 p-0 ${item.required?'form-required':''}">${item.title || ''}${helpButton(item)}</label>
		${input}
		</div>`
	}
}

function formHtml(item){
	var html=''
	if(item.html){
		html=replaceUrlCurlyBracket(item.html, item) || ''
	}else{
		html=item.value
	}
	
	var s= group(html,item)
	
	return s
}

function label(item){
	script+=`
	$('#${item.id}').val(decodeURIComponent('${encodeURIComponent2(item.value || '')}'))
	`
	return group(`<label  id="${item.id}" class="m-0 p-0 ${item.class || ''}">${item.value || item.title  || item.label || item.text || ''}</label>`,item)
}

function textBox(item){
	script+=`
	$('#${item.id}').val(decodeURIComponent('${encodeURIComponent2(item.value || '')}'))
	`
	return group(`<input type="text" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${item.value || ''}">`,item)
}

function button(item){
	var label=`${item.text || ''}`
	var titleText=`${item.title || item.text || ''}`
	if(item.icon){
		label=`<i class="${item.icon}"></i> ${label}`
	}
	var s= group(`<a class="${item.class || 'btn btn-info'}" id="${item.id || ''}" href="${item.href || item.value || ''}" target="${item.target || ''}" title="${titleText}">${label}</a>`,item)
	
	return s
}

function textareaBox(item){
	var s=`
	<textarea class="form-control text-nowrap ${item.class || ''}" style="font-family: courier new"  id="${item.id}-textarea" rows="${item.rows || 4}"  placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocorrect="off" spellcheck="false"></textarea>
	<input type="hidden" id="${item.id}" name="${item.name}" >
	`
	var textAreaValue=item.value || ''
	if(item.encoding=='base64'){
		textAreaValue=b64DecodeUnicode(item.value || '')
	}

	script+=`
	$('#${item.id}-textarea').val(decodeURIComponent('${encodeURIComponent2(textAreaValue)}'))
	$('#${item.id}').val(decodeURIComponent('${encodeURIComponent2(item.value || '')}'))
	$('#${item.id}-textarea').change(()=>{
		`
		if(item.encoding=='base64'){
			script+=`$('#${item.id}').val(b64EncodeUnicode($('#${item.id}-textarea').val()))`
		}else{
			script+=`$('#${item.id}').val($('#${item.id}-textarea').val())`
		}
		script+=`	
	})
	`

	return group(s,item)
}

function imageBox(item){
	var s=`
	<div>
	<label for="fileUpload_${item.id}" class="btn btn-primary btn-image-edit"><i class="fas fa-edit"></i></label>
	<img id="${item.id}-img" class="imageBox-img" src="${item.value.data || '/img/placehold-place.jpg'}" download="${item.value.fileName || ''}">
	</div>
	<input type="file" id="fileUpload_${item.id}" style="visibility:hidden;" accept="" >
	<input type="hidden" name="${item.name}[data]" value="${item.value.data || ''}" >
	<input type="hidden" name="${item.name}[type]" value="${item.value.type || ''}" >
	<input type="hidden" name="${item.name}[fileName]" value="${item.value.fileName || ''}" >
	
	`
	
	script+=`
	$('#fileUpload_${item.id}').change(()=>{
		var files= $('#fileUpload_${item.id}').prop('files')
		if(files.length>0){
			var file =files[0]
			$('#${item.id}-img').attr('download',file.name)

			var reader  = new FileReader()
			reader.addEventListener("load", function () {
				$('#${item.id}-img').attr('src',reader.result)
				$('input[name="${item.name}[data]"]').val(reader.result)
				$('input[name="${item.name}[type]"]').val(file.type)
				$('input[name="${item.name}[fileName]"]').val(file.name)
			}, false)
			if(file){
				reader.readAsDataURL(file)
			}
		}
	})
	`

	return group(s,item)
}

function fileBox(item){
	var s=`
	<div>
	<label for="fileUpload_${item.id}" class="btn btn-primary"><i class="fas fa-file-alt"></i> Dosya seçiniz</label><br>
	<a id="fileDownload_${item.id}" class="" href="${item.value.data || '#'}" download="${item.value.fileName || ''}">${item.value.fileName?'<i class="fas fa-file-download"></i> ' + item.value.fileName:''}</a>
	</div>
	<input type="file" id="fileUpload_${item.id}" style="visibility:hidden;" accept="" >
	<input type="hidden" name="${item.name}[data]" value="${item.value.data || ''}" >
	<input type="hidden" name="${item.name}[type]" value="${item.value.type || ''}" >
	<input type="hidden" name="${item.name}[fileName]" value="${item.value.fileName || ''}" >
	
	`
	
	script+=`
	$('#fileUpload_${item.id}').change(()=>{
		var files= $('#fileUpload_${item.id}').prop('files')
		if(files.length>0){
			var file =files[0]
			$('#${item.id}-img').attr('download',file.name)

			var reader  = new FileReader()
			reader.addEventListener("load", function () {
				$('#fileDownload_${item.id}').attr('href',reader.result)
				$('#fileDownload_${item.id}').attr('download',file.name)
				$('#fileDownload_${item.id}').html('<i class="fas fa-file-download"></i> ' + file.name)
				$('input[name="${item.name}[data]"]').val(reader.result)
				$('input[name="${item.name}[type]"]').val(file.type)
				$('input[name="${item.name}[fileName]"]').val(file.name)
			}, false)
			if(file){
				reader.readAsDataURL(file)
			}
		}
	})
	`

	return group(s,item)
}

function numberBox(item){
	return group(`<input type="number" class="form-control text-right ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${item.value || 0}">`,item)
}

function dateBox(item){
	return group(`<input type="date" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${item.value || ''}">`,item)
}

function timeBox(item){
	return group(`<input type="time" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" ${item.required?'required="required"':''} ${item.readonly==true?'readonly':''} onchange="${item.onchange || ''}" autocomplete="off" autofill="off" spellcheck="false" value="${item.value || ''}">`,item)
}

function lookup(item){
	var s=`<select type="text" class="form-control ${item.class || ''}" id="${item.id}" name="${item.name}" placeholder="${item.placeholder || item.title || item.label}" autocomplete="chrome-off" ${item.required?'required="required"':''} ${item.readonly==true?'disabled':''} onchange="${item.onchange || ''}">
	<option value="" ${item.value==''?'selected':''}>${item.showAll===true?'*':'-- Seç --'}</option>`
	if(item.lookup){
		Object.keys(item.lookup).forEach((key)=>{
			s+=`<option value="${key}" ${key===item.value?'selected':''}>${item.lookup[key]}</option>`
		})
	}
	s+=`</select>`
	if(item.lookupTextField){
		s+=`<input type="hidden" name="${item.lookupTextFieldName || ''}" value="">`
		script+=`
		$('#${item.id}').on('change',()=>{
			if($('#${item.id}').val()!=''){
				$('input[name="${item.lookupTextFieldName || ''}"]').val($('#${item.id} option:selected').text())
			}else{
				$('input[name="${item.lookupTextFieldName || ''}"]').val('')
			}
		})
		`
	}

	return group(s,item)
}

function checkBoxLookup(item){

	var s=``
	
	var input=`
	<select name="${item.name}" id="${item.id}" class="form-control p-0 m-0 ${item.class || ''}">
	<option value="">*</option>
	<option value="true" ${(item.value || '').toString()=='true'?'selected':''}><i class="fas fa-check-square text-primary"></i> Evet</option>
	<option value="false" ${(item.value || '').toString()=='false'?'selected':''}><i class="far fa-square text-dark"></i> Hayır</option>
	</select>
	`
	if(item.noGroup===true){
		s=input
	}else{
		s=`<div class="form-group ${item.col || ''} ${item.visible===false?'hidden':''}">
		<label>
		<span class="mb-1" style="display:block;">${item.title || ''}${helpButton(item)}</span>
		${input}
		</label>
		</div>`
	}

	return s
}

function remoteLookup(item){
	var s=``
	var input=`
	<div class="input-group">
	<input type="search" class="form-control ${item.class || ''}" id="${item.id}-autocomplete-text"  placeholder="${item.placeholder || item.title || ''}" value="${item.valueText || ''}" autocomplete="off" autofill="off" spellcheck="false" ${item.required?'required="required"':''} ${item.readonly?'readonly':''} title="${item.title || ''}: Tümünü listelemek için boşluk tuşuna basabilirsiniz." >
	<div class="input-group-prepend">
	<div class="input-group-text"><i class="fas fa-ellipsis-v"></i></div>
	</div>
	</div>
	<input type="hidden" name="${item.name}" value="${item.value || ''}">
	<input type="hidden" id="${item.id}-obj"  value="">
	`
	if(item.lookupTextField){
		input+=`<input type="hidden" name="${item.lookupTextFieldName || ''}" value="${item.valueText || ''}">`
	}


	if(item.noGroup===true){
		s=input
	}else{
		s=`<div class="form-group ${item.col || ''} ${item.visible===false?'hidden':''}">
		<label class="m-0 p-0 ${item.required?'form-required':''}">${item.title || ''}${helpButton(item)} ${item.lookupTextField?'<span class="ml-3 bold small text-success" id="' + item.id + '-original-text"></span>':''}</label>
		${input}
		</div>
		`
	}

	script+=`
	remoteLookupAutocomplete(JSON.parse(decodeURIComponent('${encodeURIComponent2(JSON.stringify(item))}')))
	`
	return s
}

function checkBox(item){
	var s=``
	var input=`<input type="checkbox" class="${item.class || 'form-checkbox'}" id="${item.id}" name="${item.name}" value="true" ${item.value?'checked':''} ${item.readonly==true?'disabled':''} onchange="${item.onchange || ''}" />`
	if(item.noGroup===true){
		s=input
	}else{
		s=`<div class="form-group ${item.col || ''} ${item.visible===false?'hidden':''}">
		<label>
		<span class="mb-1" style="display:block;">${item.title || ''}${helpButton(item)}</span>
		${input}
		</label>
		</div>`
	}

	return s
}

function dateRangeBox(item){
	var s=`<div id="${item.id}" class="row m-0 p-0">
	<select class="form-control col-sm-4 ${item.class || ''}" name="cbDate" id="cbDate">
	<option value="">Tarih</option>
	<option value="today">Bugün</option>
	<option value="thisWeek">Bu Hafta</option>
	<option value="thisMonth">Bu Ay</option>
	<option value="lastMonth">Geçen Ay</option>
	<option value="last1Week">Son 1 Hafta</option>
	<option value="last1Month">Son 1 Ay</option>
	<option value="last3Months">Son 3 Ay</option>
	<option value="last6Months">Son 6 Ay</option>
	<option value="thisYear">Bu yıl</option>
	<option value="last1Year">Son 1 yıl</option>
	</select>
	<input type="date" name="date1" id="date1" class="form-control col-sm-4" value="${moment().format('YYYY-MM-DD')}">
	<input type="date" name="date2" id="date2" class="form-control col-sm-4" value="${moment().format('YYYY-MM-DD')}">
	</div>`

	script+=`
	
	$('#${item.id} #cbDate').on('change',cbDate_onchange)


	if((hashObj.query.cbDate || '')!='' ){
		$('#${item.id} #cbDate').val(hashObj.query.cbDate)
		if(hashObj.query.date1 || ''!=''){
			$('#${item.id} #date1').val(hashObj.query.date1)
		}
		if(hashObj.query.date2 || ''!=''){
			$('#${item.id} #date2').val(hashObj.query.date2)
		}
	}else if((hashObj.query.cbDate || '')=='' && hashObj.query.date1 && hashObj.query.date2){
		$('#${item.id} #cbDate').val('')
		$('#${item.id} #date1').val(hashObj.query.date1)
		$('#${item.id} #date2').val(hashObj.query.date2)
		
		pageSettings.setItem('cbDate','')

	}else if(pageSettings.getItem('cbDate')){
		$('#${item.id} #cbDate').val(pageSettings.getItem('cbDate'))
		cbDate_onchange()

	}else{
		if($('#${item.id} #cbDate').val()==''){
			$('#${item.id} #cbDate').val('thisMonth')
		}
	}




	function cbDate_onchange(){
		var obj=cboEasyDateChange($('#${item.id} #cbDate').val())
		$('#${item.id} #date1').val(obj.date1)
		$('#${item.id} #date2').val(obj.date2)
		pageSettings.setItem('cbDate',$('#${item.id} #cbDate').val())
	}

	`






	return group(s,item)
}



})(typeof exports === 'undefined'? this['FormControl']={}: exports)
