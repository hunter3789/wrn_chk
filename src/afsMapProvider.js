function createMap(num, id, options) {
  addMap(num, id, options);
}

function addMap(num, id, options) {
  var NO_ANIMATION = {
    animate: false
  };
  var mapId = "map" + num;
  var mapTitleId = "mapTitle" + num;
  var mapAreaId = "mapArea" + num;

  $("#" + id + num).append('<div class="mapArea" id="' + mapAreaId + '"></div>');

  var mapDiv = '<div class="map" id="' + mapId + '"></div>';
  var mapTitleDiv = $('<div class="mapTitle" id="' + mapTitleId + '" style=\'display:flex;\'></div>');

  $("#" + mapAreaId).append(mapTitleDiv);
  $("#" + mapAreaId).append(mapDiv);

  if (num == 0) {
    var mapSelect = "&nbsp;<span class=radio-style><input type=radio id=wrn_map01 name=wrn_map onclick='fnShowRegMap();' value=0><label for=wrn_map01 class=text1>특보 현황</label></span>";
    mapSelect += "&nbsp;&nbsp;<span class=radio-style><input type=radio id=wrn_map02 name=wrn_map onclick='fnShowRegMap();' value=1 checked><label for=wrn_map02 class=text1>특보 예상</label></span>";
    mapSelect += "&nbsp;&nbsp;<span class=radio-style><input type=radio id=wrn_map03 name=wrn_map onclick='fnDualMap();' value=2><label for=wrn_map03 class=text1>함께 보기</label></span>";
    $("#" + mapTitleId).append(mapSelect);
  }
  else if (num == 2) {
    var mapSelect = "&nbsp;<span>특보구역 삭제/추가를 원하시면 지도에서 클릭해주세요.</span>";
    $("#" + mapTitleId).append(mapSelect);
  }
  

  resizeMap(num, options);

  var mapOptions = {
    crs: L.Proj.CRS.Afs,
    zoomControl: false,
    scrollWheelZoom: true,
    doubleClickZoom: false,
    attributionControl: false,
    mapTitleId: mapTitleId,
    renderer: L.canvas(),
    minZoom: 12,
    maxZoom: 16,
    maxBounds: L.latLngBounds(L.latLng(40.5, 123.5), L.latLng(30, 132))
  };

  // 특보 현황 canvas 표출 적용
  mapOptions.preferCanvas = true;

  map[num] = L.map(mapId, mapOptions);

  // 맵 위치 초기화
  var center = L.latLng(options.center);
  var zoom = options.initZoom;
  map[num].setView(center, zoom, NO_ANIMATION);

  // 이벤트
  map[num].whenReady(function() {
    addWrnLayer(map[num], num, options);
  });

  map[num].on("zoomend", function(ev) {
    var zoomLevel = ev.target.getZoom();
    if (zoomLevel == 12) map[num].setView(center, zoom, NO_ANIMATION);
  });

  L.control.zoom({position: 'bottomleft'}).addTo(map[num]);

  if (num <= 1) {
    var control = L.control({position: 'topright'})
    control.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'button_small')
      div.innerText = "넓게 보기";
      div.setAttribute("id", 'mapResize');
      div.onclick = fnMapResize;
      return div;
    };
    control.addTo(map[num]);
  }

  //resizeMap();
            
  //map.scrollWheelZoom.enable();
  //map.dragging.enable();

  // 축척 표시
  //L.control.scale({ imperial: false, maxWidth: 50 }).addTo(map);

}

function addWrnLayer(map, num, options) {
  // WRN 분포도
  var layerOptions = {
    tm: getDate(),
    lv: "0",
    pane: "wrn"
  };

  //var afsWrn = new afsWrnLayer(map, options);
  afsWrnLayer(map, num, layerOptions);
}

function resizeMap(num, options) {
  var w, h;
  if (options.size != null) {
    var size = options.size;
    var size_img = parseInt(size * 1.2);
    var NX = AFSMAP_CONFIG.MAP_AREA.D3.NX;
    var NY = AFSMAP_CONFIG.MAP_AREA.D3.NY;
    var NI = size_img;
    var NJ = parseInt((NY / NX) * NI);
                
    w = size + 3;
    h = parseInt(size * NJ / NI) + 3;
  }
  else if (options.width != null && options.height != null) {
    w = options.width;
    h = options.height;
  }
  if (w == undefined && h == undefined) {
    return;
  }
  if (options.title) {
    $(".mapTitle").show();
    if (!isNaN(h)) {
      h += $(".mapTitle").height() + 1;
    }
  }
  else {
    $(".mapTitle").hide();
    $(".map").css("border-top", "none");
  }
  $("#mapArea" + num).css({
    width: w,
    height: h
  });
  if (!isNaN(w) && !isNaN(h)) {
    $("#map" + num).css({
      width: w-2,
      height: h-25
    });
  }
}