let bricksNumber,
itemList = [];

$('#inputNumber').on('change', function() {
	bricksNumber = Number(this.value)

	let i, width = 0;

	for (i = 0; i < bricksNumber; i++) {
		if (i == 0){
			width = 1	
		}
		else {
			width += 2			
		}
		itemList.push({
			position: 2,
			queueNumber: i + 1,
			width: width
		})	
	}
	console.log('itemList = ')		
	console.log(itemList)
	render()	
})

function render() {
	$('.bricksList').empty()
	let i;
	for (i = 0; i < bricksNumber; i++){
		$('.bricksList').prepend(`
			<div class="item" data-item-index="${i}" style="border: 1px solid red;
			cursor: pointer;
			background: blue;
			padding: 25px 0;
			width: ${itemList[i].width * 35}px;
			position: absolute;
			left: calc(${itemList[i].position * 25}% - ${i * 35}px - 35px);
			top: ${itemList[i].queueNumber * 50 + 200}px;
			z-index: 1000;"></div>
			`)
	};
}

let doc = $(document),
		item = $('.item');

doc.on('mousedown', '.item', function(e) {
	let coords = getCoords(this),
			thisItem = this,
			itemIndex = $(this).data('item-index'),
			shiftX = e.pageX - coords.left,
			shiftY = e.pageY - coords.top;

	thisItem.style.position = 'absolute';
	document.body.appendChild(thisItem);
	moveAt(e);

	function moveAt(e) {
		thisItem.style.left = e.pageX - shiftX + 'px';
		thisItem.style.top = e.pageY - shiftY + 'px';

		if (e.pageX - shiftX <= document.documentElement.clientWidth * (0.25 + 0.125)){
			console.clear()
			console.log(document.documentElement.clientWidth * (0.25 + 0.125))
			console.log('Position')
			console.log(itemList[itemIndex].position)
			if (itemList[itemIndex].position == 1) {
				//Stop
			}
			else {
				itemList[itemIndex].position = 1;
				// render()
			}
		}
		else if (e.pageX - shiftX <= document.documentElement.clientWidth * (0.5 + 0.125)){
			console.clear()
			console.log(document.documentElement.clientWidth * (0.5 + 0.125))
			console.log('Position')
			console.log(itemList[itemIndex].position)
			if (itemList[itemIndex].position == 2) {
				//Stop
			}
			else {
				itemList[itemIndex].position = 2;
				// render()
			}
		}		
		else if (e.pageX - shiftX <= document.documentElement.clientWidth){
			console.clear()
			console.log(document.documentElement.clientWidth)
			console.log('Position')			
			console.log(itemList[itemIndex].position)
			if (itemList[itemIndex].position == 3) {
				//Stop
			}
			else {
				itemList[itemIndex].position = 3;
				// render()
			}
		}
	}

	doc.on('mousemove', function(e) {
		moveAt(e);
	});
	/*thisItem.onmouseup = function() {
		document.onmousemove = null;
		thisItem.onmouseup = null;
	}*/
});

doc.on('dragstart', '.item', function() {
	return false;
});

function getCoords(elem) {	 // кроме IE8-
	let box = elem.getBoundingClientRect();
	return {
		top: box.top + pageYOffset,
		left: box.left + pageXOffset
	};
}