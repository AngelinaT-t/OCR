'use strict';
var X = 10;
var Y = 10; 
var barrier = new Array();
var XI = new Array();
var YI = new Array(); 
var VectorPoint = new Array();

function point(x,y){
    var object = new Object();
    object.value = -1;
    object.x=x;
    object.y=y;
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
        //console.log(p.value+"&&&");
        barrier[i][j]= p;
        //console.log(barrier[i][j].value+"%%%"); 
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
    //console.log(w+"$$" +h);
    XI.push(x,x+w,x+w+w);
    YI.push(y,y+h,y+h+h);
}

function insertsort(arr){
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
        }
    }
}

function GenerateV(){
    var i,j,lenx,leny;
    insertsort(XI);
    insertsort(YI);
    for(i = 0, leny = XI.length; i < leny; i++){ 
         var m = XI[i];
        // console.log("m=" + m);
        for( j = 0, lenx = YI.length; j < lenx; j++){
            var n = YI[j];
           // console.log("n=" + n);
           // console.log("bmnv=" + barrier[m][n].value);
            if(barrier[m][n].value != 0){
                //var p = point(i,j);
                var p = barrier[m][n];
                VectorPoint[i].push(p);
            }
        }
    }
    
   /* var s ="" ;
    for(i = 0, leny = VectorPoint.length; i < leny; i++){
        for(j = 0, lenx = VectorPoint[i].length; j < lenx; j++){
            s += ("("+VectorPoint[i][j].x + "," + VectorPoint[i][j].y +")  ");
        }
        console.log(s);
        s = "";
    }*/
}

function GenerateE(){
    var i,j,lenx,leny;
    for(i = 0, leny = VectorPoint.length; i < leny; i++){
        for(j = 0, lenx = VectorPoint[i].length; j < lenx; j++){
            //console.log("lenx = " + lenx +" leny=" + leny);
           // console.log(" VP = " + VectorPoint[i][j].x);
            //console.log(p.x+"%%%");
            var p = VectorPoint[i][j]; 
            var list = new Array();
            var ii = p.x, jj = p.y;
            if(ii == 0){ //first raw
                if(jj == 0){ // first col
                    //barrier[p.x][p.y].plist.push(VectorPoint[i][j+1],VectorPoint[i+1][j]); 
                    //
                    //var p1 = VectorPoint[i][j+1];
                    //var p2 = VectorPoint[i+1][j];
                   // p1 = barrier[p1.x][p1.y];
                   // console.log(p1.x+"%%%");
                    //p2 = barrier[p2.x][p2.y];i
                    //list.push(p1,p2);
                    list.push(barrier[ii][jj+1],barrier[ii+1][jj]);
                    barrier[ii][jj].plist = list;
                }else if(jj == lenx -1){ //last col
                   // console.log(VectorPoint[i+1][j].x+"%%%");
                    list.push(barrier[ii][jj-1],barrier[ii+1][jj]);
                    barrier[jj][jj].plist = list;
                }else{
                    list.push(barrier[ii][jj-1],barrier[ii][jj+1],barrier[ii+1][jj]);
                    barrier[ii][jj].plist = list;
                }
            }else if(ii == (leny -1)){ // last raw
                if(jj == 0){ // first col
                    list.push(barrier[ii][jj+1],barrier[ii-1][jj]);
                    barrier[ii][jj].plist = list;
                }else if(jj == lenx -1){ // last col
                    list.push(barrier[ii][jj-1],barrier[ii-1][jj]);
                    barrier[ii][jj].plist = list;j
                }else {
                    plist.push(barrier[ii][jj-1],barrier[ii][jj+1],barrier[ii-1][jj]);
                    barrier[ii][jj].plist = list;
                }
            }
            else{ //middle
                //console.log(p.x+"%%%" + p.y);
                //console.log(barrier[ii][jj-1].y+"  "+barrier[ii][jj+1].y+"  "+barrier[ii-1][jj].x+"  "+barrier[ii+1][jj].x);
                list.push(barrier[ii][jj-1],barrier[ii][jj+1],barrier[ii-1][jj],barrier[ii+1][jj]);
                barrier[ii][jj].plist = list;
            }
        }
    }
}

function dirns(s,d){
    var sx = s.x,dx = d.x;
    var sy = s.y,dy = d.y;
    var dirns = new Array();
    if(dy > sy)
        dirns.push("N");
    if(dx > sx)
        dirns.push("E");
    if(dy < sy)
        dirns.push("S");
    if(dx < sx)
        dirns.push("W");

    return dirns;
}



