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
 * 기능 : 맵 패널
 */
function initPane(map, options) {
  // WRN 표출용 pane 추가
  var mapPaneName = options.pane;
  map.createPane(mapPaneName);
  map.getPane(mapPaneName).style.zIndex = 250;
  // pane 내의 layer들의 마우스 및 클릭 이벤트
  //map.getPane(mapPaneName).style.pointerEvents = "none";
}

/**
 * 기능 : 레이어 초기화
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
    "WHITE": "rgb(255, 255, 255)", // 흰색
    "BLACK": "rgb(  0,   0,   0)", // 검정색
    "GRAY" : "rgb(180, 180, 180)", // 회색
    "C": "rgb(  0, 127, 255)", // 한파
    "C0": "#E0E0E0", // 한파(해제)
    "C1": "#A0DEFC", // 한파(주의보)
    "C2": "#7194DC", // 한파(경보)
    "H": "rgb(195,   0, 195)", // 폭염
    "H0": "#E0E0E0", // 폭염(해제)
    "H1": "#FFC8FF", // 폭염(주의보)
    "H2": "#F566A2", // 폭염(경보)
    "D": "rgb(255, 127,   0)", // 건조
    "D0": "#E0E0E0", // 건조(해제)
    "D1": "#FFFF90", // 건조(주의보)
    "D2": "#FFC90E", // 건조(경보)
    "F": "rgb(128,  20,  10)", // 안개
    "O": "rgb(195, 192, 145)", // 폭풍해일
    "R": "rgb(  0,   0, 255)", // 호우
    "S": "rgb(255,   0, 255)", // 대설
    "T": "rgb(255,   0,   0)", // 태풍
    "V": "rgb(  0, 255, 255)", // 풍랑
    "W": "rgb(  0, 240,   0)", // 강풍
    "Y": "rgb(255, 255,   0)"  // 황사
  };
}

/**
 * 기능 : 레이어 스타일
 */
