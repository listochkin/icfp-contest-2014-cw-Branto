
function generate(x,y,power_pills, fruits, ghosts, lambda_man) {
    var map = new generate_map(x,y,power_pills, fruits, ghosts, lambda_man);
    return map;
}

function get_text(x,y) {
    var map = new generate_map(x,y);
    return map.get_txt();
}

function generate_map(x, y, power_pills, fruits, ghosts, lambda_man){
    this.x = x;
    this.y = y;
    var noborder_map = gen_empty_field(x-2,y-2);
    //console.log(noborder_map);
    noborder_map = mark_hole(x -2,y - 2,noborder_map);
    var empty_cells = empty_cells_count(x - 2,y - 2,noborder_map);
    noborder_map = add_pills(x - 2,y - 2,noborder_map, 0.7);
    set_random_empty_cell(x - 2,y - 2,noborder_map,empty_cells,power_pills, fruits, ghosts, lambda_man);
    this.map = add_border(x,y,noborder_map);
    console.log(this.map);
    this.get_txt = function() {
        var text = '';
        for(var j=0; j<this.y; j++){
            for(var i=0; i<this.x; i++){
                text += this.map[j][i];
            }
            text += '\n';
        }
        return text;
    };
    this.get_html = function() {
        var text = '<table  border="1" cellpadding="3" cellspacing="1">';
        for(var j=0; j<this.y; j++){
            text += '<tr>';
            for(var i=0; i<this.x; i++){
                text += '<td style="width: 20px" ' + ((this.map[j][i]=='#') ? 'bgcolor="grey"' : '') + '>' + this.map[j][i] + '</td>';
            }
            text += '</tr>\n';
        }
        text += '</table>\n';
        return text;
    };
    //return gen_empty_field(x,y);
}

function add_border(x,y,noborder_map) {
    var map = gen_empty_field(x,y);
    for(var j=0; j< (y-2); j++){
        for(var i=0; i< (x-2); i++){
            map[j + 1][i + 1] = noborder_map[j][i];
        }
    }
    return map;
}

function mark_hole(x,y,map){
    var start_x = Math.floor(Math.random() * (x));
    var start_y = Math.floor(Math.random() * (y));
    position = {x: start_x, y: start_y};
    //map[start_y][start_x] = ' ';
    i = 0;
    j = 0;
    while(i < x*y){
        var step = Math.floor(Math.random() * 4) + 1;
        if(!try_step(step,position, map, x-1,y-1))
            j++;
        else
            j = 0;
        if(i > 20){
            var k=0;
            do{
                start_x = Math.floor(Math.random() * (x));
                start_y = Math.floor(Math.random() * (y));
                if(k > 2*x*y)
                    return map;
                k++;
            }while(map[start_y][start_x] == '#')
            position = {x: start_x, y: start_y};
            var step = Math.floor(Math.random() * 4) + 1;
            try_step(step,position, map, x-1,y-1);
            j = 0;
        }
        i++;
    }

    return map;
}

