var APIkey = "8419a2a8c50e67785c267ba151a18805";
var APIsecret = "aabc5dd6925ce6a9";

var timer = 0;
var page = 1;
var mouseDown = 0;
var moveTimer = 0;
var resizeTimer = 0;
var viewPort = document.documentElement.clientWidth;
var booPolling = false;
var buffer = 400;
var logging = false;

var apiArray = {
	method: 'flickr.photos.search',
	api_key: APIkey,
	safe_search: 1,
	content_type: 1,
	page: page,
	per_page: 5,
	sort: 'relevance'
};

var divWrap;
var xStart, xEnd;
var d1, d2;
var speed = 500;
//var counter = 0;

$(document).ready(function(){
	$('body').css({height: $(window).height() + 'px'});
	var inpSearch = $('.watermark');
	inpSearch.bind('keypress',function(e){
		if (e.keyCode === 13){
			$('#btnSearch').trigger('click');
		}
	})
	divWrap = $('#divPhotoWrap');
	$(document).on('touchstart','#divPhotoWrap',function(event){
		if (logging){
			$('#gesture').html('touch start');
		}
		var e = event.originalEvent;
		d1 = new Date().getTime();
		e.preventDefault();
		xStart = e.touches[0].clientX;
		if (logging){
			$('#pos').html(xStart.toString());
		}
	})
	.on('touchmove','#divPhotoWrap',function(){
		var e = event.originalEvent;
		//e.preventDefault();
		if (logging){
			$('#gesture').html('touch move');
		}
		var touch = e.changedTouches[0] || e.touches[0];
		//xEnd = e.touches[0].pageX;
		//xEnd = touch.pageX;
		//$('#pos').html(xEnd.toString());
		//counter +=1;
	})
	.on('touchend','#divPhotoWrap',function(event){
		if (logging){
			$('#gesture').html('touch end');
		}
		var e = event.originalEvent;
		e.preventDefault();
		d2 = new Date().getTime();
		var time = d2 - d1;
		xEnd = e.changedTouches[0].clientX;
		xPos = xEnd - xStart;

		switch (true){
			case xPos < 50:
				speed = speed;
			break;
			case xPos < 100:
				speed = 700;
			break;
			case xPos < 150:
				speed = 900;
			break;
			case xPos < 200:
				speed = 1100;
			break;
			default:
				speed = 1300;
		}

		var velocity = Math.abs(xPos/time);
		if (logging){
			$('#count').html(velocity.toString());
		}
		if (velocity > 1){
			velocity = (velocity * velocity);
			if (velocity > 5){
				velocity = 5;
			}
			xPos = Math.round(xPos * (velocity));
		}
		x = parseInt(divWrap.position().left,10);
		x += xPos;
		//divWrap.css({left: x.toString() + 'px'});

		divWrap.animate({left: x.toString() + 'px'},speed, 'easeOutQuart');
		if (divWrap.width() + x <= viewPort + buffer && !booPolling){
			booPolling = true;
			getPhotos();
		}
		if (logging){
			$('#pos').html(xEnd.toString());
		}
	});
	if (inpSearch.val().length === 0){
		inpSearch.val(inpSearch.data('watermark'))
	}
	inpSearch.on('focus',function(){
		var $this = $(this);
		if (this.value === $this.data('watermark')){
			this.value = '';
			$this.removeClass('gray');
		}
	})
	.on('blur',function(){
		var $this = $(this);
		if (this.value.length === 0){
			this.value = $this.data('watermark');
			$this.addClass('gray');
		}
	}).focus();

	$('#btnSearch').on('click',function(){
		if (inpSearch.val().length === 0 || inpSearch.val() === inpSearch.data('watermark')){
			var spnWarning = $('#spnWarning').css({display:'inline'});
			if (timer){
				clearTimeout(timer);
			}
			timer = setTimeout(function(){
				spnWarning.fadeOut(1000,function(){
					spnWarning.removeAttr('style')
				});
			},1000);
		} else {
			getPhotos(inpSearch.val().trim());
		}
	});
	$('#btnRight').bind('click',function(){
		var x = parseInt(divWrap.position().left,10);
		x -= 100;
		divWrap.css({left:x.toString() + 'px'});
		if (divWrap.width() + x <= viewPort + buffer && !booPolling){
			getPhotos();
		}
	})
	.bind('mousedown',function(){
		mouseDown = setTimeout(moveRight,1000);
	})
	.bind('mouseup',function(){
		if (mouseDown){
			clearTimeout(mouseDown);
			mouseDown = 0;
		}
	})
	.bind('mouseleave',function(){
		if (mouseDown){
			clearTimeout(mouseDown);
			mouseDown = 0;
		}
	});
	$('#btnLeft').bind('click',function(){
		var x = parseInt(divWrap.position().left,10);
		x += 100;
		if (x > 0){
			return;
		}
		divWrap.css({left:x.toString() + 'px'});
		if (divWrap.width() + x <= viewPort + buffer && !booPolling){
			getPhotos();
		}
	})
	.bind('mousedown',function(){
		mouseDown = setTimeout(moveLeft,1000);
	})
	.bind('mouseup',function(){
		if (mouseDown){
			clearTimeout(mouseDown);
			mouseDown = 0;
		}
	})
	.bind('mouseleave',function(){
		if (mouseDown){
			clearTimeout(mouseDown);
			mouseDown = 0;
		}
	});
});