function Distance(s,d){
    return Math.abs(s.x - d.x) + Math.abs(d.y-s.y);
}

function neighbure(n,d){
    switch(n){
        case "l":
            switch(d){
                case "N":
                return "W";
                break;
                case "E":
                return "N";
                break;
                case "S":
                return "E";
                break;
                case "W":
                return "S";
                break;
                default:
                console.log("SwitchL error!");
            }
        break;
        case "r":
            switch(d){
                case "N":
                return "E";
                break;
                case "E":
                return "S";
                break;
                case "S":
                return "W";
                break;
                case "W":
                return "N";
                break;
                default:
                console.log("SwitchR error!");					
            }
        break;
        case "re":
            switch(d){
                case "N":
                return "S";
                break;
                case "E":
                return "W";
                break;
                case "S":
                return "N";
                break;
                case "W":
                return "E";
                break;
                default:
                console.log("SwitchRe error!");					
            }
        break;
        default:
        console.log("Switch error!");
    }
}
function Bends(s1,d1){
    var s = barrier[s1.x][s1.y];
    var d = barrier[d1.x][d1.y];
    var Ds = dirns(s,d);
    var ds = Ds[0] + Ds[1] +"";
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
    //object.p=p;
    object.cv=cv;

    return object;		
}

function Queue(){
    var items = new Array();

    function QueueElememt(elememt){
        //console.log("(((("+elememt.cv);
        this.elememt = elememt;
        this.priority = elememt.cv;
        //console.log(")))))"+this.priority);
    }

    this.enqueue = function(elememt){
        var queueElememt = new QueueElememt(elememt);
        if(this.isEmpty()){
                items.push(queueElememt);
        }   else {
            var added = false;
            for(var i = 0, len = items.length; i < len; i++){
                if(queueElememt.priority < items[i].priority){
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
    //console.log(s1);
    //var s = barrier[s1.x][s1.y];
    //var d = barrier[d1.x][d1.y];
    var dir = dirns(s,d);
    var Ds = dir[0]; s.d = Ds;
    var Dd = dir[1]; d.d = Ds;
    var lv = Distance(s,d);
    var bv = Bends(s,d);
    //var p = null;
    var cv = lv + bv;
    var entrys = new Entry(s,Ds,lv,bv,cv);
    var queue = new Queue();
    queue.enqueue(entrys);
    
    //console.log(entrys.D+"*****");
    barrier[s.x][s.y].parent = null;

    var flag = false;
   // console.log(queue.front());
    while(!queue.isEmpty() && !flag){
       // console.log(queue.front());
        //var entry = new Entry();
        var entry = queue.dequeue().elememt;
        var s = entry.v, Ds = entry.D, ls = entry.lv, bs = entry.bv;
        s = barrier[s.x][s.y];
        //console.log(s);
        for(var i = 0, len = s.plist.length; i < len; i++){
            var v = s.plist.shift();
            v = barrier[v.x][v.y];
            //console.log(v);
            var Dv = dirns(s,v); v.d = Dv;
            var lv = ls + Distance(s,v) + Distance(v,d);
            var bv;
            if(Dv == Ds)
                bv = bs;
            else
                bv = bs + 1 + Bends(v,d); 
            barrier[v.x][v.y].parent = new point(s.x,s.y); 
            if( v.x == d.x && v.y == d.y){
                flag = true;
                break;
            }
            else{
                var entryv = new Entry(v,Dv,lv,bv,lv+bv); //Entry(v: any, D: any, lv: any, bv: any,cv: any): 
                queue.enqueue(entryv);
                console.log("*********************");
            }
        }
        console.log(queue.isEmpty());
    }

    var p = d;
    while(p.parent != null){
        barrier[p.x][p.y].value= 3;
        p = p.parent;
    }

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
    //rect2 = new Rectangle(6,10,8,5);
    //rect3 = new Rectangle(1,16,6,3);
    //rect4 = new Rectangle(9,1,7,4);

    initialBarrier(rect1);
    //initialBarrier(rect2);
    //initialBarrier(rect3);
    //initialBarrier(rect4);

    /*var string = "";
    for(var i = 0; i < X; i++){
        for(var j = 0; j < Y; j++){
            string += barrier[i][j].value + " " ;
        }
        console.log(string); 
        string = "";
    }*/

}

init();
GenerateV();
GenerateE();
var s = barrier[3][1];
var d = barrier[7][3];
getPath(s,d);