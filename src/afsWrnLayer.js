var defaultStyle;
var color;
var prevOptions = {};
var legend;

function afsWrnLayer(map, num, options) {
  initPane(map, options);
  initLayer(map, num, options);
  if (num <= 1) initLegendControl(map);
  loadReg(map, num, options);
  if (num <= 1) makeLegendControl();

  map.on("zoomend", function(ev) {
    var zoomLevel = ev.target.getZoom();
    setLayerStyle(map, num, zoomLevel);
  });
  map.on("zoomanim", function(ev) {
    var zoomLevel = ev.zoom;
    if (zoomLevel <= 13 && map.hasLayer(regkoLayer[num])) {
      setLayerStyle(map, num, zoomLevel);
    }
  });
}

/**
 * ��� : �� �г�
 */
function initPane(map, options) {
  // WRN ǥ��� pane �߰�
  var mapPaneName = options.pane;
  map.createPane(mapPaneName);
  map.getPane(mapPaneName).style.zIndex = 250;
  // pane ���� layer���� ���콺 �� Ŭ�� �̺�Ʈ
  //map.getPane(mapPaneName).style.pointerEvents = "none";
}

/**
 * ��� : ���̾� �ʱ�ȭ
 */
function initLayer(map, num, options) {
  map.getContainer().style.background = "#FFFFFF";
  regkoLayer[num] = L.layerGroup().addTo(map);

  defaultStyle = {
    "fill" : false,
    "color" : "#000000",
    "weight" : 1,
    "opacity" : 1,
    "pane" : options.pane
  };

  color = {
    "WHITE": "rgb(255, 255, 255)", // ���
    "BLACK": "rgb(  0,   0,   0)", // ������
    "GRAY" : "rgb(180, 180, 180)", // ȸ��
    "C": "rgb(  0, 127, 255)", // ����
    "C0": "#E0E0E0", // ����(����)
    "C1": "#A0DEFC", // ����(���Ǻ�)
    "C2": "#7194DC", // ����(�溸)
    "H": "rgb(195,   0, 195)", // ����
    "H0": "#E0E0E0", // ����(����)
    "H1": "#FFC8FF", // ����(���Ǻ�)
    "H2": "#F566A2", // ����(�溸)
    "D": "rgb(255, 127,   0)", // ����
    "D0": "#E0E0E0", // ����(����)
    "D1": "#FFFF90", // ����(���Ǻ�)
    "D2": "#FFC90E", // ����(�溸)
    "F": "rgb(128,  20,  10)", // �Ȱ�
    "O": "rgb(195, 192, 145)", // ��ǳ����
    "R": "rgb(  0,   0, 255)", // ȣ��
    "S": "rgb(255,   0, 255)", // �뼳
    "T": "rgb(255,   0,   0)", // ��ǳ
    "V": "rgb(  0, 255, 255)", // ǳ��
    "W": "rgb(  0, 240,   0)", // ��ǳ
    "Y": "rgb(255, 255,   0)"  // Ȳ��
  };
}

/**
 * ��� : ���̾� ��Ÿ��
 */
function setLayerStyle(map, num, zoomLevel) {
  var _isLocalShow = zoomLevel > 13;

  if (geoJson[num]) {
    // ����ó��(�︪��.����, ��굵.ȫ��, �ž�(��������), ����5��, �Ź������ʵ�, �ϵ�)
    var except = "L1072100,L1052500,L1052200,L1014100,L1052600,L1051600";
    geoJson[num].getLayers().map(function(layer) {
      if (layer.feature.properties.ground == "local") {
        if (except.indexOf(layer.feature.properties.regid) >= 0) {
          // ����ó��
          layer.setStyle({ stroke : true, color: getColor('BLACK') });
          if (num <= 1) layer.on('click', fnScrollTable);
          else layer.on('click', fnWrnAdd);
        } 
        else if (zoomLevel > 0) {
          layer.setStyle({ stroke : true, color: getColor('GRAY') });
          if (num <= 1) layer.on('click', fnScrollTable);
          else layer.on('click', fnWrnAdd);
        }
        else {
          //layer.setStyle({ stroke : false });
        }
      }
    });
    if (_isLocalShow) {
      regkoLayer[num].addTo(map);
    }
    else {
      map.removeLayer(regkoLayer[num]);
    }
  }
}

/**
 * ��� : Ư�� ������ ����
 */
