
$(document).ready(function(){
	$('.sidenav').sidenav();
    $('.parallax').parallax();

	$('.sidenav').sidenav().on('click tap', 'li a', () => {
		$('.sidenav').sidenav('close');
	});
	$("a").on('click', function(event) {
		if (this.hash !== "") {
			event.preventDefault();
			var target_offset = $(this.hash).offset() ? $(this.hash).offset().top : 0;
			var customoffset = 63;
			if($(window).width()<1000){ 
				var customoffset = 120;
			}
			$('html, body' ).animate({scrollTop:target_offset - customoffset}, 500);
		}
	});
});
