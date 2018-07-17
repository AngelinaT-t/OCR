"use strict";
var X = 500; //图纸默认大小
var Y = 500;
var barrier = new Array(); //记录有效图形
var XI = new Array(); //连接点的X值集合
var YI = new Array(); //连接点的y值集合
var VectorPoint = new Array(); //有效连接点
var Path = new Array(); //保存查找路径结果
var EndInfo = new point(-1,-1); //用以保存终点信息,在最后的路径中做出调整

/* 设置图纸大小(备用,目前还没有用上) */
function SetSize(_X, _Y) {
	X = _X;
	Y = _Y;
}

/* barrier数组元素的结构体 */
function point(x, y) {
	var object = new Object();
	object.value = -1; //默认值为-1,1表示可以连接或通过,0表示不可连接
	object.x = x; //记录点坐标
	object.y = y;
	object.vx = -1; //记录对应在vectorpoint中的位置
	object.vy = -1; //初始值为-1
	return object;
}

/* 初始化barrier数组 */
function initNullBarrier() {
	XI = [];
	YI = [];
	for (var i = 0; i < Y; i++) {
		barrier[i] = new Array();
		for (var j = 0; j < X; j++) {
			var p = new point(i, j); //创建一个point对象
			p.value = 1; //属性value设为1,表示可连通
			barrier[i][j] = p;
		}
	}
}

/* 记录图形属性的结构体 */
/* 这里的x,y是对应数组的行和列,宽指所占的行数,高指所占的列数,和前端的x,y,w,h是相反的 */
function Rectangle(x, y, w, h) {
	var object = new Object();
	object.x = x; //左上角点的坐标
	object.y = y;
	object.w = w; //宽
	object.h = h; //高
	return object;
}

/** 初始化图形 */
function init(x, y, w, h) {
	var rect = new Rectangle(y, x, h, w);
	initialBarrier(rect);
}

/* 获取到一个有效的图形后,将该图形所占的屈区域的值设为0,表示不可穿越 */
function initialBarrier(rect) {
	var x = rect.x;
	var y = rect.y;
	var w = rect.w;
	var h = rect.h;

	for (var p = x; p <= x + w; p++) {
		for (var q = y; q <= y + h; q++) {
			barrier[p][q].value = 0;
		}
	}
}

/* 当有了一个有效的图形后，将该图形向外扩大10个像素所对应的顶点和各个边的中点作为该图形的连接点
 * 将连接点的坐标分别加入XI和YI
 */
function initialXIYI(x, y, w, h) {
	if (x > 10) XI.push(x - 10);
	XI.push(x + Math.floor(w / 2));
	if (x + w + 10 < X) XI.push(x + w + 10);

	if (y > 10) YI.push(y - 10);
	YI.push(y + Math.floor(h / 2));
	if (y + h + 10 < Y) YI.push(y + h + 10);
}

/* 将XI，YI重复的值删除，并按从小到大的顺序排序 */
function DuplicateAndSort(arr) {
	var set = new Set();
	var dup = new Array();

	/* 对XI，YI进行排序 */
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

	//利用集合的特性去除重复元素
	for (var i = 0, len = arr.length; i < len; i++) {
		set.add(arr[i]);
	}
	//转为数组返回
	for (var s of set) {
		dup.push(s);
	}
	return dup;
}

/** vectorpoint数组的元素结构体 */
function Pathpoint(x, y) {
	var object = new Object();
	object.x = x; //记录该点在barrier中的位置
	object.y = y;
	object.d = null; //进入方向
	object.parent = null; //路径的父节点
	object.lbsv = Number.POSITIVE_INFINITY; //起点到该点的开销(距离+拐点),初始为无限大
	object.lbvd = Number.POSITIVE_INFINITY; //该点到终点的开销,初始为无限大
	object.nc = 0; 	//根据点和图形边界的距离,为每一个点加上不同的权值
	object.cv = Number.POSITIVE_INFINITY; //经过该点到达终点的总开销,cv = lbsv + lbvd
	return object;
}