function getColor(wrnTp) {
  return color[wrnTp] == undefined ? "rgb(255, 255, 255)" : color[wrnTp];
}

/**
 * ��� : ���� ��Ÿ�� ��ȸ
 */
function getWrnPatternSvg(wrnNow) {
  // Rect pixel ũ��
  var p = 2;
  // �⺻ �ɼ�
  var commonOptions = {
    width: p,
    height: p,
    fill: true,
    fillOpacity: 1,
    stroke: false
  };

  var pattern = patternArr[wrnNow] == undefined ? null : patternArr[wrnNow];
  if (pattern == null) {
    // ���� ���� �����
    var wrnLen = parseInt(wrnNow.length / 2);
    var cx = 0;
    var cy = 0;
    // �⺻ ���� ������ 2x2
    var w = 2, h = 2;
    if (wrnLen > 2) {
      w = wrnLen*2;
    }
    var _wrnLvl = 0; // ����, ���Ǻ�, �溸 ����
    var _color = getColor('WHITE'); // �⺻�� white
    var PatternRect;
    var PatternRectArr = [];
    for (var x = 0, k = 0; x < w; x++) {
      k = x % wrnLen;
      _wrnLvl = parseInt(wrnNow[k*2+1]);
      for (var y = 0; y < h; y++) {
        switch (_wrnLvl) {
          case 0:// ����
            if (cx == 0 && cy == 0) {
              _color = getColor(wrnNow[k*2]);
            } else {
              _color = getColor('WHITE');
            }
            break;
          case 1:// ���Ǻ�
            if (cy == cx) {
              //_color = getColor(wrnNow[k*2]);
              _color = getColor(wrnNow);
            } else {
              _color = getColor('WHITE');
            }
            break;
          case 2:// �溸
            //_color = getColor(wrnNow[k*2]);
            _color = getColor(wrnNow);
            break;
          default:
            _color = getColor('WHITE');
            break;
        } // end switch
        PatternRect = new L.PatternRect(L.extend({}, commonOptions, { x: x*p, y: y*p, color: _color }));
        PatternRectArr.push(PatternRect);
        cy = cy^1;
      }
      cx = cx^1;
    }
    pattern = new L.Pattern({ width: w*p, height: h*p });
    for (var i = 0; i < PatternRectArr.length; i++) {
      pattern.addShape(PatternRectArr[i]);
    }
    pattern.addTo(map);
    patternArr[wrnNow] = pattern;
  }

  return pattern;
}

/**
 * ��� : ���̾� ���� (CANVAS)
 */
function getWrnPatternCanvas(wrnNow, wrnLvl) {
  if (!wrnNow || wrnNow == "" || wrnNow.length == 0) {
    return getColor('WHITE');
  }

  // Rect pixel ũ��
  var p = 2;
  if (patternArr[wrnNow] == null) patternArr[wrnNow] = [];

  // ���� ũ��
  if (wrnNow == wrnLvl) var k = 1;
  else var k = 2;

  var pattern = patternArr[wrnNow][wrnLvl] == undefined ? null : patternArr[wrnNow][wrnLvl];
  if (pattern == null) {
      
    // ���� ���� �����
    var canvas = document.createElement("canvas");
      
    var cx = 0;
    var cy = 0;
    // �⺻ ���� ������ 8x8
    var w = 8, h = 8;

    canvas.width = w*p;
    canvas.height = h*p;
    var ctx = canvas.getContext('2d');
    var _wrnLvl = 0; // ����, ���Ǻ�, �溸 ����
    var _color = getColor('WHITE'); // �⺻�� white
    var _wrnLvl = parseInt(wrnNow[1]);

    for (var x = 0; x < w; x++) {
      for (var y = 0; y < h; y++) {
        switch (_wrnLvl) {
          case 0:// ����
            if (cx == 0 && cy == 0) {
              _color = getColor(wrnNow);
            } else {
              _color = getColor(wrnLvl);
            }
            break;
          case 1:// ���Ǻ�
            if (y % k == 0 && cy == cx) {
              if (wrnNow == wrnLvl) _color = getColor('WHITE');
              else _color = getColor(wrnNow);
            } else {
              _color = getColor(wrnLvl);
            }
            break;
          case 2:// �溸
            if (y % k == 0 && cy == cx) {
              if (wrnNow == wrnLvl) _color = getColor('WHITE');
              else _color = getColor(wrnNow);
            } else {
              _color = getColor(wrnLvl);
            }
            break;
          default:
            _color = getColor('WHITE');
            break;
        } // end switch
        ctx.fillStyle = _color;
        ctx.fillRect(x*p, y*p, p, p);
        cy = cy^1;
      }
      cx = cx^1;
    }

    pattern = ctx.createPattern(canvas, 'repeat');
    patternArr[wrnNow][wrnLvl] = pattern;
  }

  return pattern;
}