function moveRight(){
	if (mouseDown){
		var x = parseInt(divWrap.position().left,10);
		x -= 100;
		divWrap.css({left:x.toString() + 'px'});
				if (divWrap.width() + x <= viewPort + buffer && !booPolling){
			booPolling = true;
			getPhotos();
		}
		moveTimer = setTimeout(moveRight,100);
	} else {
		clearTimeout(moveTimer);
	}
}

function moveLeft(){
	if (mouseDown){
		var x = parseInt(divWrap.position().left,10);
		x += 100;
		if (x >= 60){
			return;
		}
		divWrap.css({left:x.toString() + 'px'});
		//console.log('wrap width: ' + divWrap.width() + ' viewport: ' + viewPort + ' xPos: ' + x.toString());

		moveTimer = setTimeout(moveLeft,100);
	} else {
		clearTimeout(moveTimer);
	}
}

/*
 <photo id="2636" owner="47058503995@N01" secret="a123456" server="2" title="test_04" ispublic="1" isfriend="0" isfamily="0" />
 http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
*/

var imgURL = 'https://farm--FARMID--.staticflickr.com/--SERVERID--/--ID--_--SECRET--.jpg';

// Changes XML to JSON
function xml2bf(node) {
    var json = {};
    var cloneNS = function(ns) {
        var nns = {};
        for (var n in ns) {
            if (ns.hasOwnProperty(n)) {
                nns[n] = ns[n];
            }
        }
        return nns;
    };
    var process = function (node, obj, ns) {
        if (node.nodeType === 3) {
            if (!node.nodeValue.match(/[\S]+/)) return;
            if (obj["$"] instanceof Array) {
                obj["$"].push(node.nodeValue);
            } else if (obj["$"] instanceof Object) {
                obj["$"] = [obj["$"], node.nodeValue];
            } else {
                obj["$"] = node.nodeValue;
            }
        } else if (node.nodeType === 1) {
            var p = {};
            var nodeName = node.nodeName;
            for (var i = 0; node.attributes && i < node.attributes.length; i++) {
                var attr = node.attributes[i];
                var name = attr.nodeName;
                var value = attr.nodeValue;
                if (name === "xmlns") {
                    ns["$"] = value;
                } else if (name.indexOf("xmlns:") === 0) {
                    ns[name.substr(name.indexOf(":") + 1)] = value;
                } else {
                    p["@" + name] = value;
                }
            }
            for (var prefix in ns) {
                if (ns.hasOwnProperty(prefix)) {
                    p["@xmlns"] = p["@xmlns"] || {};
                    p["@xmlns"][prefix] = ns[prefix];
                }
            }
            if (obj[nodeName] instanceof Array) {
                obj[nodeName].push(p);
            } else if (obj[nodeName] instanceof Object) {
                obj[nodeName] = [obj[nodeName], p];
            } else {
                obj[nodeName] = p;
            }
            for (var j = 0; j < node.childNodes.length; j++) {
                process(node.childNodes[j], p, cloneNS(ns));
            }
        } else if (node.nodeType === 9) {
            for (var k = 0; k < node.childNodes.length; k++) {
                process(node.childNodes[k], obj, cloneNS(ns));
            }
        }
    };
    process(node, json, {});
    return json;
}

function getPhotos(SearchTerm){
	console.log('polling start');
	booPolling = true;
	if (SearchTerm){
		apiArray.text = SearchTerm;
	}
	apiArray.page = page;
	apiArray.tags = SearchTerm;
	$.ajax({
		url: 'https://api.flickr.com/services/rest/',
		async: true,
		data: apiArray,
		dataType: 'xml',
		success: function(xml){
			photoCollection = $(xml).find('photo');
				for (var i = 0, l = photoCollection.length; i < l; i++){
					var attribs = photoCollection[i].attributes;
					var src = imgURL;
					src = src.replace('--FARMID--',attribs['farm'].value)
						.replace('--SERVERID--',attribs['server'].value)
						.replace('--ID--',attribs['id'].value)
						.replace('--SECRET--',attribs['secret'].value);
					var img = new Image();
					img.src = src;
					if (i < l - 1){
						$(img).bind('load',function(){
							var h = Math.round((400 - parseInt(this.clientHeight,10))/2);
							if (h > 0){
								this.style.marginTop = h.toString() + 'px';
							}
							this.className = 'displayed';
						});
					} else {
						$(img).bind('load',function(){
							var h = Math.round((400 - parseInt(this.clientHeight,10))/2);
							if (h > 0){
								this.style.marginTop = h.toString() + 'px';
							}
							this.className = 'displayed';
							booPolling = false;
							console.log('polling stop');
						});
					}
					var divFrame = document.createElement('div');
					divFrame.className = 'divPhotoFrame';
					divFrame.appendChild(img);
					$('#divPhotoWrap').append(divFrame);
				}
			page +=1;
			//if (viewPort > 600){
				$('.arrow').removeClass('displayNone');
			//}
		},
		error: function(jqXHR, textStatus, errorThrown){
			alert(textStatus);
			booPolling = false;
			console.log('polling error');
		}
	});
}
