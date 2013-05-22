



GcodeWriter = {
  
  // repetitive point deletion
  ////////////////////////////
  // Any point that is within this distance from the
  // last used point is ignored.
  // This also has the effect of merging geometry made from
  // short lines into one segment.
  // TODO: include angles into the deletion check
  DELETION_EPSILON_SQUARED : Math.pow(0.005, 2),
  NDIGITS : 2,

  write : function(segments, scale, xoff, yoff) {
    var glist = [];
    var nsegment = 0;
    var x_prev = 0.0;
    var y_prev = 0.0;
    var del_count = 0;
    
    for (var i=0; i<segments.length; i++) {
      var segment = segments[i];
      var prelength = segment.length;
      if (segment.length > 0) {
        var vertex = 0;
        var x = segment[vertex][0]*scale + xoff;
        var y = segment[vertex][1]*scale + yoff;
        if (Math.pow(x_prev-x,2) + Math.pow(y_prev-y,2) > this.DELETION_EPSILON_SQUARED) {
          glist.push("G00X"+x.toFixed(this.NDIGITS)+"Y"+y.toFixed(this.NDIGITS)+"\n");
          nsegment += 1;
          x_prev = x; y_prev = y;
        } else {
          del_count++;
        }
        for (vertex=1; vertex<segment.length; vertex++) {
          var x = segment[vertex][0]*scale + xoff
          var y = segment[vertex][1]*scale + yoff
          if ((Math.pow(x_prev-x,2) + Math.pow(y_prev-y,2) > this.DELETION_EPSILON_SQUARED) 
                || (vertex == segment.length-1))
          {
            glist.push("G01X"+x.toFixed(this.NDIGITS)+"Y"+y.toFixed(this.NDIGITS)+"\n");
            x_prev = x; y_prev = y;
          } else {
            del_count++
          }
        }
      }      
    }
    // report if there were many suspiciously many congruent points
    if (del_count > 20) {
      $().uxmessage('notice', "GcodeWriter: deleted many congruent points: " + del_count);
    }       
    // $().uxmessage('notice', "wrote " + nsegment + " G-code toolpath segments");
    return glist.join('');
  },

  write_raster : function(raster, scale, overscan, invert) {
    var glist = [];
    var x_off = raster[0][0] * scale;
    var y_off = raster[0][1] * scale;
    var width = raster[1][0] * scale;
    var height = raster[1][1] * scale;
    var bmp_width = raster[2][0];
    var bmp_height = raster[2][1];
    var data = raster[3];
    var dot_size = width / bmp_width;
    var count = 0;
    var z_off = 0;
    
    if (invert > 0)
        z_off = -1;

    glist.push("G00X"+x_off.toFixed(this.NDIGITS)+"Y"+y_off.toFixed(this.NDIGITS)+"\n");
    glist.push("G8 P"+dot_size.toFixed(this.NDIGITS+2)+"\n");
    glist.push("G8 X"+overscan.toFixed(this.NDIGITS)+"Z"+z_off.toFixed(this.NDIGITS)+"\n");
    glist.push("G8 N0\n");
    
    for (var y=0; y<bmp_height; y++) {
      glist.push("G8 D");
      for (var x=0; x<bmp_width; x++) {
        if (data[y*bmp_width + x] == 0) {
          glist.push("1");
        } else {
          glist.push("0");
        }
        count++;
        if (count % 70 == 0) {
            glist.push("\nG8 D");
        }
      }
      glist.push("\nG8 N0\n");
    }
    
    return glist.join('');
  }
  
}