/**
 * ��� : ���̾� ���� ����
 */
function setLayerPattern(map) {
  geoJson.getLayers().map(function(layer) {
    var wrnNow = layer.feature.properties.wrnNow;
    if (wrnNow != undefined || wrnNow == "") {
      if (map.options.preferCanvas) {
        var pattern = getWrnPatternCanvas(wrnNow);
        layer.setStyle({ fillColor: pattern, fillOpacity: 1.0, fill: true });
      } else {
        var pattern = getWrnPatternSvg(wrnNow);
        layer.setStyle({ fillPattern: pattern, fillOpacity: 1.0, fill: true });
      }
    }
  });
}

/**
 * ��� : Ư�������� ǥ��
 */
function setWrnRegKo(regkoLayer, geoJsonLayers) {
  var fsize = 13;

  $.each(geoJsonLayers, function(k, v) {
    var regko = v.feature.properties.regko;
    var regkoLon = v.feature.properties.regkoLon;
    var pointSize = parseInt(regko.length) * (fsize);
    var mk = L.marker([regkoLon[1], regkoLon[0]], {
      icon :L.divIcon({
        html : "<span style=\"font-size:" + fsize + "px;\">" + regko + "</span>",
        iconSize : new L.Point(pointSize, fsize+2),
        iconAnchor : [20, 10]
      })
    });
    regkoLayer.addLayer(mk);
  });

}

/**
 * ��� : Ư������ ��ȸ
 */
function loadReg(map, num, options) {
  // ���� ��ȸ�� �̷��� ������ �������� ��Ȱ��
  if (giscoord) {
    setReg(giscoord, map, num, options);
    return;
  }

  // ���� ��� �ε�
  var _url = '/lsp/htdocs/data/giscoord.geojson';
  $.ajax({
    url: _url,
    dataType: 'json'
  })
  .done(function(data){
    setReg(data, map, num, options);
    giscoord = data;
  });
}

/**
 * ��� : Ư������ ����
 */
function setReg(data, map, num, options) { 

  geoJson[num] = L.layerGroup();
  for (var i=0; i<data.features.length; i++) {
    if (data.features[i].properties.ground == "global" || data.features[i].properties.ground == "local") {
      var coordinates = [];
      for (var j=0; j<data.features[i].geometry.coordinates.length; j++) {
        coordinates[j] = [];
        for (var k=0; k<data.features[i].geometry.coordinates[j].length; k++) {
          coordinates[j][k] = L.latLng(data.features[i].geometry.coordinates[j][k][1], data.features[i].geometry.coordinates[j][k][0]);
        }
      }
      if (data.features[i].properties.ground == "global") {
        var polyline = L.polyline(coordinates, defaultStyle);
        polyline.feature = data.features[i];
        geoJson[num].addLayer(polyline).addTo(map);
      }
      else if (data.features[i].properties.ground == "local") {
        var tooltip = "<div>" + data.features[i].properties.regko + "</div>";

        var polygon = L.polygon(coordinates, defaultStyle);
        polygon.feature = data.features[i];
        if (!geoJsonLayers[num]) geoJsonLayers[num] = {};
        geoJsonLayers[num][data.features[i].properties.regid] = polygon;
        geoJson[num].addLayer(polygon).addTo(map);
      }
    }
  }

  setWrnRegKo(regkoLayer[num], geoJsonLayers[num]);
  setLayerStyle(map, num, map.getZoom());
  //loadWrnNowData(options);
}

/**
 * ��� : ������ ���� ��
 */
function compareData(obj1, obj2) {
  var flag = true;
  if (Object.keys(obj1).length == Object.keys(obj2).length) {
    for (key in obj1) {
      if (obj1[key] == obj2[key]) {
        continue;
      } else {
        flag = false;
        break;
      }
    }
  } else {
    flag = false;
  }
  return flag;
}

