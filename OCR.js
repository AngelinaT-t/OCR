'use strict';
var X = 20;
var Y = 20;
var barrier = new Array();
var XI = new Array();
var YI = new Array(); 
var VectorPoint = new Array();

function point(x,y){
    var object = new Object();
    object.value = -1;
    object.x=x;
    object.vx=-1;
    object.y=y;
    object.vy=-1;
    object.d=null;
    object.parent = null;
    object.plist = new Array();

    return object;
}

for(var i=0 ; i < Y; i++){        
    barrier[i]=new Array(i);   
    for(var j=0 ; j < X; j++){ 
        var p = new point(i,j);
        p.value = 1;
        barrier[i][j]= p;
    } 
} 

for(var i=0; i < Y; i++){        
    VectorPoint[i]=new Array();   
} 

function Rectangle(x,y,w,h){
    var object = new Object();

    object.x=x;
    object.y=y;
    object.w=w;
    object.h=h;

    return object;
}

function initialBarrier(rect){
    var x=rect.x;
    var y=rect.y;
    var w=rect.w;
    var h=rect.h;
    
    for (var p = x; p < x+w; p++ ) {
        for (var q = y; q < y+h; q++) {
            barrier[p][q].value = 0;
        }
    }	

    w = Math.floor((w+2)/2);
    h = Math.floor((h+2)/2);
    x = x-1;
    y = y-1;
    XI.push(x,x+w,x+w+w);
    YI.push(y,y+h,y+h+h);
}

function DuplicateAndSort(arr){
    var set = new Set();
    var dup = new Array();

    for(var i = 1; i < arr.length; i++){
        //升序
        if(arr[i] < arr[i-1]){
            //取出无序数列中的第i个作为被插入元素
            var guard = arr[i];
            //记住有序数列的最后一个位置，并且将有序数列位置扩大一个
            var j = i - 1;
            arr[i] = arr[j];
            //比大小，找到被插入元素所在的位置
            while(j >= 0 && guard < arr[j]){
                arr[j+1] = arr[j];
                j--;
            }
            //插入
            arr[j+1] = guard;
        }else if(arr[i] == arr[i-1]){
            for(var j = i+1; j < arr.length; j++){
                arr[j]
            }
        }
    }

    for(var i = 0,len = arr.length; i < len; i++){
        set.add(arr[i]);
    }
    for( var s of set){
        dup.push(s);
    }
    return dup;
}

function GenerateV(){
    var i,j,lenx,leny;
    XI = DuplicateAndSort(XI);
    YI = DuplicateAndSort(YI);
    for(i = 0, leny = XI.length; i < leny; i++){ 
         var m = XI[i];
        for( j = 0, lenx = YI.length; j < lenx; j++){
            var n = YI[j];    
            if(barrier[m][n].value != 0){   
                barrier[m][n].vx = i;
                barrier[m][n].vy = j;       
                VectorPoint[i][j] = barrier[m][n];
            }else {
                VectorPoint[i][j] = null;
            }
        }
    }
}

function dirns(s,d){
    var sx = s.x,dx = d.x;
    var sy = s.y,dy = d.y;
    var dirns = "";
    if(dy > sy)
        dirns += "N";
    if(dx > sx)
        dirns += "E";
    if(dy < sy)
        dirns += "S";
    if(dx < sx)
        dirns += "W";

    return dirns;
}

function Distance(s,d){
    return Math.abs(s.x - d.x) + Math.abs(d.y-s.y);
}

function neighbure(n,d){
    if(n == "l"){ 
        if(d == "N")
            return "W";
        else if(d == "E")
            return "N";
        else if(d == "S")
            return "E";
        else if(d == "W")
            return "S";
        
    }else if(n == "r"){
        if(d == "N")
            return "E";
        else if(d == "E")
            return "S";
        else if(d == "S")
            return "W";
        else if(d == "W")
            return "N";

    }else if(n == "re"){
        if(d == "N")
            return "S";
        else if(d == "E")
            return "W";
        else if(d == "S")
            return "N";
        else if(d == "W")
            return "E";
    }
}


function GenerateE(s){ 

    var D = s.d;
    var x = s.vx;
    var y = s.vy;
    var dr = neighbure("r",D);
    var dl = neighbure("l",D);
    var list = new Array();

    if(D == "N"){
        if((y < (Y-1)) && (VectorPoint[x][y+1] != null)){
            var p = 
            list.push(VectorPoint[x][y+1]);
        }
    }
    else if(D == "S"){
        if((y > 0) && (VectorPoint[x][y-1] != null)){
            list.push(VectorPoint[x][y-1]);
        }
    }
    else if(D == "E"){
        if((x < (X -1)) && VectorPoint[x+1][y] != null){
            list.push(VectorPoint[x+1][y]);
        }
    }
    else if(D == "W"){
        if((x > 0) && VectorPoint[x-1][y] != null){
            var p = VectorPoint[x-1][y];
            list.push(barrier[p.x][p.y]);
        }
    }
    /////////////////////////////////////////////////
    if(dr == "N"){
        if((y < (Y-1)) && (VectorPoint[x][y+1] != null)){
            list.push(VectorPoint[x][y+1]);
        }
    }
    else if(dr == "S"){
        if((y > 0) && (VectorPoint[x][y-1] != null)){
            list.push(VectorPoint[x][y-1]);
        }
    }
    else if(dr == "E"){
        if((x < (X -1)) && VectorPoint[x+1][y] != null){
            list.push(VectorPoint[x+1][y]);
        }
    }
    else if(dr == "W"){
        if((x > 0) && VectorPoint[x-1][y] != null){
            list.push(VectorPoint[x-1][y]);
        }
    }
   //////////////////////////////////////////////////////
    if(dl == "N"){
        if((y < (Y-1)) && (VectorPoint[x][y+1] != null)){
            list.push(VectorPoint[x][y+1]);
        }
    }
    else if(dl == "S"){
        if((y > 0) && (VectorPoint[x][y-1] != null)){
            list.push(VectorPoint[x][y-1]);
        }
    }
    else if(dl == "E"){
        if((x < (X -1)) && VectorPoint[x+1][y] != null){
            list.push(VectorPoint[x+1][y]);
        }
    }
    else if(dl == "W"){
        if((x > 0) && VectorPoint[x-1][y] != null){
            list.push(VectorPoint[x-1][y]);
        }
    }

    barrier[s.x][s.y].plist = list;
   
}