/* 利用XI，YI的笛卡儿积生成VectorPoint矩阵 */
function GenerateV() {
	var i, j, lenx, leny;
	XI = DuplicateAndSort(XI); //删除重复的X值并按从小到大排序
	YI = DuplicateAndSort(YI); //删除重复的y值并按从大到小排序
	/* 初始化VectorPonit数组 */
	for (var i = 0; i < Y; i++) {
		VectorPoint[i] = new Array();
	}
	for (i = 0, leny = XI.length; i < leny; i++) {
		//遍历XI
		var m = XI[i];
		for (j = 0, lenx = YI.length; j < lenx; j++) {
			//遍历YI
			var n = YI[j];
			if (barrier[m][n].value != 0) {
				//如果该点不落在有效矩阵（即不可穿越）内，则为有效连接点
				barrier[m][n].vx = i; //实现图形矩阵和寻路矩阵之间的联系
				barrier[m][n].vy = j;
				VectorPoint[i][j] = new Pathpoint(m, n); //将合法点加入寻路矩阵
			} else {
				VectorPoint[i][j] = null;
			}
		}
	}
}

/* 获得连接s和d时,s的前进方向和d的进入方向 */
function dirns(s, d) {
	var sx = s.x,
		dx = d.x; //s的坐标
	var sy = s.y,
		dy = d.y; //d的坐标
	var dirns = ""; //保存前进方向和进入方向

	//定义方向的规则;如果两点在同一条线上,dirns长度为1
	if (dy > sy) dirns += "N";
	if (dx > sx) dirns += "E";
	if (dy < sy) dirns += "S";
	if (dx < sx) dirns += "W";
	return dirns;
}

/** 计算两点之间的距离 */
function Distance(s, d) {
	return Math.abs(s.x - d.x) + Math.abs(d.y - s.y);
}

/*　根据方向d选出其左边,右边或者反向对应的方向是什么
 *　定义规则: 以y值增大的方向为N,以X值增大的方向为E，N的对立方向的S，E的对立方向为W
 *　以前进方向为N时为例，N的左边为W，右边为E，反向为S
 */
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

