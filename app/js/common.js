let bricksNumber,
qWins = 0,
qMove = 0,
startTimer = false,
seconds = 0,
minutes = 0,
hours = 0,
scoresList = [],
scoreNow = 0,
bestScore = 0,
startPos = 1,
itemList = [],
towerList = [{
	queue: 0,
	indexList: []
},
{
	queue: 0,
	indexList: []
},
{
	queue: 0,
	indexList: []
}],
doc = document;

let localStorageItem = localStorage.getItem("itemList"),
		localStorageTower = localStorage.getItem("towerList");

if (localStorageItem != null) {
	itemList = JSON.parse(localStorageItem);
	render()
}
if (localStorageTower != null) {
	towerList = JSON.parse(localStorageTower);
	render()
}

function addToLocal() {
	localStorage.clear();
	localStorage.setItem("towerList", JSON.stringify(towerList));
	localStorage.setItem("itemList", JSON.stringify(itemList));
	localStorage.setItem("qWins", JSON.stringify(qWins));
}

function timeRender() {
	$('.time').empty()
	$('.time').prepend(`
		<p>Time: ${minutes}:${seconds}</p>
		`)	
}

function timer () {
	setInterval(function() {
		seconds++
		if (seconds % 60 == 0) {
			seconds = 0
			minutes++
		};
		timeRender()
	}, 1000)	
}

let inputNumber = doc.getElementById('inputNumber')

inputNumber.onchange = function() {
	timeRender()
	timer()

	bricksNumber = Number(this.value)
	towerList[1].queue = bricksNumber
	itemList = [];

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
		towerList[1].indexList.push(i)
	}
	render()
}

