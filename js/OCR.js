"use strict";
var X = 500;
var Y = 500;
var barrier = new Array();
var XI = new Array();
var YI = new Array();
var VectorPoint = new Array();
var rectList = new Array();
var Path = new Array();

function SetSize(_X, _Y) {
  X = _X;
  Y = _Y;
}

function point(x, y) {
  var object = new Object();
  object.value = -1;
  object.x = x;
  object.vx = -1;
  object.y = y;
  object.vy = -1;
  return object;
}
function initNullBarrier(){
  for (var i = 0; i < Y; i++) {
    barrier[i] = new Array(i);
    for (var j = 0; j < X; j++) {
      var p = new point(i, j);
      p.value = 1;
      barrier[i][j] = p;
    }
  }
}

for (var i = 0; i < Y; i++) {
  VectorPoint[i] = new Array();
}

function Rectangle(x, y, w, h) {
  var object = new Object();

  object.x = x;
  object.y = y;
  object.w = w;
  object.h = h;

  return object;
}

function initialBarrier(rect) {
  var x = rect.x;
  var y = rect.y;
  var w = rect.w;
  var h = rect.h;

  for (var p = x; p <= (x + w); p++) {
    for (var q = y; q <= (y + h); q++) {
      barrier[p][q].value = 0;
    }
  }   
}

function initialXIYI(x, y, w, h){
if( x > 10)
      XI.push(x - 10);
    XI.push(x + Math.floor(w / 2));
    if(x + w + 10 < X)
      XI.push(x + w + 10);

    if( y > 10)
      YI.push(y - 10);
    YI.push(y + Math.floor(h / 2));
    if(y + h + 10 < Y)
      YI.push(y + h + 10);
}


function DuplicateAndSort(arr) {
  var set = new Set();
  var dup = new Array();

  for (var i = 1; i < arr.length; i++) {
    //升序
    if (arr[i] < arr[i - 1]) {
      //取出无序数列中的第i个作为被插入元素
      var guard = arr[i];
      //记住有序数列的最后一个位置，并且将有序数列位置扩大一个
      var j = i - 1;
      arr[i] = arr[j];
      //比大小，找到被插入元素所在的位置
      while (j >= 0 && guard < arr[j]) {
        arr[j + 1] = arr[j];
        j--;
      }
      //插入
      arr[j + 1] = guard;
    } else if (arr[i] == arr[i - 1]) {
      for (var j = i + 1; j < arr.length; j++) {
        arr[j];
      }
    }
  }

  for (var i = 0, len = arr.length; i < len; i++) {
    set.add(arr[i]);
  }
  for (var s of set) {
    dup.push(s);
  }
  return dup;
}

function GenerateV() {
  var i, j, lenx, leny;
  XI = DuplicateAndSort(XI);
  YI = DuplicateAndSort(YI);
  for (i = 0, leny = XI.length; i < leny; i++) {
    var m = XI[i];
    for (j = 0, lenx = YI.length; j < lenx; j++) {
      var n = YI[j];
      if (barrier[m][n].value != 0) {
        barrier[m][n].vx = i;
        barrier[m][n].vy = j;
        VectorPoint[i][j] = new Pathpoint(m, n);
      } else {
        VectorPoint[i][j] = null;
      }
    }
  }
}

function dirns(s, d) {
  var sx = s.x,
    dx = d.x;
  var sy = s.y,
    dy = d.y;
  var dirns = "";
  if (dy > sy) dirns += "N";
  if (dx > sx) dirns += "E";
  if (dy < sy) dirns += "S";
  if (dx < sx) dirns += "W";
  return dirns;
}

function Distance(s, d) {
  return Math.abs(s.x - d.x) + Math.abs(d.y - s.y);
}

function neighbure(n, d) {
  if (n == "l") {
    if (d == "N") return "W";
    else if (d == "E") return "N";
    else if (d == "S") return "E";
    else if (d == "W") return "S";
  } else if (n == "r") {
    if (d == "N") return "E";
    else if (d == "E") return "S";
    else if (d == "S") return "W";
    else if (d == "W") return "N";
  } else if (n == "re") {
    if (d == "N") return "S";
    else if (d == "E") return "W";
    else if (d == "S") return "N";
    else if (d == "W") return "E";
  }
}