/** 根据点的位置和前进方向,得到其周围邻近的连接点,优先级为 前进方向>右边>左边 */
function GenerateE(s) {
	console.log(s);
	var D = s.d; //获得前进方向
	var x = barrier[s.x][s.y].vx; // 获得该点对应在VectorPoint的位置
	var y = barrier[s.x][s.y].vy;
	var dr = neighbure("r", D); //得到前进方向的右边所对应的方向
	var dl = neighbure("l", D); //得到前进方向的左边所对应的方向
	var list = new Array();

	//获取前进方向的最近连接点
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
	//获取右边最近的连接点
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
	//获取左边最近的连接点
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

/*　预计两个点连接时所需的拐点，这里时预计时没有考虑炸障碍物的情况下，单纯从位置和方向考虑拐点数　*/
function Bends(s, d) {
	var ds = dirns(s, d); //得到s的前进方向和d的进入方向
	var sd = s.d; //前一个点连接s时,s的进入方向,即此时的前进方向
	var dd;
	if (d.d != null)
		//如果点d已经设置过进入方向 (终点或者已经被其他点尝试连接的点,就会设置过进入方向)
		dd = d.d;
	//如果d还没有设置进入方向
	else dd = ds.length > 1 ? ds[1] : ds[0];

	//计算拐点规则
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

//A*寻路算法中的open队列,保存已经计算过路径但是还未加入close list中的点
//open队列为优先级队列,路径耗费最小的点放在队首
function openQueue() {
	var items = new Array();
	//队列的各种实现方法

	//根据优先级选择插入队列的位置,cv为优先级大小
	this.enqueue = function(elememt) {
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
	//获取首元素
	this.dequeue = function() {
		return items.shift();
	};
	//判断队列是否为空
	this.isEmpty = function() {
		return items.length == 0;
	};
	//判断某个点是否在队列中
	this.iscontain = function(p) {
		for (var i = 0, len = items.length; i < len; i++) {
			if (items[i].x == p.x && items[i].y == p.y) {
				return i;
				break;
			}
		}
		return -1;
	};
	//获取特定位置的元素
	this.get = function(index) {
		return items[index];
	};
	//在特定位置添加元素 (比起插入会更快,但是要保证插入后仍然满足优先级排序)
	this.set = function(index, elememt) {
		items[index] = elememt;
	};
	this.getitems = function() {
		return items;
	};
}

//判断元素p是否在从close list中
function isIncloselist(closelist, p) {
	for (var i = 0, len = closelist.length; i < len; i++) {
		if (closelist[i].x == p.x && closelist[i].y == p.y) {
			return true;
			break;
		}
	}
	return false;
}

function getTempPath(s,sd, d) {
	initNullBarrier();
	var Path = [];
	if(s.x != d.x && s.y!= d.y){
		var Dir = dirns(s, d);
		var	dd = Dir.length == 1 ? Dir.charAt(0) : Dir.charAt(1);
		
		if (sd == neighbure("l", dd) || sd == neighbure("r", dd)) {
			if (sd == "N" || sd == "S") {
				Path.unshift(barrier[s.y][d.x]);
			} else {
				Path.unshift(barrier[d.y][s.x]);
			}
		} else {
			if (sd == "N" || sd == "S") {
				var y = Math.floor((s.x + d.x) / 2);
				Path.unshift(barrier[d.y][y]);
				Path.unshift(barrier[s.y][y]);
			} else {
				var x = Math.floor((s.y + d.y) / 2);
				Path.unshift(barrier[x][d.x]);
				Path.unshift(barrier[x][s.x]);
			}
		}
	}
	return Path;
}

/** 核心寻路算法--A* */
//s,d分别为起点,终点; sd表示起点的前进方向,dd表示终点的进入方向
//四个参数都是从前端获取的值
function getPath(s, d, sd, dd) {
	 GenerateV();
	s = VectorPoint[s.vx][s.vy]; //起点和终点对应在vectorpoint中的位置
	d = VectorPoint[d.vx][d.vy];
	s.d = sd;
	d.d = dd;

	var lbsv = 0; //设置起点的各项属性的值
	var lbvd = Distance(s, d) + Bends(s, d);

	s.lbsv = lbsv; //添加到起点
	s.lbvd = lbvd;
	s.cv = lbsv + lbvd;

	var openlist = new openQueue();
	var closelist = new Array();
	openlist.enqueue(s); //将起点加入openlist

	var flag = false; //是否已经包含终点
	while (!openlist.isEmpty() && !flag) {
		//console.log(openlist.getitems());
		var ss = openlist.dequeue(); // 得到优先队列的首元素ss
		//console.log(ss);
		var Ds = ss.d, // 获得ss的前进方向
			lbsv = ss.lbsv;
		var plist = GenerateE(ss); // 获得ss周围的邻近点,计算通过ss到达这些点的开销
		for (var k = 0, plen = plist.length; k < plen; k++) {
			// 遍历每一个邻接点
			var v = plist.shift(); //获取第一个邻接点v
			/* 判断是否为终点 */
			if (v.x == d.x && v.y == d.y) {
				v.parent = ss;
				flag = true;
				break;
			}
			
			if (v.x > 7 && v.x < X - 7 && v.y > 7 && v.y < Y - 7) {
				if (barrier[v.x][v.y + 7].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x][v.y - 7].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x + 7][v.y].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x - 7][v.y].value == 0) v.nc = v.nc + 5;

				if (barrier[v.x][v.y + 5].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x][v.y - 5].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x + 5][v.y].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x - 5][v.y].value == 0) v.nc = v.nc + 5;

				if (barrier[v.x][v.y + 2].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x][v.y - 2].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x + 2][v.y].value == 0) v.nc = v.nc + 5;
				if (barrier[v.x - 2][v.y].value == 0) v.nc = v.nc + 5;
			} else {
				v.nc += 500;
			}
			

			/** 若不是终点,判断是否在closelist中 */
			if (!isIncloselist(closelist, v)) {
				var Dv = dirns(ss, v);
				Dv = Dv.length == 1 ? Dv.charAt(0) : Dv.charAt(1); //得到v的进入方向
				var lbv;
				var index = openlist.iscontain(v); //判断v是否在open list中
				//console.log(openlist.getitems());
				//如果已经加入open list,则要通过计算判断通过ss到达v是否减小了v到达终点的开销,有则更新
				if (index != -1) {
					v = openlist.get(index);
					var svcv = openlist.get(index).lbsv; //获取v当前的开销
					var vdir = v.d; //暂时保存v当前的进入方向

					v.d = null;
					v.d = dirns(ss, v); //重新设置v的进入方向
					lbv = lbsv + Distance(ss, v) + Bends(ss, v)  + v.nc; //计算通过ss到达v的开销
					/** 和原本v的开销进行对比 */
					/** 如果原本的开销较大 则立刻更新父节点,开销等属性,重新加入openlist */
					if (lbv < svcv) {
						v.d = Dv;
						v.parent = ss;
						v.lbsv = lbv + v.nc;
						v.lbvd = Distance(v, d) + Bends(v, d) ;
						v.cv = v.lbsv + v.lbvd;
						openlist.set(index, v);
					} else if (lbv == svcv) {
					/** 如果和原来的开销一样 就要从父节点的方向考虑*/
					/** 父节点和v在同一直线上时,优先级最高,其次是v在父节点的右侧,最后是v在父节点的左侧 */
						var ssp = ss.parent;
						var vp = v.parent;
						var ssd = ss.d,
						vpd = vp.d,
						sspd = ssp.d;
						var weightvp, weightss;
						//计算当前父节点的优先级
						if (vpd == sspd) weightvp = 2;
						else if (vpd == neighbure("r", sspd)) weightvp = 1;
						else if (vpd == neighbure("l", sspd)) weightvp = 0;
						//计算ss的优先级
						if (ssd == sspd) weightss = 2;
						else if (ssd == neighbure("r", sspd)) weightss = 1;
						else if (ssd == neighbure("l", sspd)) weightss = 0;
						//如果ss的优先级更高,则更新v的父节点
						if (weightss > weightvp) {
							v.d = Dv;
							v.parent = ss;
							v.lbsv = lbv + v.nc;
							v.lbvd = Distance(v, d) + Bends(v, d) ;
							v.cv = v.lbsv + v.lbvd;
							openlist.set(index, v);
						}
						//如果当前父节点的优先级更高,则恢复v的进入方向
						else {
							v.d = vdir;
						}
					} else {
					/** 如果比原来的开销大,则恢复v的进入方向 */
						v.d = vdir;
					}
				} else {
				/** 如果还没有加入open list,直接设置父节点和开销等属性并且加入到open list */
					v.d = Dv;
					lbv = lbsv + Distance(ss, v) + Bends(ss, v) ;
					v.parent = ss;
					v.lbsv = lbv + v.nc;
					v.lbvd = Distance(v, d) + Bends(v, d) ;
					v.cv = v.lbsv + v.lbvd;
					openlist.enqueue(v);
				}
			}
		}
		/** ss的邻近节点都遍历完成后, 将ss加入close list 不再参与路径更新 */
		closelist.push(ss);
	}

	Path = []; //存储路径结果
	var p = d; //从终点开始往前寻找父节点

	/** 调整路径的最后部分, 以免出现突点 */
	var dp = p.parent;
	if(dirns(p,EndInfo) == dirns(dp,EndInfo) || dirns(p,EndInfo) == neighbure("re",dirns(dp,EndInfo))){
		p = dp;
	}


	while (p.parent != null) {
		Path.unshift(barrier[p.x][p.y]); //每次从数组头插入节点
		p = p.parent;
	}
	if (p.x == s.x && p.y == s.y)
		//将起点加入路径
		Path.unshift(barrier[p.x][p.y]);

	/** 解决没有通路的情况 */
	/** 如果找不到直接通路 就将起点和终点用水平线连接 */
	if (Path.length == 0) {
		if (sd == neighbure("l", dd) || sd == neighbure("r", dd)) {
			if (sd == "N" || sd == "S") {
				Path.unshift(barrier[s.x][d.y]);
			} else {
				Path.unshift(barrier[d.x][s.y]);
			}
		} else {
			if (sd == "N" || sd == "S") {
				var y = Math.floor((s.y + d.y) / 2);
				Path.unshift(barrier[d.x][y]);
				Path.unshift(barrier[s.x][y]);
			} else {
				var x = Math.floor((s.x + d.x) / 2);
				Path.unshift(barrier[x][d.y]);
				Path.unshift(barrier[x][s.y]);
			}
		}
	}
	console.log(Path);
	return Path;
}