function Bends(s,d){
    var ds = dirns(s,d);
    if(s.d == d.d && ds == s.d )
        return 0;
    if((neighbure("l",d.d) == s.d || neighbure("r",d.d) == s.d) && (ds.indexOf(s.d) !=-1 ))
        return 1;
    if((s.d == d.d && (ds != s.d && ds.indexOf(s.d)!=-1)) || (( s.d == neighbure("re",d.d)) && ds != d.d))
        return 2;
    if((neighbure("l",d.d) == s.d || neighbure("r",d.d) == s.d) && (ds.indexOf(s.d) ==-1 ))
        return 3;
    if((neighbure("re",d.d) == s.d && ds == d.d) || (s.d == d.d && ds.indexOf(s.d) ==-1 ))
        return 4;
}

function Entry(v,D,lv,bv,cv){
    var object = new Object();

    object.v=v;
    object.D=D;
    object.lv=lv;
    object.bv=bv;
    object.cv=cv;

    return object;		
}

function Queue(){
    var items = new Array();

    function QueueElememt(elememt){
        this.elememt = elememt;
        this.priority = elememt.cv;
    }

    this.enqueue = function(elememt){
        var queueElememt = new QueueElememt(elememt);
        if(this.isEmpty()){
                items.push(queueElememt);
        }   else {
            var added = false;
            for(var i = 0, len = items.length; i < len; i++){
                if(queueElememt.priority < items[i].priority || queueElememt.priority == items[i].priority){
                    items.splice(i,0,queueElememt);
                    added = true;
                    break;
                }
            }
            if(!added){
                items.push(queueElememt);
            }
        }  
    }
    this.dequeue = function(){
        return items.shift();
    }
    this.isEmpty = function(){
        return items.length  == 0;
    }
    this.size = function(){
        return items.length;
    }
    this.front = function() {
        return items[0];
    }
    this.print = function() {
        console.log(items.toString());
    }
}

function getPath(s,d){
    var dir = dirns(s,d);
    var Ds = dir.charAt(0); s.d = Ds;
    var Dd = dir.charAt(1); d.d = Dd;

    var lv = Distance(s,s);
    var bv = Bends(s,d);
    var cv = Distance(s,d) + bv;

    s.parent = null;
    barrier[s.x][s.y] = s;
    var entrys = new Entry(s,Ds,lv,bv,cv);
    var queue = new Queue();
    queue.enqueue(entrys);
    
    var flag = false;
    while(!queue.isEmpty() && !flag){
        var entry = queue.dequeue().elememt;
        var s = entry.v, Ds = entry.D, ls = entry.lv, bs = entry.bv;
        //s = barrier[s.x][s.y];
        GenerateE(s);
        //d.d = dirns(s,d);
        for(var i = 0, len = s.plist.length; i < len; i++){
            var v = s.plist.shift();
            var Dv = dirns(s,v);
            v.d = Dv;
            var lv = ls + Distance(s,v);
            var bv;
            if(Dv == Ds)
                bv = bs;
            else
                bv = bs + 1 + Bends(v,d); 
            v.parent = barrier[s.x][s.y];
            barrier[v.x][v.y] = v;
            if( v.x == d.x && v.y == d.y){
                flag = true;
                break;
            }
            else{
                var entryv = new Entry(v,Dv,lv,bv,lv+bv+ Distance(v,d)); //Entry(v: any, D: any, lv: any, bv: any,cv: any):
                queue.enqueue(entryv);
            }
        }
    }

    var p = d;
    while(p.parent != null){
        barrier[p.x][p.y].value = '*';
        p = p.parent;
    }
    barrier[p.x][p.y].value = '*';

    
}

function display(){
    console.log("\n\n");
    var string = "";
    for(var i = 0; i < X;i ++){
        for(var j = 0; j < Y; j++){
            string += barrier[i][j].value + " " ;
        }
        console.log(string); 
        string = "";
    }
}

function init(){
    var rect1 = new Rectangle(4,2,3,3);
    var rect2 = new Rectangle(1,6,3,3);
    var rect3 = new Rectangle(1,16,6,3);
    var rect4 = new Rectangle(9,1,7,5);
    var rect5 = new Rectangle(12,11,4,3);

    initialBarrier(rect1);
    initialBarrier(rect2);
    initialBarrier(rect3);
    initialBarrier(rect4);
    initialBarrier(rect5);

    display();
}

init();
GenerateV();
var s; 
var d;
s = barrier[5][5];
d = barrier[12][6];
//getPath(s,d);
d = barrier[4][7];
//getPath(s,d);
s = barrier[12][6];
d = barrier[4][15];
getPath(s,d);
display();