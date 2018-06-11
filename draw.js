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

  this.pick = undefined;
  this.start = undefined;
  this.end = undefined;

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
    this.el.setAttribute("width", this.w);
    this.el.setAttribute("height", this.h);
    // this.el.style.marginTop = -this.h / 2 + "px";
    // this.el.style.marginLeft = -this.w / 2 + "px";

    // this.leftPos = parseInt(window.getComputedStyle(this.el).left);
    // this.topPos = parseInt(window.getComputedStyle(this.el).top);

    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    setRect(rect, 0, 0, this.w, this.h);

    this.el.appendChild(rect);

    this.el.addEventListener("mousedown", this.mouseDownOnSvg);
    this.el.addEventListener("mousemove", this.mouseMoveOnSvg);
    this.el.addEventListener("mouseup", this.mouseUpOnSvg);
    // this.el.addEventListener("click", this.mouseClickOnSvg);
  };

  this.getRects = () => {
    return this.rectDatas;
  };

  //选点相关
  this.setPick = type => {
    this.pick = type;
  };
  //绘制svg的mouse事件
  this.mouseDownOnSvg = event => {
    if (this.pick) return;
    if (event.which !== 1) return;
    this.rectSX = event.offsetX;
    this.rectSY = event.offsetY;
    this.recting = true;
  };

  this.mouseMoveOnSvg = event => {
    if (!this.recting) return;
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
  };
  this.mouseUpOnSvg = event => {
    if (this.pick) return;
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
    rect.setAttribute("fill", "white");
  }

  //为rect每个border添加mask，获取点击事件
  this.addRectMask = (x, y, w, h) => {
    let masks = { top: "", right: "", bottom: "", left: "" };
    for (let key in masks) {
      masks[key] = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      masks[key].addEventListener("click", this.maskEvent);
      masks[key].style.opacity = 0;
      this.el.appendChild(masks[key]);
      switch (key) {
        case "top": {
          setRect(masks[key], x, y - 3, w, 6, "white");
          masks[key].setAttribute("dir", "top");
          break;
        }
        case "right": {
          setRect(masks[key], x + w - 3, y, 6, h, "white");
          masks[key].setAttribute("dir", "right");
          break;
        }
        case "bottom": {
          setRect(masks[key], x, y + h - 3, w, 6, "white");
          masks[key].setAttribute("dir", "bottom");
          break;
        }
        case "left": {
          setRect(masks[key], x - 3, y, 6, h, "white");
          masks[key].setAttribute("dir", "left");
          break;
        }
      }
    }
  };

  this.maskEvent = event => {
    if (!this.pick) return;
    let tar = event.target,
      dir = tar.getAttribute("dir"),
      w = tar.getAttribute("width"),
      h = tar.getAttribute("height"),
      x = tar.getAttribute("x"),
      y = tar.getAttribute("y"),
      ifStart = this.pick === "start",
      px,
      py,
      direction;
    switch (dir) {
      case "bottom": {
        ifStart ? (direction = "E") : (direction = "W");
        px = Number(x) + Number(w / 2);
        py = Number(y) + 3;
        break;
      }
      case "top": {
        ifStart ? (direction = "W") : (direction = "E");
        px = Number(x) + Number(w / 2);
        py = Number(y) + 3;
        break;
      }
      case "right": {
        ifStart ? (direction = "N") : (direction = "S");
        px = Number(x) + 3;
        py = Number(y) + Number(h) / 2;
        break;
      }
      case "left": {
        ifStart ? (direction = "S") : (direction = "N");
        px = Number(x) + 3;
        py = Number(y) + Number(h) / 2;
        break;
      }
    }
    if (this.pick === "start") {
      app.startX = Math.floor(px);
      app.startY = Math.floor(py);
      app.startDir = direction;
      if (!this.start) {
        this.start = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        this.el.appendChild(this.start);
      }
      this.start.setAttribute("cx", px);
      this.start.setAttribute("cy", py);
      this.start.setAttribute("r", 4);
      this.start.setAttribute("fill", "#19a15f");
    } else {
      app.endX = Math.floor(px);
      app.endY = Math.floor(py);
      app.endDir = direction;
      if (!this.end) {
        this.end = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        this.el.appendChild(this.end);
      }
      this.end.setAttribute("cx", px);
      this.end.setAttribute("cy", py);
      this.end.setAttribute("r", 4);
      this.end.setAttribute("fill", "#dd5044");
    }
  };
  //画线

  this.drawPath = path => {
    let pathStr = "";
    for (let i = 0; i < path.length; i++) {
      if (i == 0) {
        pathStr += "M" + path[i].y + " " + path[i].x;
      } else {
        pathStr += "L" + path[i].y + " " + path[i].x;
      }
    }
    console.log(pathStr);
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", pathStr);

    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "#00a3ef");
    this.el.appendChild(p);
  };
}