/** 找到距离起点最近的连接点 */
function getStartLinkPoint(x, y, d) {
	var xy = new Array();　//保存返回结果
	var indexX, indexY;
	/** 起点前进方向为N或S */
	if (d == "N" || d == "S") {
		if (y == 0 || y == Y - 1) { //如果在图纸边界上,在表示没有连接点
			xy = null;
		} else {
			for (var i = 0, lenx = XI.length; i < lenx; i++) { //遍历XI
				if (XI[i] == x) {　//找到起点所在的行
					indexX = i;  //indexX记录其所在的行
					indexY = null;
					var l = Number.POSITIVE_INFINITY ; //l为当前最短距离,初始化为无限大
					for (var j = 0, leny = YI.length; j < leny; j++) { //遍历YI
						var tl = Math.abs(y - YI[j]);　//计算两点的之间的距离,因为是同一行的点,只需要计算y的差值
						if (
							/** 在距离5~10之间寻找最近的连接点 */
							tl <= 10 && 
							tl >= 5 &&
							tl < l &&
							barrier[x][YI[j]].value != 0 
						) {
							//满足则更新
							l = tl;
							indexY = j;
						}
					}
					break;
				}
			}
			/** 若在5~10的范围内找到有效连接点 */
			if (indexY != null) 
				xy.push(XI[indexX], YI[indexY]); //返回连接点坐标

			/** 若在5~10的范围内没有找到有效连接点,则将起点和最近的边界之间的中点作为连接点 */
			else {
				var i;
				if (d == "N") {
					for (i = y + 1; i < Y; i++) {
						if (barrier[x][i].value != 1) {
							break;
						}
					}
				} else {
					for (i = y - 1; i > 0; i--) {
						if (barrier[x][i].value != 1) {
							break;
						}
					}
				}
				YI.push(Math.floor((y + i) / 2)); 　//计算中点值并加入到YI
				xy.push(x, Math.floor((y + i) / 2));　 //返回连接点坐标
			}
		}
	} 
	/** 起点前进方向为E或W */
	else {
		if (x == 0 || x == X - 1) {
			xy = null;
		} else {
			for (var i = 0, lenx = YI.length; i < lenx; i++) {
				if (YI[i] == y) {
					var indexY = i,
						indexX = null;
					var l = Number.POSITIVE_INFINITY;
					for (var j = 0, leny = XI.length; j < leny; j++) {
						var tl = Math.abs(x - XI[j]);
						if (
							tl <= 10 &&
							tl >= 5 &&
							tl < l &&
							barrier[XI[j]][y].value != 0
						) {
							l = tl;
							indexX = j;
						}
					}
					break;
				}
			}
			if (indexX != null) xy.push(XI[indexX], YI[indexY]);
			else {
				var i;
				if (d == "E") {
					for (i = x + 1; i < X; i++) {
						if (barrier[i][y].value != 1) {
							break;
						}
					}
				} else {
					for (i = x - 1; i > 0; i--) {
						if (barrier[i][y].value != 1) {
							break;
						}
					}
				}
				XI.push(Math.floor((x + i) / 2));
				xy.push(Math.floor((x + i) / 2), y);
			}
		}
	}
	return xy;
}