function GenerateE(s) {
  var D = s.d;
  var x = barrier[s.x][s.y].vx;
  var y = barrier[s.x][s.y].vy;
  var dr = neighbure("r", D);
  var dl = neighbure("l", D);
  var list = new Array();

  if (D == "N") {
    if (y < Y - 1 && VectorPoint[x][y + 1] != null) {
      list.push(VectorPoint[x][y + 1]);
    }
  } else if (D == "S") {
    if (y > 0 && VectorPoint[x][y - 1] != null) {
      list.push(VectorPoint[x][y - 1]);
    }
  } else if (D == "E") {
    if (x < X - 1 && VectorPoint[x + 1][y] != null) {
      list.push(VectorPoint[x + 1][y]);
    }
  } else if (D == "W") {
    if (x > 0 && VectorPoint[x - 1][y] != null) {
      list.push(VectorPoint[x - 1][y]);
    }
  }
  /////////////////////////////////////////////////
  if (dr == "N") {
    if (y < Y - 1 && VectorPoint[x][y + 1] != null) {
      list.push(VectorPoint[x][y + 1]);
    }
  } else if (dr == "S") {
    if (y > 0 && VectorPoint[x][y - 1] != null) {
      list.push(VectorPoint[x][y - 1]);
    }
  } else if (dr == "E") {
    if (x < X - 1 && VectorPoint[x + 1][y] != null) {
      list.push(VectorPoint[x + 1][y]);
    }
  } else if (dr == "W") {
    if (x > 0 && VectorPoint[x - 1][y] != null) {
      list.push(VectorPoint[x - 1][y]);
    }
  }
  //////////////////////////////////////////////////////
  if (dl == "N") {
    if (y < Y - 1 && VectorPoint[x][y + 1] != null) {
      list.push(VectorPoint[x][y + 1]);
    }
  } else if (dl == "S") {
    if (y > 0 && VectorPoint[x][y - 1] != null) {
      list.push(VectorPoint[x][y - 1]);
    }
  } else if (dl == "E") {
    if (x < X - 1 && VectorPoint[x + 1][y] != null) {
      list.push(VectorPoint[x + 1][y]);
    }
  } else if (dl == "W") {
    if (x > 0 && VectorPoint[x - 1][y] != null) {
      list.push(VectorPoint[x - 1][y]);
    }
  }

  return list;
}

function Bends(s, d) {
  var ds = dirns(s, d);
  var sd = s.d;
  var dd;
  //var dd = d.d;
  if(d.d != null)
    dd = d.d;
  else
    dd = ds.length > 1 ? ds[1]:ds[0];

  if (sd == dd && ds == sd) return 0;
  if (
    (neighbure("l", dd) == sd || neighbure("r", dd) == sd) &&
    ds.indexOf(sd) != -1
  )
    return 1;
  if (
    (sd == dd && (ds != sd && ds.indexOf(sd) != -1)) ||
    (sd == neighbure("re", dd) && ds != dd)
  )
    return 2;
  if (
    (neighbure("l", dd) == sd || neighbure("r", dd) == sd) &&
    ds.indexOf(sd) == -1
  )
    return 3;
  if (
    (neighbure("re", dd) == sd && ds == dd) ||
    (sd == dd && ds.indexOf(sd) == -1)
  )
    return 4;
}

function openQueue() {
  var items = new Array();

  this.enqueue = function (elememt) {
    if (this.isEmpty()) {
      items.push(elememt);
    } else {
      var added = false;
      for (var i = 0, len = items.length; i < len; i++) {
        if (elememt.cv < items[i].cv) {
          items.splice(i, 0, elememt);
          added = true;
          break;
        }
      }
      if (!added) {
        items.push(elememt);
      }
    }
  };
  this.dequeue = function () {
    return items.shift();
  };
  this.isEmpty = function () {
    return items.length == 0;
  };
  this.iscontain = function (p) {
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].x == p.x && items[i].y == p.y) {
        return i;
        break;
      }
    }
    return -1;
  };
  this.get = function (index) {
    return items[index];
  };
  this.set = function (index,elememt) {
    items[index] = elememt;
  };
}

