$(document).ready(function(){

	$(document).on('scroll', function() {
		var scrollDistance = $(this).scrollTop()
		if (scrollDistance > 100) {
			$('.scroll-to-top').fadeIn()
		} else {
			$('.scroll-to-top').fadeOut()
		}
	})

	// $(document).on('click', 'a.scroll-to-top', function(e) {
	// 	var $anchor = $(this)
	// 	$('html, body').stop().animate({
	// 		scrollTop: ($($anchor.attr('href')).offset().top)
	// 	}, 300, 'easeInOutExpo')
	// 	e.preventDefault()
	// })

	
	$('body').on('keydown', 'input, select', function(e) {
		if(e){
			if(e.key){
				if (e.key === "Enter") {
					return enterNext(this)
				}
			}
		}
	})

	$('.modal-dialog').draggable({
		handle: '.modal-header'
	})

	loadCardCollapses()

})

function scrollToTop() {
	var body = document.body
  var html = document.documentElement
	body.scrollLeft = 0
  body.scrollTop = 0
  html.scrollLeft = 0
  html.scrollTop = 0
}

function enterNext(bu){
	
	if(bu==undefined)
		bu=this
	var self = $(bu), form = self.parents('form:eq(0)'), focusable, next
	focusable = form.find('input,a,select,button,textarea').filter(':visible')
	next = focusable.eq(focusable.index(bu)+1)
	if (next.length) {
		
		var readonly=next.prop('readonly') || false
		var disabled=next.prop('disabled') || false
		var cl=next.prop('class') || ''

		if(cl.indexOf('btn-collapse')>-1 || cl.indexOf('skip-enter-next')>-1 || cl.indexOf('no-enter-next')>-1)
			return enterNext(next)

		if(readonly || disabled )
			return enterNext(next)
		

		
		next.focus()
		if(typeof next.select === 'function')
			next.select()
	} else {
		//form.submit()
	}
	return false
}