function getEndLinkPoint(x, y, d) {
	var xy = new Array();
	if (d == "N" || d == "S") {
		if (y == 0 || y == Y - 1) {
			xy = null;
		} else {
			for (var i = 0, lenx = XI.length; i < lenx; i++) {
				if (XI[i] == x) {
					var indexX = i,
						indexY = null;
					var l = Number.POSITIVE_INFINITY;
					for (var j = 0, leny = YI.length; j < leny; j++) {
						var tl = Math.abs(y - YI[j]);
						if (
							tl <= 10 &&
							tl >= 5 &&
							tl < l &&
							barrier[x][YI[j]].value != 0
						) {
							l = tl;
							indexY = j;
						}
					}
					break;
				}
			}

			if (indexY != null) xy.push(XI[indexX], YI[indexY]);
			else {
				var i;
				if (d == "N") {
					for (i = y - 1; i > 0; i--) {
						if (barrier[x][i].value != 1) {
							break;
						}
					}
				} else {
					for (i = y + 1; i < Y; i++) {
						if (barrier[x][i].value != 1) {
							break;
						}
					}
				}
				YI.push(Math.floor((y + i) / 2));
				xy.push(x, Math.floor((y + i) / 2));
			}
		}
	} else {
		if (x == 0 || x == X - 1) {
			xy = null;
		} else {
			for (var i = 0, lenx = YI.length; i < lenx; i++) {
				if (YI[i] == y) {
					var indexY = i,
						indexX = null;
					var l = Number.POSITIVE_INFINITY;
					for (var j = 0, leny = XI.length; j < leny; j++) {
						var tl = Math.abs(x - XI[j]);
						if (
							tl <= 10 &&
							tl >= 5 &&
							tl < l &&
							barrier[XI[j]][y].value != 0
						) {
							l = tl;
							indexX = j;
						}
					}
					break;
				}
			}

			if (indexX != null) xy.push(XI[indexX], YI[indexY]);
			else {
				var i;
				if (d == "E") {
					for (i = x - 1; i > 0; i--) {
						if (barrier[i][y].value != 1) {
							break;
						}
					}
				} else {
					for (i = x + 1; i < X; i++) {
						if (barrier[i][y].value != 1) {
							break;
						}
					}
				}
				XI.push(Math.floor((x + i) / 2));
				xy.push(Math.floor((x + i) / 2),y);
			}
		}
	}
	return xy;
}

