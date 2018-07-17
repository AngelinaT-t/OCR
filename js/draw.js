function Draw() {
	this.el = undefined;
	//   this.leftPos = 0;
	//   this.topPos = 0;
	this.w = 0;
	this.h = 0;
	this.recting = false; //是否正在绘制矩形
	this.rectSX = 0;
	this.rectSY = 0;
	this.rectEX = 0;
	this.rectEY = 0;
	this.rectW = 0;
	this.rectH = 0;
	this.rect = undefined;
	this.rectDatas = [];

	this.isPicking = false;
	this.isCaling = false;
	this.startEle = undefined;
	this.endEle = undefined;
	this.lineEle = undefined;
	this.tmpLine = undefined;
	this.startData = { x: "", y: "", dir: "" };
	this.endData = { x: "", y: "", dir: "" };
	this.prepareLine = undefined;
	this.init = op => {
		var el,
			w,
			h,
			error = false,
			erMsg = "";
		!op.elementID && (error = true) && (erMsg = "el不能为空");
		!op.width && (error = true) && (erMsg = "width不能为空");
		!op.height && (error = true) && (erMsg = "height不能为空");
		if (error) {
			console.log(erMsg);
			return;
		}
		this.el = document.getElementById(op.elementID);

		this.w = op.width;
		this.h = op.height;
		this.prepareLine = op.prepareLine;
		this.el.setAttribute("width", this.w);
		this.el.setAttribute("height", this.h);

		this.el.addEventListener("mousedown", this.mouseDownOnSvg);
		this.el.addEventListener("mousemove", this.mouseMoveOnSvg);
		this.el.addEventListener("mouseup", this.mouseUpOnSvg);
		// this.el.addEventListener("click", this.mouseClickOnSvg);
	};

	this.getRects = () => {
		return this.rectDatas;
	};

	//选点相关
	// this.setPick = type => {
	// 	this.pick = type;
	// };
	//绘制svg的mouse事件
	this.mouseDownOnSvg = event => {
		if (this.isPicking) return;
		if (event.which !== 1) return;
		this.rectSX = event.offsetX;
		this.rectSY = event.offsetY;
		this.recting = true;
	};

	this.mouseMoveOnSvg = event => {
		if (this.recting) {
			this.rectEX = event.offsetX;
			this.rectEY = event.offsetY;

			let w = this.rectEX - this.rectSX,
				h = this.rectEY - this.rectSY,
				x,
				y;

			if (!(Math.abs(w) > 5) || !(Math.abs(h) > 5)) return;
			if (!this.rect) {
				this.rect = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"rect"
				);
				this.el.appendChild(this.rect);
				// this.rect.addEventListener("mousedown", function(e) {
				// 	e.stopPropagation();
				// });
			}
			this.rectW = Math.abs(w);
			this.rectH = Math.abs(h);
			if (w < 0) {
				x = this.rectEX;
			} else {
				x = this.rectSX;
			}
			if (h < 0) {
				y = this.rectEY;
			} else {
				y = this.rectSY;
			}

			setRect(this.rect, x, y, this.rectW, this.rectH);
		} else if (this.isPicking) {
			this.endData.x = event.offsetX;
			this.endData.y = event.offsetY;
			let tmpPath = getTempPath(this.startData,this.startData.dir, this.endData);
			this.drawPath(
				tmpPath,
				this.startData.y,
				this.startData.x,
				this.endData.y,
				this.endData.x,
				true
			);
		}
	};
	this.mouseUpOnSvg = event => {
		if (!this.isPicking) {
			if (!this.recting || this.rectW == 0 || this.rectH == 0) {
				this.initRect();
				return;
			}
			if (event.which === 3) {
				this.el.removeChild(this.rect);
				this.initRect();
				return;
			}
			let data = [];
			if (this.rectEX < this.rectSX) {
				data.push(this.rectEX);
			} else {
				data.push(this.rectSX);
			}
			if (this.rectEY < this.rectSY) {
				data.push(this.rectEY);
			} else {
				data.push(this.rectSY);
			}
			data.push(this.rectW);
			data.push(this.rectH);
			this.rectDatas.push(data);
			this.addRectMask(...data);
			this.initRect();
		} else {
			this.isPicking = false;
			if (this.tmpLine) {
				this.el.removeChild(this.tmpLine);
				this.tmpLine = null;
			}
		}
	};

	this.initRect = () => {
		this.recting = false;
		this.rect = undefined;
		this.rectW = 0;
		this.rectH = 0;
	};

	//设置svg rect的属性
	function setRect(rect, x, y, w, h, strokeClr) {
		rect.setAttribute("x", x);
		rect.setAttribute("y", y);
		rect.setAttribute("width", w);
		rect.setAttribute("height", h);
		if (!strokeClr) {
			rect.setAttribute("stroke", "black");
		} else {
			rect.setAttribute("stroke", strokeClr);
		}
		rect.setAttribute("fill", "transparent");
	}

	//为rect每个border添加mask，获取点击事件
	this.addRectMask = (x, y, w, h) => {
		let masks = { top: "", right: "", bottom: "", left: "" };
		for (let key in masks) {
			masks[key] = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"rect"
			);
			masks[key].addEventListener("mousedown", this.maskMouseDown);
			masks[key].addEventListener("mouseover", this.maskMouseOver);
			masks[key].addEventListener("mousemove", this.maskMouseMove);
			masks[key].addEventListener("mouseup", this.maskMouseUp);
			masks[key].addEventListener("click", this.maskClick);
			masks[key].addEventListener("mouseenter", this.maskMouseEnter);
			// masks[key].addEventListener("dbclick", this.maskClick);

			masks[key].style.opacity = 0;
			masks[key].style.userSelect = "none";
			this.el.appendChild(masks[key]);
			switch (key) {
				case "top": {
					setRect(masks[key], x, y - 10, w, 20, "white");
					masks[key].setAttribute("dir", "top");
					break;
				}
				case "right": {
					setRect(masks[key], x + w - 10, y, 20, h, "white");
					masks[key].setAttribute("dir", "right");
					break;
				}
				case "bottom": {
					setRect(masks[key], x, y + h - 10, w, 20, "white");
					masks[key].setAttribute("dir", "bottom");
					break;
				}
				case "left": {
					setRect(masks[key], x - 10, y, 20, h, "white");
					masks[key].setAttribute("dir", "left");
					break;
				}
			}
		}
	};
	this.maskClick = event => {
		event.stopPropagation();
		console.log(this.isPicking);
		if (!this.isPicking) {
			if (this.endEle) {
				this.el.removeChild(this.endEle);
				this.endEle = null;
			}
			this.isPicking = true;
			this.maskEvent(event, true);
		} else {
			this.isPicking = false;
			this.maskEvent(event, false);
		}
	};
	this.maskMouseDown = event => {
		event.stopPropagation();

		// if (this.endEle) {
		// 	this.el.removeChild(this.endEle);
		// 	this.endEle = null;
		// }
		// this.isPicking = true;
		// this.maskEvent(event, true);
	};
	this.maskMouseOver = event => {
		event.stopPropagation();
		if (this.isPicking) {
			this.maskEvent(event, false, true);
		}
	};
	this.maskMouseMove = event => {
		event.stopPropagation();
		// if (this.isPicking) {
		// 	if (!this.isCaling) {
		// 		this.isCaling = true;
		// 		this.maskEvent(event, false, false, true);
		// 	} else {
		// 		this.maskEvent(event, false, true);
		// 	}
		// }
	};
	this.maskMouseEnter = event => {
		event.stopPropagation();
		if (this.isPicking) {
			if (!this.isCaling) {
				this.isCaling = true;
				this.maskEvent(event, false, false, true);
			} else {
				this.maskEvent(event, false, true);
			}
		}
	};
	this.maskMouseUp = event => {
		console.log("aa");
		event.stopPropagation();

		// if (this.isPicking) {
		// 	console.log("bb");
		// 	if (!this.isCaling) {
		// 		this.isCaling = true;
		// 		this.maskEvent(event, false);
		// 	}
		// }
		// this.isPicking = false;
	};
	this.maskEvent = (event, isMouseDown, preventDrawLine, isTmp) => {
		//容器的位置信息
		let tar = event.target,
			dir = tar.getAttribute("dir"),
			w = tar.getAttribute("width"),
			h = tar.getAttribute("height"),
			x = tar.getAttribute("x"),
			y = tar.getAttribute("y"),
			// isMouseDown = this.pick === "start",
			px,
			py,
			direction;
		switch (dir) {
			case "bottom": {
				isMouseDown ? (direction = "E") : (direction = "W");
				// px = Number(x) + Number(w / 2);
				// py = Number(y) + 3;
				px = Number(event.offsetX);
				py = Number(y) + 10;
				break;
			}
			case "top": {
				isMouseDown ? (direction = "W") : (direction = "E");
				// px = Number(x) + Number(w / 2);
				// py = Number(y) + 3;
				px = Number(event.offsetX);
				py = Number(y) + 10;
				break;
			}
			case "right": {
				isMouseDown ? (direction = "N") : (direction = "S");
				// px = Number(x) + 3;
				// py = Number(y) + Number(h) / 2;
				px = Number(x) + 10;
				py = Number(event.offsetY);
				break;
			}
			case "left": {
				isMouseDown ? (direction = "S") : (direction = "N");
				// px = Number(x) + 3;
				// py = Number(y) + Number(h) / 2;
				px = Number(x) + 10;
				py = Number(event.offsetY);
				break;
			}
		}
		if (isMouseDown) {
			app.startData.x = this.startData.x = Math.floor(px);
			app.startData.y = this.startData.y = Math.floor(py);
			app.startData.dir = this.startData.dir = direction;

			if (!this.startEle) {
				this.startEle = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"circle"
				);
				this.el.prepend(this.startEle);
			}
			this.startEle.setAttribute("cx", px);
			this.startEle.setAttribute("cy", py);
			this.startEle.setAttribute("r", 5);
			this.startEle.setAttribute("fill", "#19a15f");
		} else {
			app.endData.x = this.endData.x = Math.floor(px);
			app.endData.y = this.endData.y = Math.floor(py);
			app.endData.dir = this.endData.dir = direction;
			if (!this.endEle) {
				this.endEle = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"circle"
				);
				this.el.prepend(this.endEle);
			}
			this.endEle.setAttribute("cx", px);
			this.endEle.setAttribute("cy", py);
			this.endEle.setAttribute("r", 5);
			this.endEle.setAttribute("fill", "#dd5044");
		}
		if (!isMouseDown && !preventDrawLine) {
			let rects = this.getRects(),
				startInfo = this.startData,
				endInfo = this.endData;
			console.warn("cc");
			let path = prepareLine(rects, startInfo, endInfo);
			this.drawPath(
				path,
				startInfo.y,
				startInfo.x,
				endInfo.y,
				endInfo.x,
				isTmp
			);
		}
	};
	//画线

	this.drawPath = (path, x1, y1, x2, y2, isTmp) => {
		let pathStr = "";
		pathStr += "M" + y1 + " " + x1;
		for (let i = 0; i < path.length; i++) {
			// if (i == 0) {
			//pathStr += "M" + path[i].y + " " + path[i].x;
			//} else {
			pathStr += "L" + path[i].y + " " + path[i].x;
			// }
		}
		pathStr += "L" + y2 + " " + x2;
		var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
		if (this.tmpLine) {
			this.el.removeChild(this.tmpLine);
			this.tmpLine = null;
		}
		if (isTmp) {
			this.tmpLine = p;
		} else {
			this.lineEle = p;
		}

		p.setAttribute("d", pathStr);
		p.setAttribute("fill", "none");
		p.setAttribute("stroke", "#00a3ef");
		if (isTmp) {
			this.el.appendChild(p);
		} else {
			this.el.prepend(p);
		}
		this.isCaling = false;
	};
}