function isIncloselist(closelist, p) {
  for (var i = 0, len = closelist.length; i < len; i++) {
    if (closelist[i].x == p.x && closelist[i].y == p.y) {
      return true;
      break;
    }
  }
  return false;
}

function Pathpoint(x, y) {
  var object = new Object();
  object.x = x;
  object.y = y;
  object.d = null;
  object.parent = null;
  object.lbsv = 9999;
  object.lbvd = 9999;
  object.bv = 9999;
  object.cv = 9999;
  return object;
}

function getPath(s, d, sd, dd) {

    s = VectorPoint[s.vx][s.vy];
    d = VectorPoint[d.vx][d.vy];
    s.d = sd;
    d.d = dd;

    var lbsv = 0;
    var lbvd = Distance(s, d) + Bends(s, d);
    var bv = 0;

    s.lbsv = lbsv;
    s.lbvd = lbvd;
    s.bv = bv;
    s.cv = lbsv + lbvd;

    var openlist = new openQueue();
    var closelist = new Array();
    openlist.enqueue(s);

    var flag = false;
    while (!openlist.isEmpty() && !flag) {
      var ss = openlist.dequeue();
      var Ds = ss.d,
        lbsv = ss.lbsv,
        bs = ss.bv;
      var plist = GenerateE(ss);
      for (var k = 0, plen = plist.length; k < plen; k++) {
        var v = plist.shift();
        if (v.x == d.x && v.y == d.y) {
          v.parent = ss;
          flag = true;
          break;
        }
        if (!isIncloselist(closelist, v)) {
          var Dv = dirns(ss, v);
          Dv = Dv.length == 1 ? Dv.charAt(0) : Dv.charAt(1);
          var bv, lbv;
          if (Dv == Ds) bv = bs ;
          else bv =  bs + 1;

          var index = openlist.iscontain(v);
          if (index != -1) {
            var svcv = openlist.get(index).lbsv;
            var vdir = v.d;
            v.d = null;
            v.d = dirns(ss, v);
            lbv = lbsv + Distance(ss, v) + Bends(ss, v);
            if (lbv < svcv ) {
              v.d = Dv;
              v.parent = ss;
              v.lbsv = lbv;
              v.lbvd = Distance(v, d) + Bends(v, d);
              v.bv = bv;
              v.cv = v.lbsv + v.lbvd;
              openlist.set(index,v);
            } 
            else if(lbv == svcv){
              var ssp = ss.parent;
              var vp = v.parent;
              var ssd = ss.d, vpd = vp.d, sspd = ssp.d;
              var weightvp,weightss;
              if(vpd == sspd) weightvp = 2;
              else if(vpd == neighbure("r",sspd)) weightvp = 1;
              else if(vpd == neighbure("l",sspd)) weightvp = 0;

              if(ssd == sspd) weightss = 2;
              else if(ssd == neighbure("r",sspd)) weightss = 1;
              else if(ssd == neighbure("l",sspd)) weightss = 0;

              if(weightss > weightvp){
                v.d = Dv;
                v.parent = ss;
                v.lbsv = lbv;
                v.lbvd = Distance(v, d) + Bends(v, d);
                v.bv = bv;
                v.cv = v.lbsv + v.lbvd;
                openlist.set(index,v);
              }
              else{
                v.d = vdir;
              }
            }else {
              v.d = vdir;
            }
          } else {
            v.d = Dv;
            lbv = lbsv + Distance(ss, v) + Bends(ss,v);
            v.parent = ss;
            v.lbsv = lbv;
            v.lbvd = Distance(v, d) + Bends(v, d);
            v.bv = bv;
            v.cv =  v.lbsv + v.lbvd;
            openlist.enqueue(v);
          }
        }
      }
      closelist.push(ss);
    }

    Path = [];
    var p = d;
    while (p.parent != null) {
      Path.unshift(barrier[p.x][p.y]);
      p = p.parent;
    }
    if (p.x == s.x && p.y == s.y)
      Path.unshift(barrier[p.x][p.y]);

    if(Path.length == 0){
      if(sd == neighbure("l",dd) || sd == neighbure("r",dd)){
        if(sd == "N" || sd == "S"){
          Path.unshift(barrier[s.x][d.y]);
        }
        else{
          Path.unshift(barrier[d.x][s.y]);
        }
      }
      else{
        if(sd == "N" || sd == "S"){
          var y = Math.floor((s.y + d.y)/2);
          Path.unshift(barrier[d.x][y]);
          Path.unshift(barrier[s.x][y]);
        }
        else{
          var x = Math.floor((s.x + d.x)/2)
          Path.unshift(barrier[x][d.y]);
          Path.unshift(barrier[x][s.y]);
        }
      }    
    }
    GenerateV();
    return Path;
}