/**
 * ��� : Ư�� ��Ȳ ��ȸ
 */
function loadWrnNowData(options) {
  var _options = JSON.parse(JSON.stringify(options));
  var _lv = options.lv;
  var _url = '/url/wrn_now_data.php?fe=' + options.fe + '&tm=' + options.tm + '&disp=0&help=0';

  // ���� ������ ��ȸ ��û�� ������ ��� ������
  if (!_url || compareData(_options, prevOptions)) return;

  $.ajax({
    url: _url,
    contentType: "application/x-www-form-urlencoded; charset=euc-kr",
    beforeSend:function(jqXHR) {
      jqXHR.overrideMimeType("application/x-www-form-urlencoded; charset=euc-kr");
    }
  })
  .done(function(result) {
    var resultArr = result.split('\n');
    $.each(resultArr, function(i, e) {
      if (e != "") {
        // ���� TRIM, �ߺ� ��������
        var _e = e.replace(/(^ *)|( *$)/g, '').replace(/\s\s+/g, ' ').split(',');
        if (_e[0].length > 0 && _e[0][0] != '#') {
          // ���� TRIM
          $.each(_e, function(j, el) {
            _e[j] = el.trim();
          });
          /*
          #---------------------------------------------------------------------------------------------------
          #  Ư����Ȳ ��ȸ
          #---------------------------------------------------------------------------------------------------
          #  1. REG_UP    : ���� Ư�������ڵ�
          #  2. REG_UP_KO : ���� Ư��������
          #  3. REG_ID    : Ư�������ڵ�
          #  4. REG_KO    : Ư��������
          #  5. TM_FC     : ��ǥ�ð�(����Ͻú�,KST)
          #  6. TM_EF     : ��ȿ�ð�(����Ͻú�,KST), ����Ư���� ��� �Ʒ��� ���� ��Ī�Ͽ� ���
          #                 - 02:59(�ѹ�), 05:59(����), 08:59(��ħ), 11:59(��������), 14:59(�̸�����), 17:59(��������), 20:59(����), 23:59(������), 11:58(����), 17:58(����), 14:58(��), 23:58(��)
          #  7. WRN       : Ư������
          #  8. LVL       : Ư������
          #  9. CMD       : Ư�����
          # 10. ED_TM     : �������� ����
          #---------------------------------------------------------------------------------------------------
          */
          if ((_lv == "0" && _e[7] != "����" && _e[6] != "�Ȱ�") || (_lv == "1" && _e[7] == "����") || _lv == "2" && _e[6] == "�Ȱ�") {
            //����Ư����..
            if (_e[6] != "����") return true;
            wrnNowData.push(_e);
          }
        }
      }
    });

    setWrnNowData();
    setWrnTitle(options);
    makeLegendControl();
  });
  prevOptions = JSON.parse(JSON.stringify(_options));
}

/**
 * ��� : Ư�� ��Ȳ ����
 */
function setWrnNowData() {

  // �ʱ�ȭ
  $.each(geoJsonLayers, function(k, v) {
    v.feature.properties.wrnNow = "";
  });

  // Ư�������� ��Ȳ ����
  if (wrnNowData.length > 0) {
    for (var i = 0; i < wrnNowData.length; i++) {
      var regid = wrnNowData[i][2];
      var wrnTp = wrnNowData[i][6];
      var wrnLvl = wrnNowData[i][7];
      wrnTp = convertWrnTp(wrnTp);
      wrnLvl = convertWrnLvl(wrnLvl);
      if (geoJsonLayers[regid] && wrnTp != '' && wrnLvl != '') {
        geoJsonLayers[regid].feature.properties.wrnNow += wrnTp + wrnLvl;
      }
    }
  }
  setLayerPattern();
}

/**
 * ��� : Ÿ��Ʋ ����
 */
