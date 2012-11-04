// ==UserScript==
// @name        Itau2Qif
// @namespace   itau2qif
// @description Exporta fatura de cartão de crédito do banco Itaú para formato qif
// @include     http://foo.bar/*
// @version     1
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js
// ==/UserScript==

var data = {'account': {
	'visa':
	[ {'name'  : 'John Doe',
		'number': [123],
		'alias' : 'Visa - AJ'
		}, {'name'  : 'Mary Doe',
		'number': [456],
		'alias' : 'Visa - MCJ'
	}
	],
	'mastercard':
	[ {'name'  : 'John Doe',
		'number': [123],
		'alias' : 'Visa - AJ'
		}, {'name'  : 'Mary Doe',
		'number': [456],
		'alias' : 'Visa - MCJ'
	}
	]
}
};

var g$ = jQuery.noConflict();

g$(function() {
	incluirLink();
});

function incluirLink() {
	var flag = 'mastercard';
	if (g$(g$('.TRNdado')[1]).text().indexOf(data.account.visa[0].number[0])) {
		flag = 'visa';
	}
	for (i = 0; i < data.account[flag].length; i++) {
		g$('div#BOXcontainer02').append('<p class="BOXmp"><img border="0" class="BOXmps" alt="" src="/V1/UNICLASS/IMG/ico_seta6.gif"><a title="Exportar em formato qif" id="' + flag + '_' + i + '" class="menuitem">Exportar QIF ' + data.account[flag][i].name + '</a></p>');
		g$('#' + flag + '_' + i ).css('cursor', 'pointer').click(function() {
			gerarArray(this);
		});
	}
}

function gerarQif(dados, id) {
	var result = cleanData(dados);
	var str = '!Type:CCard' + "\n" 
				  + 'CX' + "\n"
				  + 'L[' + data.account[id[0]][id[1]].alias + ']' + "\n"
				  + '^' + "\n";
	for(var i=0; i < result.length; i++){
		str += 'D' + result[i][0] + "\n"
		    +  'CX' + "\n"
		    +  'T' + result[i][2] + "\n"
		    +  'P' + result[i][1] + "\n"
		    +  '^' + "\n";
	}				
	return createQif(str); 
}

function gerarArray(obj) {
	var table  = [];
	var filter = [];
	var index  = [];
	var id     = g$(obj).attr('id').split('_');
	var dep    = null;
	
	g$('form div#TRNcontainer01 table.TRNfundo tbody tr td table.TRNfundo tbody tr').each(function() {
		var da = g$(this).find('.TRNpassotextoa').text().cleanWhiteSpace();
		var dd = g$(this).find('.TRNdado_linha').text().cleanWhiteSpace();
		var dt = g$(this).find('.TRNcampo_linha').first().text().cleanWhiteSpace();
		var ds = g$(this).find('.TRNcampo_linha').last().text().cleanWhiteSpace();
		var vl = g$(this).find('.TRNtitcampo_linha').text().cleanWhiteSpace();
		var tc = g$(this).find('.TRNcampo').first().text().cleanWhiteSpace();
		var td = g$(this).find('.TRNdado').last().text().cleanWhiteSpace();
		var tl = g$(this).find('.TRNtitcampo').text().cleanWhiteSpace();
		if (da) {
			table.push([da]);
		}
		if (dd) {
			table.push([dd]);
		}
		if (dt && ds && vl) {
			table.push([dt, ds, vl]);
		}
		if (tc && td && tl) {
			table.push([tc, td, tl]);
		}
		if (dd && vl) {
			table.push([dd, vl]);
		}
	}
	);
	
	for (var i = 0; i < table.length; i++) {
		if (table[i].indexOf('Movimentações') != -1) {
			index.push(i);
		}
		if (table[i].indexOf('Lançamentos nacionais') != -1) {
			index.push(i);
		}
		if (table[i].indexOf('Compras parceladas - próximas faturas') != -1) {
			index.push(i);
		}
		if (table[i].indexOf('Lançamentos internacionais') != -1) {
			index.push(i);
		}
		if (table[i].indexOf('Dólar utilizado para conversão em R$ 1') != -1) {
			index.push(i + 2);
		}
	}
	
	for (var j = 0; j < index.length; j++) {
		var jj        = j + 1;
		filter[j]     = [];
		if (typeof(index[jj]) != 'undefined') {
			for (var i = index[j]; i < index[jj]; i++) {
				filter[j].push(table[i]);
			}
		}
	}
	
	for (var i=0; i < filter.length; i++) {
		filter[i].forEach(function(element, index, array) {
			if (typeof(element) != 'undefined') {
				for (var j=0; j < element.length; j++) {
					if (element[j].indexOf(data.account[id[0]][1].number[0]) != -1) {
						dep = i;
					}
				}
			}
		});
	}
	if(dep > 0 && id[1] == 1 ){
		return gerarQif(filter[dep], id);
	}
}

function cleanData(dados) {
	var result = [];
	for(var i=0; i < dados.length; i++){
		if(dados[i].length == 3){
			result.push([
				dados[i][0].toQifDate(),
				dados[i][1].toProperCase(),
				(dados[i][2].toNumber() * -1).toFixed(2)
			]);	
		}
	}
	return result;
}

String.prototype.toProperCase = function () {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

String.prototype.toNumber = function () {
	var n = this.replace(/\./g, '');
	return n.replace(/,/g, '.');
};

String.prototype.toQifDate = function () {
	var d = new Date();
	//return this.replace(/0([0-9])/g, '$1') + "'" + d.getFullYear().toString().substr(2);
	return this + "/" + d.getFullYear().toString().substr(2);
};

String.prototype.cleanWhiteSpace = function () {
	return this.trim().replace(/[\t\s]+/g, ' ');
};

function createQif(str) {
	location.href = "http://sgd.com.br/file.php?qif=" + encodeURI(str);
}