function render() {
	bricksList = doc.getElementsByClassName('bricksList');
	$('.bricksList').empty()
	let i;
	for (i = 0; i < bricksNumber; i++){

		$('.bricksList').prepend(`
			<div class="item draggable" data-item-index="${i}" style="border: 1px solid red;
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
	$('.move').empty()
	$('.move').prepend(`
		<p>Moves: ${qMove}</p>
		`)
	$('.wins').empty()
	$('.wins').prepend(`
		<p>Wins: ${qWins}</p>
		`)	
}
// top: ${itemList[i].queueNumber * 50 + 200}px;


var DragManager = new function() {

	/**
	 * составной объект для хранения информации о переносе:
	 * {
	 *	 elem - элемент, на котором была зажата мышь
	 *	 avatar - аватар
	 *	 downX/downY - координаты, на которых был mousedown
	 *	 shiftX/shiftY - относительный сдвиг курсора от угла элемента
	 * }
	 */
	let dragObject = {};

	let self = this;

	function onMouseDown(e) {

		if (e.which != 1) return;

		var elem = e.target.closest('.draggable');
		if (!elem) return;

		dragObject.elem = elem;

		// запомним, что элемент нажат на текущих координатах pageX/pageY
		dragObject.downX = e.pageX;
		dragObject.downY = e.pageY;

		return false;
	}

	function onMouseMove(e) {
		if (!dragObject.elem) return; // элемент не зажат

		if (!dragObject.avatar) { // если перенос не начат...
			let moveX = e.pageX - dragObject.downX;
			let moveY = e.pageY - dragObject.downY;

			// если мышь передвинулась в нажатом состоянии недостаточно далеко
			if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
				return;
			}

			// начинаем перенос
			dragObject.avatar = createAvatar(e); // создать аватар
			if (!dragObject.avatar) { // отмена переноса, нельзя "захватить" за эту часть элемента
				dragObject = {}; //очистить процес перемищения
				return;
			}

			// аватар создан успешно
			// создать вспомогательные свойства shiftX/shiftY
			let coords = getCoords(dragObject.avatar);
			dragObject.shiftX = dragObject.downX - coords.left;
			dragObject.shiftY = dragObject.downY - coords.top;

			startDrag(e); // отобразить начало переноса
		}

		// отобразить перенос объекта при каждом движении мыши
		dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
		dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';

		return false;
	}

	function onMouseUp(e) {
		if (dragObject.avatar) { // если перенос идет
			finishDrag(e);
		}

		// перенос либо не начинался, либо завершился
		// в любом случае очистим "состояние переноса" dragObject
		dragObject = {};
	}

	function finishDrag(e) {
		var dropElem = findDroppable(e);

		if (!dropElem) {
			self.onDragCancel(dragObject);
		} else {
			self.onDragEnd(dragObject, dropElem);
		}
	}

	function createAvatar(e) {

		// запомнить старые свойства, чтобы вернуться к ним при отмене переноса
		let avatar = dragObject.elem;
		var old = {
			parent: avatar.parentNode,
			nextSibling: avatar.nextSibling,
			position: avatar.position || '',
			left: avatar.left || '',
			top: avatar.top || '',
			zIndex: avatar.zIndex || ''
		};

		// функция для отмены переноса
		avatar.rollback = function() {
			old.parent.insertBefore(avatar, old.nextSibling);
			// old.parent.removeChild(avatar)
			avatar.style.position = old.position;
			avatar.style.left = old.left;
			avatar.style.top = old.top;
			avatar.style.zIndex = old.zIndex
		};

		return avatar;
	}

	function startDrag(e) {
		let avatar = dragObject.avatar;

		// инициировать начало переноса
		document.body.appendChild(avatar);
		avatar.style.zIndex = 9999;
		avatar.style.position = 'absolute';
	}

	function findDroppable(event) {
		// спрячем переносимый элемент
		dragObject.avatar.hidden = true;

		// получить самый вложенный элемент под курсором мыши
		var elem = document.elementFromPoint(event.clientX, event.clientY);

		// показать переносимый элемент обратно
		dragObject.avatar.hidden = false;

		if (elem == null) {
			// такое возможно, если курсор мыши "вылетел" за границу окна
			return null;
		}

		return elem.closest('.droppable');
	}

	document.onmousemove = onMouseMove;
	document.onmouseup = onMouseUp;
	document.onmousedown = onMouseDown;

	this.onDragEnd = function(dragObject, dropElem) {
		let itemIndex;
		itemIndex = dragObject.elem.getAttribute('data-item-index');

		let itemPosition;
		itemPosition = itemList[itemIndex].position;		

		let itemWidth;
		itemWidth = itemList[itemIndex].width;

		let tower;
		tower = findDroppable(event);

		let towerIndex;		
		towerIndex = tower.getAttribute('data-tower-number');

		if (towerList[itemPosition - 1] != towerList[towerIndex - 1]) {
			if (towerList[itemPosition - 1].indexList[0] == Number(itemIndex)) {
				if (towerList[towerIndex - 1].indexList.length == 0 || Number(itemIndex) < towerList[towerIndex - 1].indexList[0]) {
					qMove += 1

					towerList[itemPosition - 1].queue -= 1 //Башня, з якої переносили
					itemList[itemIndex].position = Number(towerIndex);
					towerList[towerIndex - 1].queue += 1; //Башня, на яку переносили

					itemList[itemIndex].queueNumber = bricksNumber - towerList[towerIndex - 1].queue + 1
					towerList[towerIndex - 1].indexList.unshift(Number(itemIndex))
					towerList[itemPosition - 1].indexList.splice(0, 1)
				}		
			}
		}
		if (towerList[towerIndex - 1].indexList.length == bricksNumber) {
			let winWindow = document.getElementsByClassName('win-window');
			console.log(winWindow)
			if (towerList[towerIndex - 1].indexList[0] != startPos) {
				qWins++
				$('.win-window').empty()
				$('.win-window').prepend(`
					<div style="background: #FF7171;
											z-index: 100000;
											position: fixed;
											display: flex;
											justify-content: center;
											align-items: center;
											flex-flow: column;
											width: 100%;
											height: 100%;
											height: 500px;
											">

						<p style="font-size: 100px;
											color: yellow;">
							WIN!
						</p>
						<p style="font-size: 50px;
											color: red;">
							Score: ${scoreNow}
						</p>						
					</div>
					`)					
			}
		}
		// addToLocal()
		render()
		dragObject.elem.hidden = true;
		dragObject = {};
	};

	this.onDragCancel = function(dragObject) {
		// откат переноса
		dragObject.avatar.rollback();
		dragObject.elem.hidden = true;
		dragObject = {};
		render();
	};
};


function getCoords(elem) { // кроме IE8-
	let box = elem.getBoundingClientRect();

	return {
		top: box.top + pageYOffset,
		left: box.left + pageXOffset
	};
}