
$(document).ready(function(){
	$('.sidenav').sidenav();
    $('.parallax').parallax();

	$('.sidenav').sidenav().on('click tap', 'li a', () => {
		$('.sidenav').sidenav('close');
	});
	
	
	/*$("a").on('click', function(event) {
		if (this.hash !== "") {
			event.preventDefault();
			var target_offset = $(this.hash).offset() ? $(this.hash).offset().top : 0;
			var customoffset = 63;
			if($(window).width()<1000){ 
				var customoffset = 120;
			}
			$('html, body' ).animate({scrollTop:target_offset - customoffset}, 500);
		}
	});*/
});

document.addEventListener('DOMContentLoaded', function() {
		var elems = document.querySelectorAll('.collapsible');
		var instances = M.Collapsible.init(elems, {
		  // specify options here
		});
		
		var elems = document.querySelectorAll('.modal');
		var instances = M.Modal.init(elems, {
		  dismissible: false
		});
		
		var elem = document.querySelector('#modal1');
		var instance = M.Modal.getInstance(elem);
		instance.open();
		
});

function updateList() {
  var input = document.getElementById('file');
  var output = document.getElementById('fileList');

  output.innerHTML = '<ul>';
  for (var i = 0; i < input.files.length; ++i) {
    output.innerHTML += '<li>' + input.files.item(i).name + '</li>';
  }
  output.innerHTML += '</ul>';
}

$(function () {
	
	$("#calculado").hide();
	
	$("#upload").bind("click", function () {

		var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xml)$/;
		if (regex.test($("#fileUpload").val().toLowerCase())) {
			if (typeof (FileReader) != "undefined") {
				
				var tipos_iva = [0,1,2,4,8,13]
				var suma_subtotales = {}
				var suma_ivas = {}
				var suma_totales = {}
				
				tipos_iva.forEach(function(tipo) {
					suma_subtotales[tipo] = 0.00;
					suma_ivas[tipo] = 0.00;
					suma_totales[tipo] = 0.00;
				});
								
				for (var i = 0; i < $("#fileUpload")[0].files.length; ++i) {
					var reader = new FileReader();
					reader.onload = function (e) {
						var xmlDoc = $.parseXML(e.target.result);
						var lineas = $(xmlDoc).find("LineaDetalle");
						var otros_cargos = $(xmlDoc).find("OtrosCargos");
						var emisor = $(xmlDoc).find("Emisor").children("Nombre").text();
						var consecutivo = $(xmlDoc).find("NumeroConsecutivo");
						
						//** SUMA DE LINEAS DE DETALLE **//
						$(lineas).each(function () {
							
							//**TABLA DE DETALLE DE FACTURAS**/
							var row = $("<tr />");
							add_cell_text(row, emisor);
							add_cell_text(row, consecutivo.text());
							add_cell_text(row, $(this).children("Detalle").text());
							let subtotal_float = parseFloat($(this).children("SubTotal").text());
							add_cell_amount_float(row, subtotal_float);
							
							let tarifa_int = 0;
							if($(this).children("Impuesto").length > 0){	
								tarifa = $(this).children("Impuesto").children("Tarifa").text();
								tarifa_int= parseInt(tarifa);							
							}	
							add_cell_amount_float(row, tarifa_int);
							let impuesto_neto_float = parseFloat($(this).children("ImpuestoNeto").text())
							add_cell_amount_float(row, impuesto_neto_float);
							let monto_total_float = parseFloat($(this).children("MontoTotalLinea").text());
							add_cell_amount_float(row, monto_total_float);						
							
							var dvTable = $("#tabla_detalles_contenido");
							dvTable.append(row);
							
							/** SUMANDO PARA TOTALES **/
							suma_subtotales[tarifa_int] += subtotal_float;
							suma_ivas[tarifa_int] += impuesto_neto_float;
							suma_totales[tarifa_int] += monto_total_float;							
							
						});
						
						
						//** SUMA DE OTROS CARGOS **//
						$(otros_cargos).each(function () {
							var row = $("<tr />");							
							add_cell_text(row, emisor);
							add_cell_text(consecutivo.text());
							add_cell_text($(this).children("Detalle").text());
							let subtotal_float = parseFloat($(this).children("MontoCargo").text());
							add_cell_amount_float(row, subtotal_float);
							
							let tarifa_int = 0;
							if($(this).children("Impuesto").length > 0){	
								tarifa = $(this).children("Impuesto").children("Tarifa").text();
								tarifa_int= parseInt(tarifa);							
							}
							add_cell_amount_int(row, tarifa_int);	
							let impuesto_neto_float = 0.00;
							add_cell_amount_float(row, impuesto_neto_float);
							let monto_total_float = parseFloat($(this).children("MontoCargo").text());
							add_cell_amount_float(row, monto_total_float);
							
							var dvTable = $("#tabla_detalles_contenido");
							dvTable.append(row);
							
							/** SUMANDO PARA TOTALES **/
							suma_subtotales[tarifa_int] += subtotal_float;
							suma_ivas[tarifa_int] += impuesto_neto_float;
							suma_totales[tarifa_int] += monto_total_float;						
							
						});						
					}
					
					
					/***** IMPRIME TOTALES DE FACTURAS *****/
					reader.readAsText($("#fileUpload")[0].files[i]);
					reader.onloadend = function(){
						
						var total = $("#tabla_suma_impuestos_contenido");
						total.html("");
						
						/**IMPRIME IVA**/
						$("#tabla_suma_impuestos_contenido").html("");
						var row = $("<tr />");						
						let total_ivas = 0.00;
						for (let key in suma_ivas){
							add_cell_amount_float(row, suma_ivas[key]);
							total_ivas += suma_ivas[key];
						}
						add_cell_amount_float(row, total_ivas);
						total.append(row);
									
						/**IMPRIME SUBTOTALES**/
						var total = $("#tabla_suma_subtotal_contenido");
						total.html("");
						var row = $("<tr />");						
						let total_subtotales = 0.00;
						for (let key in suma_subtotales){
							add_cell_amount_float(row, suma_subtotales[key]);
							total_subtotales += suma_subtotales[key];
						}
						add_cell_amount_float(row, total_subtotales);
						total.append(row);					
						
						
						/**IMPRIME TOTALES**/
						var total = $("#tabla_suma_total_contenido");
						total.html("");
						var row = $("<tr />");						
						let total_totales = 0.00;
						for (let key in suma_totales){
							add_cell_amount_float(row, suma_totales[key]);
							total_totales += suma_totales[key];
						}
						add_cell_amount_float(row, total_totales);
						total.append(row);
					};
				}
				$("#calculado").show();
				
				
			} else {
				alert("This browser does not support HTML5.");
			}
		} else {
			alert("Seleccione un archivo xml válido.");
		}
	});
});


function round(amount){
	return Number((amount).toFixed(2));
}

function add_cell_amount_float(row, td_amount){
	let cell = $("<td class='number_column' />");
	cell.html(round(td_amount));
	row.append(cell);
}

function add_cell_amount_int(row, td_amount){
	let cell = $("<td class='number_column' />");
	cell.html(td_amount);
	row.append(cell);
}

function add_cell_text(row, td_text){
	let cell = $("<td />");
	cell.html(td_text);
	row.append(cell);
}