function in_array(needle, haystack) {
    for(var i in haystack) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function set_random_empty_cell(x,y,map,empty_cells,power_pills, fruits, ghosts, lambda_man){
    var total_count = power_pills + fruits + ghosts + lambda_man;
    if(empty_cells.length < total_count)
        return false;
    var generated = [];
    while(generated.length < total_count) {
        var n = Math.floor(Math.random() * (empty_cells.length -1) + 1);
        if(! in_array(n, generated))
            generated.push(n);
    }
    for(var i=0; i< power_pills; i++){
        n = empty_cells[generated.pop()];
        map[Math.floor(n/x)][n%x] = 'o';
    }
    for(var i=0; i< fruits; i++){
        n = empty_cells[generated.pop()];
        map[Math.floor(n/x)][n%x] = '%';
    }
    for(var i=0; i< ghosts; i++){
        n = empty_cells[generated.pop()];
        map[Math.floor(n/x)][n%x] = '=';
    }
    n = empty_cells[generated.pop()];
    map[Math.floor(n/x)][n%x] = '\\';
}

function empty_cells_count(x,y,map){
    var cells=[];
    for(var j=0; j< y; j++){
        for(var i=0; i< x; i++){
            if(map[j][i] == ' ')
                cells.push(j*x+i);
        }
    }
    return cells;
}

function add_pills(x,y,map, chance){
    for(var j=0; j< y; j++){
        for(var i=0; i< x; i++){
            if((map[j][i] == ' ')&& (Math.random() <= chance))
                map[j][i] = '.';
        }
    }
    return map;
}



function find_square(arr) {
    for(var j=0; j<5; j++){
        for(var i=0; i<5; i++){
            if((arr[j][i] == ' ') && (arr[j][i+1] == ' ') && (arr[j+1][i] == ' ') && (arr[j+1][i+1] == ' '))
                return true;
        }
    }
    return false;
}

function mark_field(map, max_x, max_y,p){
    if(((p.x >= 0) && (p.x <= max_x)) && ((p.y >= 0) && (p.y <= max_y)))
        map[p.y][p.x] = ' ';
}

function test_field_chunck(map, max_x, max_y,p,p1,p2) {
    var arr = new Array();
    for(var j=0; j<=6; j++){
        arr[j] = new Array();
        for(var i=0; i<=6; i++){
            if(((p.x + i-3) < 0) || ((p.x + i-3) > max_x))
                arr[j][i] = '#';
            else if(((p.y + j-3) < 0) || ((p.y + j-3) > max_y))
                arr[j][i] = '#';
            else {
                arr[j][i] = map[p.y + j-3][p.x + i-3];
                if((p1.x == (p.x + i-3)) && (p1.y == (p.y + j-3)))
                    arr[j][i] = ' ';
                if((p2.x == (p.x + i-3)) && (p2.y == (p.y + j-3)))
                    arr[j][i] = ' ';
            }
        }
    }
    //console.log(arr);
    if(find_square(arr)){
        return false;
    }
    else
        return true;
}

function try_step(step,p, map, max_x, max_y) {
    switch (step) {
        case 1:
            //console.log('left');
            var p1 = {x:(p.x - 1), y: p.y};
            var p2 = {x:(p.x - 2), y: p.y};
            if(test_field_chunck(map, max_x, max_y,p,p1,p2)) {
                mark_field(map, max_x, max_y,p1);
                mark_field(map, max_x, max_y,p2);
                p.x = p.x -2;
                return true;
            }
            break;
        case 2:
            //console.log('right');
            var p1 = {x:(p.x + 1), y: p.y};
            var p2 = {x:(p.x + 2), y: p.y};
            if(test_field_chunck(map, max_x, max_y,p,p1,p2)) {
                mark_field(map, max_x, max_y,p1);
                mark_field(map, max_x, max_y,p2);
                p.x = p.x +2;
                return true;
            }
            break;
        case 3:
            //console.log('top');
            var p1 = {x: p.x, y: (p.y - 1)};
            var p2 = {x: p.x, y: (p.y - 2)};
            if(test_field_chunck(map, max_x, max_y,p,p1,p2)) {
                mark_field(map, max_x, max_y,p1);
                mark_field(map, max_x, max_y,p2);
                p.y = p.y -2;
                return true;
            }
            break;
        case 4:
            //console.log('down');
            var p1 = {x: p.x, y: (p.y + 1)};
            var p2 = {x: p.x, y: (p.y + 2)};
            if(test_field_chunck(map, max_x, max_y,p,p1,p2)) {
                mark_field(map, max_x, max_y,p1);
                mark_field(map, max_x, max_y,p2);
                p.y = p.y +2;
                return true;
            }
            break;
    }
    return false;
}
/*
function try_step(step,p, map, max_x, max_y) {
    //console.log(p);
    //console.log('max_x:'+ max_x + 'max_y' + max_y);
    switch (step) {
        case 1:
            //console.log('left');
            if((p.x - 2) >= 0) {
                if((p.y - 1) >= 0){
                    if(((map[p.y - 1][p.x] == ' ') && (map[p.y - 1][p.x - 1] == ' ')) || ((map[p.y - 1][p.x - 2] == ' ') && (map[p.y - 1][p.x - 1] == ' ')))
                        return false;
                    if((map[p.y - 1][p.x-1] == ' ') && (map[p.y - 1][p.x] == ' ') && (map[p.y][p.x] == ' '))
                        return false;
                    if((p.x - 3) >= 0) {
                        if((map[p.y - 1][p.x-2] == ' ') && (map[p.y - 1][p.x - 3] == ' ') && (map[p.y][p.x - 3] == ' '))
                          return false;
                    }
                }
                if((p.y + 1) <= max_y){
                    if(((map[p.y + 1][p.x] == ' ') && (map[p.y + 1][p.x - 1] == ' ')) || ((map[p.y + 1][p.x - 2] == ' ') && (map[p.y + 1][p.x - 1] == ' ')))
                        return false;
                    if((map[p.y + 1][p.x-1] == ' ') && (map[p.y + 1][p.x] == ' ') && (map[p.y][p.x] == ' '))
                        return false;
                    if((p.x - 3) >= 0) {
                        if((map[p.y + 1][p.x-2] == ' ') && (map[p.y + 1][p.x - 3] == ' ') && (map[p.y][p.x - 3] == ' '))
                            return false;
                    }
                }
                map[p.y][p.x -1] = ' ';
                map[p.y][p.x -2] = ' ';
                p.x = p.x -2;
                return true;
            }
            break;
        case 2:
            //console.log('right');
            if((p.x + 2) <= max_x) {
                if((p.y - 1) >= 0){
                    if(((map[p.y - 1][p.x] == ' ') && (map[p.y - 1][p.x + 1] == ' ')) || ((map[p.y - 1][p.x + 2] == ' ') && (map[p.y - 1][p.x + 1] == ' ')))
                        return false;
                    if((map[p.y - 1][p.x+1] == ' ') && (map[p.y - 1][p.x] == ' ') && (map[p.y][p.x] == ' '))
                        return false;
                    if((p.x + 3) <= max_x) {
                        if((map[p.y - 1][p.x+2] == ' ') && (map[p.y - 1][p.x + 3] == ' ') && (map[p.y][p.x + 3] == ' '))
                            return false;
                    }
                }
                if((p.y + 1) <= max_y){
                    if(((map[p.y + 1][p.x] == ' ') && (map[p.y + 1][p.x + 1] == ' ')) || ((map[p.y + 1][p.x + 2] == ' ') && (map[p.y + 1][p.x + 1] == ' ')))
                        return false;
                    if((map[p.y + 1][p.x+1] == ' ') && (map[p.y + 1][p.x] == ' ') && (map[p.y][p.x] == ' '))
                        return false;
                    if((p.x + 3) <= max_x) {
                        if((map[p.y + 1][p.x+2] == ' ') && (map[p.y + 1][p.x + 3] == ' ') && (map[p.y][p.x + 3] == ' '))
                            return false;
                    }
                }
                map[p.y][p.x +1] = ' ';
                map[p.y][p.x +2] = ' ';
                p.x = p.x +2;
                return true;
            }
            break;
        case 3:
            //console.log('top');
            if((p.y - 2) >= 0) {
                if((p.x - 1) >= 0){
                    if(((map[p.y][p.x - 1] == ' ') && (map[p.y - 1][p.x - 1] == ' ')) || ((map[p.y - 2][p.x - 1] == ' ') && (map[p.y - 1][p.x - 1] == ' ')))
                        return false;
                    if((map[p.y - 1][p.x - 1] == ' ') && (map[p.y][p.x - 1] == ' ') && (map[p.y][p.x] == ' '))
                        return false;
                    if((p.y - 3) >= 0) {
                        if((map[p.y - 2][p.x - 1] == ' ') && (map[p.y - 3][p.x - 1] == ' ') && (map[p.y - 3][p.x] == ' '))
                            return false;
                    }
                }
                if((p.x + 1) <= max_x){
                    if(((map[p.y][p.x + 1] == ' ') && (map[p.y - 1][p.x + 1] == ' ')) || ((map[p.y - 2][p.x + 1] == ' ') && (map[p.y - 1][p.x + 1] == ' ')))
                        return false;
                    if((map[p.y - 1][p.x + 1] == ' ') && (map[p.y][p.x +1] == ' ') && (map[p.y][p.x] == ' '))
                        return false;
                    if((p.y - 3) >= 0) {
                        if((map[p.y - 2][p.x + 1] == ' ') && (map[p.y - 3][p.x + 1] == ' ') && (map[p.y - 3][p.x] == ' '))
                            return false;
                    }
                }
                map[p.y - 1][p.x] = ' ';
                map[p.y - 2][p.x] = ' ';
                p.y = p.y -2;
                return true;
            }
            break;
        case 4:
            //console.log('down');
            if((p.y + 2) <= max_y) {
                if((p.x - 1) >= 0){
                    if(((map[p.y][p.x - 1] == ' ') && (map[p.y + 1][p.x - 1] == ' ')) || ((map[p.y + 2][p.x - 1] == ' ') && (map[p.y + 1][p.x - 1] == ' ')))
                        return false;
                    if((map[p.y + 1][p.x - 1] == ' ') && (map[p.y][p.x - 1] == ' ') && (map[p.y][p.x] == ' '))
                        return false;
                    if((p.y + 3) <= max_y) {
                        if((map[p.y + 2][p.x - 1] == ' ') && (map[p.y + 3][p.x - 1] == ' ') && (map[p.y + 3][p.x] == ' '))
                            return false;
                    }
                }
                if((p.x + 1) <= max_x){
                    if(((map[p.y][p.x + 1] == ' ') && (map[p.y + 1][p.x + 1] == ' ')) || ((map[p.y + 2][p.x + 2] == ' ') && (map[p.y + 1][p.x + 1] == ' ')))
                        return false;
                    if((map[p.y + 1][p.x + 1] == ' ') && (map[p.y][p.x +1] == ' ') && (map[p.y][p.x] == ' '))
                        return false;
                    if((p.y + 3) <= max_y) {
                        if((map[p.y + 2][p.x + 1] == ' ') && (map[p.y + 3][p.x + 1] == ' ') && (map[p.y + 3][p.x] == ' '))
                            return false;
                    }


                }
                map[p.y + 1][p.x] = ' ';
                map[p.y + 2][p.x] = ' ';
                p.y = p.y +2;
                return true;
            }
            break;
    }
    return false;
}
*/

function gen_empty_field(x, y) {
    var arr = new Array();
    for(var j=0; j<y; j++){
        arr[j] = new Array();
        for(var i=0; i<x; i++){
            arr[j][i] = '#';
        }
    }
    return arr;
}

if(!module.parent){
//    start();
}
else {
    exports.generate = generate;
    exports.get_text = get_text;
    console.log("Generator required by module: " + module.parent.filename);
}