function setWrnTitle(map, options) {
  // Ÿ��Ʋ ����
  var titleStr = "";
  if (options.tm != null && options.tm != "" ) {
    var tm = options.tm;
    var yyyy = tm.substring(0, 4);
    var MM = tm.substring(4, 6);
    var dd = tm.substring(6, 8);
    var hh = tm.substring(8, 10);
    var mi = tm.substring(10, 12);
    var tmStr = yyyy + "." + MM + "." + dd + ". " + hh + ":" + mi;
    var wrnTitle = "Ư��";
    if (options.lv == "1") {
      wrnTitle = "����Ư��";
    } else if (options.lv == "2") {
      wrnTitle = "�Ȱ�Ư��";
    }
    titleStr += "<span class='bTxt'>" + wrnTitle + "</span> ";
    if (options.fe == "e" || options.lv == "1") { // ��ȿ����
      titleStr += "��ǥ��Ȳ(" + tmStr + ")";
    } else { // �⺻�� ��ǥ���� fe: "f"
      titleStr += "��ȿ��Ȳ(" + tmStr + " ����)";
    }
  }
  $("#" + map.options.mapTitleId).html(titleStr);
}
  
/**
 * ��� : color bar legend
 */
function initLegendControl(map) {
  legend = L.control({position: 'bottomright'});
  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend');
    var divId = "wrn_legend";
    div.setAttribute("id", divId);
    return div;
  };
  legend.onRemove = function(map) {};
  legend.addTo(map);
}

  
/**
 * ��� : color bar legend
 */
function makeLegendControl() {
  // �ʱ�ȭ
  var div = document.querySelectorAll('#wrn_legend');
  for (var i=0; i<div.length; i++) {
    while (div[i].hasChildNodes()) {
      div[i].removeChild(div[i].childNodes[0]);
    }
  }

  /*
  // ���� �����Ϳ��� Ư�� ���� ã��
  if (wrnNowData.length > 0) {
    var wrnTpArr = [];
    for (var i = 0; i < wrnNowData.length; i++) {
      var wrnTp = wrnNowData[i][6];
      if (wrnTpArr.indexOf(wrnTp) == -1 && wrnTp != undefined) {
        wrnTpArr.push(wrnTp);
      }
    }
    for (var i = 0; i < wrnTpArr.length; i++) {
      var color = getColor(convertWrnTp(wrnTpArr[i]));
      $(legendDiv).append("<div class='wrnTp'><div class='square' style='background-color:" + color + ";'></div><div class='wrnTpTxt'>" + wrnTpArr[i] + "</div></div>");
    }
  }
  */

  wrn_arr = [1,2,0];
  for (var i = 0; i < wrn_arr.length; i++) {
    var color = getColor(wrn_mode + wrn_arr[i]);
    if (wrn_arr[i] == 1) var text = "���Ǻ�"
    else if (wrn_arr[i] == 2) var text = "�溸"
    else if (wrn_arr[i] == 0) var text = "����"

    for (var j=0; j<div.length; j++) {
      var element = document.createElement("div");
      element.classList.add("wrnTp");
      element.style.marginRight = "5px";
      var square  = document.createElement("div");
      square.classList.add("square");
      square.style.backgroundColor = color;
      var legendText = document.createElement("div");
      legendText.classList.add("wrnTpTxt");
      legendText.innerText = text;
      element.appendChild(square);
      element.appendChild(legendText);
      div[j].appendChild(element);
    }
  }
}

/**
 * ��� : Ư�� ���� �ڵ� ��ȯ
 */
function convertWrnTp(wrnTp) {
  var _wrnTp = '';
  switch (wrnTp) {
    case '����':
      _wrnTp = 'C';
      break;
    case '����':
      _wrnTp = 'D';
      break;
    case '�Ȱ�':
      _wrnTp = 'F';
      break;
    case '����':
      _wrnTp = 'H';
      break;
    case '��ǳ����':
      _wrnTp = 'O';
      break;
    case 'ȣ��':
      _wrnTp = 'R';
      break;
    case '�뼳':
      _wrnTp = 'S';
      break;
    case '��ǳ':
      _wrnTp = 'T';
      break;
    case 'ǳ��':
      _wrnTp = 'V';
      break;
    case '��ǳ':
      _wrnTp = 'W';
      break;
    case 'Ȳ��':
      _wrnTp = 'Y';
      break;
    default:
      break;
  } // end switch

  return _wrnTp;
}

/**
 * ��� : Ư�� ���� �ڵ� ��ȯ
 */
function convertWrnLvl(wrnLvl) {
  var _wrnLvl = '';
  switch (wrnLvl) {
    case '����':
      _wrnLvl = '0';
      break;
    case '����':
      _wrnLvl = '1';
      break;
    case '�溸':
      _wrnLvl = '2';
      break;
    default:
      break;
  } // end switch

  return _wrnLvl;
}