function init(x, y, w, h) {
  var rect = new Rectangle(y, x, h, w);
  initialBarrier(rect);
}

function getStartLinkPoint(x, y, d) {
  var xy = new Array();
  if (d == "N" || d == "S") {
    if (y == 0 || y == (Y - 1)) {
      xy = null;
    }
    else {
      for (var i = 0, lenx = XI.length; i < lenx; i++) {
        if (XI[i] == x) {
          var indexX = i, indexY = null;
          var l = 999;
          for (var j = 0, leny = YI.length; j < leny; j++) {
            var tl = Math.abs(y - YI[j]);
            if ((tl <= 10 && tl >= 5 &&  tl < l) && (barrier[x][YI[j]].value != 0)) {
              l = tl;
              indexY = j;
            }
          }
          break;
        }
      }
      if (indexY != null)
        xy.push(XI[indexX], YI[indexY]);
      else{
        xy = null;
      }
    }
  } else {
    if (x == 0 || x == X - 1) {
      xy = null;
    }
    else{
      for (var i = 0, lenx = YI.length; i < lenx; i++) {
        if (YI[i] == y) {
          var indexY = i, indexX = null;
          var l = 999;
          for (var j = 0, leny = XI.length; j < leny; j++) {
            var tl = Math.abs(x - XI[j]);
            if ((tl <= 10 && tl >=5 && tl < l) && barrier[XI[j]][y].value != 0) {
              l = tl;
              indexX = j;
            }
          }
          break;
        }
      }
      if (indexX != null)
        xy.push(XI[indexX], YI[indexY]);
      else
        xy = null;
    }
  }
  return xy;
}

function getEndLinkPoint(x, y, d) {
  var xy = new Array();
  if (d == "N" || d == "S") {
    if (y == 0 || y == Y - 1) {
      xy = null;
    }
    else {
      for (var i = 0, lenx = XI.length; i < lenx; i++) {
        if (XI[i] == x) {
          var indexX = i, indexY = null;
          var l = 999;
          for (var j = 0, leny = YI.length; j < leny; j++) {
            var tl = Math.abs(y - YI[j]);
            if ((tl <= 10 && tl >=5 &&  tl < l) && (barrier[x][YI[j]].value != 0)) {
              l = tl;
              indexY = j;
            }
          }
          break;
        }
      }

      if (indexY != null)
        xy.push(XI[indexX], YI[indexY]);
      else
        xy = null;
    }
  } else {
    if (x == 0 || x == X - 1) {
      xy = null;
    }
    else{
      for (var i = 0, lenx = YI.length; i < lenx; i++) {
        if (YI[i] == y) {
          var indexY = i, indexX = null;
          var l = 999;
          for (var j = 0, leny = XI.length; j < leny; j++) {
            var tl = Math.abs(x - XI[j]);
            if ((tl <= 10 && tl >=5 && tl < l) && barrier[XI[j]][y].value != 0) {
              l = tl;
              indexX = j;
            }
          }
          break;
        }
      }

      if (indexX != null)
        xy.push(XI[indexX], YI[indexY]);
      else
        xy = null;
    }
  }
  return xy;
}