/** draw.js获取到前端所有的图形,起点以及终点信息 */
/** 该function根据起点终点的位置初始化barrier数组,标记不可穿越的图形;初始化XI,YI,标记有效连接点的坐标集合 */
function prepareLine(rects, startInfo, endInfo) {
	//保存终点信息
	EndInfo.x = endInfo.y;
	EndInfo.y = endInfo.x;

	let path, startPt, endPt, start, end; //获取到图纸上全部的图形
	var flags, flage;

	initNullBarrier(); //初始化标志图形的二维数组,value==1表示可以连接

	for (let i = 0; i < rects.length; i++) { // 遍历每一个图形
		flags = true;
		flage = true;

		//每个图形的四元组
		var y = rects[i][0],
			x = rects[i][1],
			h = rects[i][2],
			w = rects[i][3];

		/*判断该图形是否包含了起点或终点。包含指点在图形内部，不包括在边上的情况*/
		if (
			startInfo.y > x &&
			startInfo.x > y &&
			startInfo.y < x + w &&
			startInfo.x < y + h
		) {
			flags = false; //包含起点
		}  
		if (
			endInfo.y > x &&
			endInfo.x > y &&
			endInfo.y < x + w &&
			endInfo.x < y + h
		) {
			flage = false; //包含终点
		}

		/*若不包含起点终点*/
		if (flage && flags) {
			init(...rects[i]); //将图形对应在barrier数组相应位置的point.value全部赋值为0，表示不可穿越
			initialXIYI(x, y, w, h); //将图形的四个顶点加入到XI，YI
		} 
		/** 若包含起点或者终点中的其中一个 */
		else if ((flage && !flags) || (!flage && flags)) {
			flags = true;
			flage = true;

			/*起点是否在图形上*/
			if (
				(startInfo.y == x && (startInfo.x >= y && startInfo.x <= y + h)) ||
				(startInfo.y == x + w && (startInfo.x >= y && startInfo.x <= y + h)) ||
				(startInfo.x == y && (startInfo.y >= x && startInfo.y <= x + w)) ||
				(startInfo.x == y + h && (startInfo.y >= x && startInfo.y <= x + w))
			) {
				flags = false; // 起点在图形上
			} 
			/*终点是否在图形上*/
			if (
				(endInfo.y == x && (endInfo.x >= y && endInfo.x <= (y + h))) ||
				(endInfo.y == (x+w) && (endInfo.x >= y && endInfo.x <= (y + h))) ||
				(endInfo.x == y && (endInfo.y >= x && endInfo.y <= (x + w))) ||
				(endInfo.x == (y+h) && (endInfo.y >= x && endInfo.y <= (x + w)))
			) {
				flage = false; // 终点在图形上
			}

			/*是否:包含起点且终点在该图形上；或包含终点且起点在该图形上*/
			if (!flage || !flags) {
				initialXIYI(x, y, w, h); //将图形的四个顶点加入XI,YI,但是图形可以穿越
			}
			/* 如果只是包含了其中一个点,则忽略该图形 */
		}
		/*如果包含了起点和终点，则忽略该图形*/
	}

	/** 根据起点和终点的前进和进入方向确定其所在的直线,加入到XI或YI */
	switch (startInfo.dir) {
		case "N": // 若起点的前进方向为N,则将起点所在的行加入XI；其他同理
			XI.push(startInfo.y);
			break;
		case "S":
			XI.push(startInfo.y);
			break;
		case "E":
			YI.push(startInfo.x);
			break;
		case "W":
			YI.push(startInfo.x);
			break;
	}
	switch (endInfo.dir) {
		case "N":
			XI.push(endInfo.y);
			break;
		case "S":
			XI.push(endInfo.y);
			break;
		case "E":
			YI.push(endInfo.x);
			break;
		case "W":
			YI.push(endInfo.x);
			break;
	}

	GenerateV(); //根据XI，YI生成有效的连接点，保存在二维数组VectorPoint中
	startPt = getStartLinkPoint(startInfo.y, startInfo.x, startInfo.dir); //根据点坐标和方向，在VectorPoint中找到最近的连接点
	endPt = getEndLinkPoint(endInfo.y, endInfo.x, endInfo.dir);
	start = barrier[startPt[0]][startPt[1]]; //将获取到的点坐标转换为对应在barrier中的point
	end = barrier[endPt[0]][endPt[1]];
	path = getPath(start, end, startInfo.dir, endInfo.dir); //调用寻路算法
	return path;
}