function setLayerStyle(map, num, zoomLevel) {
  var _isLocalShow = zoomLevel > 13;

  if (geoJson[num]) {
    // 예외처리(울릉도.독도, 흑산도.홍도, 신안(흑산면제외), 서해5도, 거문도·초도, 완도)
    var except = "L1072100,L1052500,L1052200,L1014100,L1052600,L1051600";
    geoJson[num].getLayers().map(function(layer) {
      if (layer.feature.properties.ground == "local") {
        if (except.indexOf(layer.feature.properties.regid) >= 0) {
          // 예외처리
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
 * 기능 : 특보 종류별 색상
 */
function getColor(wrnTp) {
  return color[wrnTp] == undefined ? "rgb(255, 255, 255)" : color[wrnTp];
}

/**
 * 기능 : 패턴 스타일 조회
 */
function getWrnPatternSvg(wrnNow) {
  // Rect pixel 크기
  var p = 2;
  // 기본 옵션
  var commonOptions = {
    width: p,
    height: p,
    fill: true,
    fillOpacity: 1,
    stroke: false
  };

  var pattern = patternArr[wrnNow] == undefined ? null : patternArr[wrnNow];
  if (pattern == null) {
    // 패턴 새로 만들기
    var wrnLen = parseInt(wrnNow.length / 2);
    var cx = 0;
    var cy = 0;
    // 기본 패턴 사이즈 2x2
    var w = 2, h = 2;
    if (wrnLen > 2) {
      w = wrnLen*2;
    }
    var _wrnLvl = 0; // 예비, 주의보, 경보 구분
    var _color = getColor('WHITE'); // 기본색 white
    var PatternRect;
    var PatternRectArr = [];
    for (var x = 0, k = 0; x < w; x++) {
      k = x % wrnLen;
      _wrnLvl = parseInt(wrnNow[k*2+1]);
      for (var y = 0; y < h; y++) {
        switch (_wrnLvl) {
          case 0:// 예비
            if (cx == 0 && cy == 0) {
              _color = getColor(wrnNow[k*2]);
            } else {
              _color = getColor('WHITE');
            }
            break;
          case 1:// 주의보
            if (cy == cx) {
              //_color = getColor(wrnNow[k*2]);
              _color = getColor(wrnNow);
            } else {
              _color = getColor('WHITE');
            }
            break;
          case 2:// 경보
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
 * 기능 : 레이어 패턴 (CANVAS)
 */
function getWrnPatternCanvas(wrnNow, wrnLvl) {
  if (!wrnNow || wrnNow == "" || wrnNow.length == 0) {
    return getColor('WHITE');
  }

  // Rect pixel 크기
  var p = 2;
  if (patternArr[wrnNow] == null) patternArr[wrnNow] = [];

  // 격자 크기
  if (wrnNow == wrnLvl) var k = 1;
  else var k = 2;

  var pattern = patternArr[wrnNow][wrnLvl] == undefined ? null : patternArr[wrnNow][wrnLvl];
  if (pattern == null) {
      
    // 패턴 새로 만들기
    var canvas = document.createElement("canvas");
      
    var cx = 0;
    var cy = 0;
    // 기본 패턴 사이즈 8x8
    var w = 8, h = 8;

    canvas.width = w*p;
    canvas.height = h*p;
    var ctx = canvas.getContext('2d');
    var _wrnLvl = 0; // 예비, 주의보, 경보 구분
    var _color = getColor('WHITE'); // 기본색 white
    var _wrnLvl = parseInt(wrnNow[1]);

    for (var x = 0; x < w; x++) {
      for (var y = 0; y < h; y++) {
        switch (_wrnLvl) {
          case 0:// 예비
            if (cx == 0 && cy == 0) {
              _color = getColor(wrnNow);
            } else {
              _color = getColor(wrnLvl);
            }
            break;
          case 1:// 주의보
            if (y % k == 0 && cy == cx) {
              if (wrnNow == wrnLvl) _color = getColor('WHITE');
              else _color = getColor(wrnNow);
            } else {
              _color = getColor(wrnLvl);
            }
            break;
          case 2:// 경보
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
 * 기능 : 레이어 패턴 적용
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
 * 기능 : 특보구역명 표출
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
 * 기능 : 특보구역 조회
 */
function loadReg(map, num, options) {
  // 이전 조회한 이력이 있으면 전역변수 재활용
  if (giscoord) {
    setReg(giscoord, map, num, options);
    return;
  }

  // 없을 경우 로딩
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
 * 기능 : 특보구역 세팅
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
 * 기능 : 데이터 동일 비교
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
 * 기능 : 특보 현황 조회
 */
function loadWrnNowData(options) {
  var _options = JSON.parse(JSON.stringify(options));
  var _lv = options.lv;
  var _url = '/url/wrn_now_data.php?fe=' + options.fe + '&tm=' + options.tm + '&disp=0&help=0';

  // 직전 분포도 조회 요청과 동일한 경우 생략함
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
        // 양쪽 TRIM, 중복 공백제거
        var _e = e.replace(/(^ *)|( *$)/g, '').replace(/\s\s+/g, ' ').split(',');
        if (_e[0].length > 0 && _e[0][0] != '#') {
          // 양쪽 TRIM
          $.each(_e, function(j, el) {
            _e[j] = el.trim();
          });
          /*
          #---------------------------------------------------------------------------------------------------
          #  특보현황 조회
          #---------------------------------------------------------------------------------------------------
          #  1. REG_UP    : 상위 특보구역코드
          #  2. REG_UP_KO : 상위 특보구역명
          #  3. REG_ID    : 특보구역코드
          #  4. REG_KO    : 특보구역명
          #  5. TM_FC     : 발표시각(년월일시분,KST)
          #  6. TM_EF     : 발효시각(년월일시분,KST), 예비특보의 경우 아래와 같이 매칭하여 사용
          #                 - 02:59(한밤), 05:59(새벽), 08:59(아침), 11:59(늦은오전), 14:59(이른오후), 17:59(늦은오후), 20:59(저녁), 23:59(늦은밤), 11:58(오전), 17:58(오후), 14:58(낮), 23:58(밤)
          #  7. WRN       : 특보종류
          #  8. LVL       : 특보수준
          #  9. CMD       : 특보명령
          # 10. ED_TM     : 예제예고 시점
          #---------------------------------------------------------------------------------------------------
          */
          if ((_lv == "0" && _e[7] != "예비" && _e[6] != "안개") || (_lv == "1" && _e[7] == "예비") || _lv == "2" && _e[6] == "안개") {
            //한파특보만..
            if (_e[6] != "한파") return true;
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
 * 기능 : 특보 현황 세팅
 */
function setWrnNowData() {

  // 초기화
  $.each(geoJsonLayers, function(k, v) {
    v.feature.properties.wrnNow = "";
  });

  // 특보구역별 현황 세팅
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
 * 기능 : 타이틀 세팅
 */
function setWrnTitle(map, options) {
  // 타이틀 세팅
  var titleStr = "";
  if (options.tm != null && options.tm != "" ) {
    var tm = options.tm;
    var yyyy = tm.substring(0, 4);
    var MM = tm.substring(4, 6);
    var dd = tm.substring(6, 8);
    var hh = tm.substring(8, 10);
    var mi = tm.substring(10, 12);
    var tmStr = yyyy + "." + MM + "." + dd + ". " + hh + ":" + mi;
    var wrnTitle = "특보";
    if (options.lv == "1") {
      wrnTitle = "예비특보";
    } else if (options.lv == "2") {
      wrnTitle = "안개특보";
    }
    titleStr += "<span class='bTxt'>" + wrnTitle + "</span> ";
    if (options.fe == "e" || options.lv == "1") { // 발효기준
      titleStr += "발표현황(" + tmStr + ")";
    } else { // 기본값 발표기준 fe: "f"
      titleStr += "발효현황(" + tmStr + " 이후)";
    }
  }
  $("#" + map.options.mapTitleId).html(titleStr);
}
  
/**
 * 기능 : color bar legend
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
 * 기능 : color bar legend
 */
function makeLegendControl() {
  // 초기화
  var div = document.querySelectorAll('#wrn_legend');
  for (var i=0; i<div.length; i++) {
    while (div[i].hasChildNodes()) {
      div[i].removeChild(div[i].childNodes[0]);
    }
  }

  /*
  // 현재 데이터에서 특보 종류 찾기
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
    if (wrn_arr[i] == 1) var text = "주의보"
    else if (wrn_arr[i] == 2) var text = "경보"
    else if (wrn_arr[i] == 0) var text = "해제"

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
 * 기능 : 특보 종류 코드 변환
 */
function convertWrnTp(wrnTp) {
  var _wrnTp = '';
  switch (wrnTp) {
    case '한파':
      _wrnTp = 'C';
      break;
    case '건조':
      _wrnTp = 'D';
      break;
    case '안개':
      _wrnTp = 'F';
      break;
    case '폭염':
      _wrnTp = 'H';
      break;
    case '폭풍해일':
      _wrnTp = 'O';
      break;
    case '호우':
      _wrnTp = 'R';
      break;
    case '대설':
      _wrnTp = 'S';
      break;
    case '태풍':
      _wrnTp = 'T';
      break;
    case '풍랑':
      _wrnTp = 'V';
      break;
    case '강풍':
      _wrnTp = 'W';
      break;
    case '황사':
      _wrnTp = 'Y';
      break;
    default:
      break;
  } // end switch

  return _wrnTp;
}

/**
 * 기능 : 특보 수준 코드 변환
 */
function convertWrnLvl(wrnLvl) {
  var _wrnLvl = '';
  switch (wrnLvl) {
    case '예비':
      _wrnLvl = '0';
      break;
    case '주의':
      _wrnLvl = '1';
      break;
    case '경보':
      _wrnLvl = '2';
      break;
    default:
      break;
  } // end switch

  return _wrnLvl;
}