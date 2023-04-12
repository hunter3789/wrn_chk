//var host = 'http://cht.kma.go.kr/';
var host = 'http://' + location.hostname;
var wrapperId = "wrapper";

var wrn_mode;
var now;
var stn_list = [];
var tm_value;

var map = [];
var geoJson = [];
var geoJsonLayers = {};
var wrnNowData = [];
var patternArr = [];
var regkoLayer = [];
var giscoord;
var winput_reg, winput_top = winput_left = winput_width = winput_height = -999, session_ok = 0;

var mapOptions = {
  center: AFSMAP_CONFIG.AFS_MAP_CENTER[108].center,
  initZoom: 12,
  title: 1,
  legend: 1,
  width: 480,
  height: 600
};

var top_reg = [
  {stn_name: "수도권청", stn_id: 109, name: "서울.인천.경기도", reg_arr: [{reg_id: "L1100000", reg_ko:"서울"},{reg_id: "L1110000", reg_ko:"인천"},{reg_id: "L1010000", reg_ko:"경기도"},{reg_id: "L1014000", reg_ko:"서해5도"}]},
  {stn_name: "대전청", stn_id: 133,  name: "대전.세종.충남", reg_arr: [{reg_id: "L1120000", reg_ko:"대전"},{reg_id: "L1170000", reg_ko:"세종"},{reg_id: "L1030000", reg_ko:"충청남도"}]},
  {stn_name: "강원청", stn_id: 105,  name: "강원도", reg_arr: [{reg_id: "L1020000", reg_ko:"강원도"}]},
  {stn_name: "광주청", stn_id: 156,  name: "광주.전남", reg_arr: [{reg_id: "L1130000", reg_ko:"광주"},{reg_id: "L1050000", reg_ko:"전라남도"},{reg_id: "L1052400", reg_ko:"흑산도.홍도"}]},
  {stn_name: "부산청", stn_id: 159,  name: "부산.울산.경남", reg_arr: [{reg_id: "L1150000", reg_ko:"부산"},{reg_id: "L1160000", reg_ko:"울산"},{reg_id: "L1080000", reg_ko:"경상남도"}]},
  {stn_name: "대구청", stn_id: 143,  name: "대구.경북", reg_arr: [{reg_id: "L1140000", reg_ko:"대구"},{reg_id: "L1070000", reg_ko:"경상북도"},{reg_id: "L1600000", reg_ko:"울릉도.독도"}]},
  {stn_name: "제주청", stn_id: 184,  name: "제주도", reg_arr: [{reg_id: "L1090000", reg_ko:"제주도"}]},
  {stn_name: "청주지청", stn_id: 131, name: "충북", reg_arr: [{reg_id: "L1040000", reg_ko:"충청북도"}]},
  {stn_name: "전주지청", stn_id: 146, name: "전북", reg_arr: [{reg_id: "L1060000", reg_ko:"전라북도"}]}
];

var map_code = [
  {stn_name: "전국", center: AFSMAP_CONFIG.AFS_MAP_CENTER[108].center, initZoom: 12, stn_id: 108 },
  {stn_name: "수도권청", center: [37.5, 126.85], initZoom: 13, stn_id: 109 },
  {stn_name: "대전청", center: [36.5, 126.9], initZoom: 14, stn_id: 133 },
  {stn_name: "강원청", center: [37.65, 128.25], initZoom: 13, stn_id: 105 },
  {stn_name: "광주청", center: [35.0, 126.95], initZoom: 13, stn_id: 156 },
  {stn_name: "부산청", center: [35.4, 128.525], initZoom: 14, stn_id: 159 },
  {stn_name: "대구청", center: [36.4, 129], initZoom: 13, stn_id: 143 },
  {stn_name: "제주청", center: [33.6, 126.55], initZoom: 15, stn_id: 184 },
  {stn_name: "청주지청", center: [36.6, 127.85], initZoom: 14, stn_id: 131 },
  {stn_name: "전주지청", center: [35.75, 127.15], initZoom: 14, stn_id: 146 }
];

//IE에서 findIndex 함수 사용을 위한 polyfill
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, { kValue, k, O })).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    },
    configurable: true,
    writable: true
  });
}

// 첫 시작(화면 로드 시)
function onLoad() {
  console.log(s_stnId);
  if (s_stnId == "") s_stnId = 108;
  else session_ok = 1;

  now = new Date();
  now.setTime(now.getTime()-10*60*1000);
  if ((now.getMonth()+1 == 3 && now.getDate() <= 15) || now.getMonth()+1 <= 2 || now.getMonth()+1 >= 10) {
    wrn_mode = "C"
  }
  else if ((now.getMonth()+1 == 3 && now.getDate() > 15) || now.getMonth()+1 == 4 || (now.getMonth()+1 == 5 && now.getDate() < 15)) {
    wrn_mode = "D"
  }
  else {
    wrn_mode = "H"
  }
  menu_init(wrn_mode, 0);

  createMap(0, wrapperId, mapOptions);
  tm_init(0);
  initDragElement();
  initResizeElement();
  fnBodyResize(0);
};

// 창 크기 변경에 따른 표출단 크기 조정
function fnBodyResize(opt, top, left) {
  var width  = window.innerWidth - 10;
  if (opt == 0) {
    var dd = 5 + document.getElementById('head').offsetHeight + document.getElementById('menu').offsetHeight;
    var height = window.innerHeight - dd;
    document.getElementById('body').style.height = parseInt(height) + "px";
  }
  else {
    document.getElementById('hidden_div').style.height = parseInt(top + parseInt(document.getElementById('winput').style.height) - 800) + "px";
    document.getElementById('hidden_div').style.width  = parseInt(left + parseInt(document.getElementById('winput').style.width) - 0) + "px";
  }
}

// 창 크기 변경에 따른 표출단 크기 조정
function fnBodyScroll() {
  if (document.getElementById('winput').style.display == "block") {
    var left = document.getElementById('body').scrollLeft;    
    var top = document.getElementById('body').scrollTop;    
    document.getElementById('winput').style.transform = "translate(" + parseInt(-left) + "px, " + parseInt(-top) + "px)"
  }
}

// 메뉴 설정
function menu_init(mode, opt) {
  wrn_mode = mode;
  document.getElementById("loading").style.display = "block";
  document.getElementById("button_C").classList.remove("active_C");
  document.getElementById("button_H").classList.remove("active_H");
  document.getElementById("button_D").classList.remove("active_D");

  if (mode == "C") {
    document.getElementById("ta_menu").style.display = "block";
    document.getElementById("button_C").classList.add("active_C");
    document.getElementById("subject").innerHTML = "<b>[한파특보 점검표]</b>";

    var list = [
      {value:"T", checked:1, name:"아침최저기온"},
      {value:"D", checked:0, name:"전날대비기온차"},
      {value:"N", checked:0, name:"평년일최저기온"}
    ];

    var cond = [
      [{type:"text", width:40, class:"gray-border-top-left", name:"적용"}, {type:"text", width:90, class:"gray-border-top", name:"기준"}, 
       {type:"text", width:120, class:"gray-border-top", name:"주의보"}, {type:"text", width:120, class:"gray-border-top", name:"경보"},
       {type:"text", width:170, class:"gray-border-top", name:"비고"}],
      [{type:"checkbox", width:40, class:"gray-border-left", name:"", id:"cond1", checked:1}, {type:"text", width:90, class:"gray-border", name:"전날대비기온차"}, 
       {type:"input", width:120, class:"gray-border", rightText:"℃ 이상 하강", id:"adv_cond1"}, {type:"input", width:120, class:"gray-border", rightText:"℃ 이상 하강", id:"wrn_cond1"},
       {type:"input", width:170, class:"gray-border", leftText:"아침최저기온", rightText:"℃ 이하", id:"ext_cond1"}],
      [{type:"checkbox", width:40, class:"gray-border-left", name:"", id:"cond2", checked:1}, {type:"text", width:90, class:"gray-border", name:"아침최저기온"}, 
       {type:"input", width:120, class:"gray-border", rightText:"℃ 이하", id:"adv_cond2"}, {type:"input", width:120, class:"gray-border", rightText:"℃ 이하", id:"wrn_cond2"},
       {type:"text", width:170, class:"gray-border", name:"2일 이상 지속"}],
      [{type:"checkbox", width:40, class:"gray-border-left", name:"", id:"cond3", checked:1}, {type:"text", width:90, class:"gray-border", name:"평년기온대비"}, 
       {type:"input", width:120, class:"gray-border", rightText:"℃ 이상 하강", id:"adv_cond3"}, {type:"input", width:120, class:"gray-border", rightText:"℃ 이상 하강", id:"wrn_cond3"},
       {type:"text", width:170, class:"gray-border", name:"미해당지역 제외"}]
    ];
  }
  else if (mode == "H") {
    document.getElementById("ta_menu").style.display = "block";
    document.getElementById("button_H").classList.add("active_H");
    document.getElementById("subject").innerHTML = "<b>[폭염특보 점검표]</b>";

    var list = [
      {value:"T", checked:1, name:"낮최고기온"},
      {value:"S", checked:1, name:"낮최고체감온도"}
    ];

    var cond = [
      [{type:"text", width:40, class:"gray-border-top-left", name:"적용"}, {type:"text", width:90, class:"gray-border-top", name:"기준"}, 
       {type:"text", width:120, class:"gray-border-top", name:"주의보"}, {type:"text", width:120, class:"gray-border-top", name:"경보"},
       {type:"text", width:170, class:"gray-border-top", name:"비고"}],
      [{type:"checkbox", width:40, class:"gray-border-left", name:"", id:"cond1", checked:0}, {type:"text", width:90, class:"gray-border", name:"낮최고기온"}, 
       {type:"input", width:120, class:"gray-border", rightText:"℃ 이상", id:"adv_cond1"}, {type:"input", width:120, class:"gray-border", rightText:"℃ 이상", id:"wrn_cond1"},
       {type:"text", width:170, class:"gray-border", name:"2일 이상 지속"}],
      [{type:"checkbox", width:40, class:"gray-border-left", name:"", id:"cond2", checked:1}, {type:"text", width:90, class:"gray-border", name:"낮최고체감온도"}, 
       {type:"input", width:120, class:"gray-border", rightText:"℃ 이상", id:"adv_cond2"}, {type:"input", width:120, class:"gray-border", rightText:"℃ 이상", id:"wrn_cond2"},
       {type:"text", width:170, class:"gray-border", name:"2일 이상 지속"}]
    ];
  }
  else if (mode == "D") {
    document.getElementById("ta_menu").style.display = "none";
    document.getElementById("button_D").classList.add("active_D");
    document.getElementById("subject").innerHTML = "<b>[건조특보 점검표]</b>";

    var list = [
      {value:"E", checked:1, name:"실효습도"},
      {value:"A", checked:0, name:"평균습도"},
      {value:"N", checked:0, name:"최저습도"}
    ];

    var cond = [
      [{type:"text", width:40, class:"gray-border-top-left", name:"적용"}, {type:"text", width:90, class:"gray-border-top", name:"기준"}, 
       {type:"text", width:120, class:"gray-border-top", name:"주의보"}, {type:"text", width:120, class:"gray-border-top", name:"경보"},
       {type:"text", width:170, class:"gray-border-top", name:"비고"}],
      [{type:"checkbox", width:40, class:"gray-border-left", name:"", id:"cond1", checked:1}, {type:"text", width:90, class:"gray-border", name:"실효습도"}, 
       {type:"input", width:120, class:"gray-border", rightText:"% 이하", id:"adv_cond1"}, {type:"input", width:120, class:"gray-border", rightText:"% 이하", id:"wrn_cond1"},
       {type:"text", width:170, class:"gray-border", name:"2일 이상 지속"}]
    ];
  }

  // 표출 요소 리스트 수정
  var item = document.getElementById("list_menu");
  while (item.hasChildNodes()) {
    item.removeChild(item.childNodes[0]);
  }

  var tr_element = document.createElement("tr");
  var td_element = document.createElement("td");

  for (var i=0; i<list.length; i++) {
    var span_element = document.createElement("span");
    var input_element = document.createElement("input");
    input_element.type = "checkbox";
    input_element.name = "list";
    input_element.id = "list" + i;
    input_element.onclick = fnShowTable;
    input_element.value = list[i].value;
    if (list[i].checked == 1) input_element.checked = 1;
    if (i > 0) input_element.style.marginLeft = "6px";

    span_element.classList.add("checkbox-style");
    span_element.appendChild(input_element);

    var label_element = document.createElement("label");
    label_element.innerText = list[i].name;
    label_element.htmlFor = "list" + i;
    label_element.style.cursor = "pointer";
    label_element.classList.add("text1");
    label_element.classList.add("checkbox-style");
    span_element.appendChild(label_element);
    td_element.appendChild(span_element);
  }

  tr_element.appendChild(td_element);
  document.getElementById("list_menu").appendChild(tr_element);

  // 조건 설정 테이블 수정
  var item = document.getElementById("cond_menu");
  while (item.hasChildNodes()) {
    item.removeChild(item.childNodes[0]);
  }

  var tr_element = document.createElement("tr");
  d_li  = "<td nowrap colspan=" + parseInt(cond[0].length+1) + " class=T02_Title02 style='text-align:left;'>&middot;&nbsp;조건 설정";
  if (mode == "C") {
    d_li += "<span style='display:inline-block; min-width:10px;'></span>";
    d_li += "<span><select id=cond_opt name=cond_opt class='text3' onChange='fnShowTable();'><option value='or' selected>OR</option><option value='and'>AND</option></select></span></td>";
  }
  else if (mode == "H") {
    d_li += "<span style='display:inline-block; min-width:10px;'></span>";
    d_li += "<span><select id=cond_opt name=cond_opt class='text3' onChange='fnShowTable();'><option value='or'>OR</option><option value='and' selected>AND</option></select></span></td>";
  }
  else d_li += "</td>";
  tr_element.innerHTML = d_li;
  document.getElementById("cond_menu").appendChild(tr_element);

  var tr_element = document.createElement("tr");
  tr_element.innerHTML = "<td height=3 colspan=" + parseInt(cond[0].length+1) + "></td>";
  document.getElementById("cond_menu").appendChild(tr_element);

  for (var i=0; i<cond.length; i++) {
    var tr_element = document.createElement("tr");
    var td_element = document.createElement("td");
    td_element.width = 20;
    tr_element.appendChild(td_element);
    for (var j=0; j<cond[i].length; j++) {
      var td_element = document.createElement("td");
      td_element.width = cond[i][j].width;
      td_element.classList.add(cond[i][j].class);
      
      if (cond[i][j].type == "input") {
        if (cond[i][j].leftText != null) {
          var span_element = document.createElement("span");
          span_element.innerHTML = "&nbsp;" + cond[i][j].leftText + "&nbsp;";
          td_element.appendChild(span_element);
        }
        else {
          var span_element = document.createElement("span");
          span_element.innerHTML = "&nbsp;";
          td_element.appendChild(span_element);
        }
        var input_element = document.createElement("input");
        input_element.type = "text";
        input_element.id = cond[i][j].id;
        input_element.addEventListener('input', function(e) {fn_onlyNumInput(e);});
        input_element.classList.add("input");
        td_element.appendChild(input_element);
        if (cond[i][j].rightText != null) {
          var span_element = document.createElement("span");
          span_element.innerHTML = "&nbsp;" + cond[i][j].rightText;
          td_element.appendChild(span_element);
        }
      }
      else if (cond[i][j].type == "checkbox") {
        var span_element = document.createElement("span");
        var input_element = document.createElement("input");
        input_element.type = "checkbox";
        input_element.onclick = fnShowTable;
        input_element.id = cond[i][j].id;
        if (cond[i][j].checked == 1) input_element.checked = 1;

        span_element.classList.add("checkbox-style");
        span_element.style.marginLeft = "0px";
        span_element.appendChild(input_element);
        td_element.appendChild(span_element);
      }
      else if (cond[i][j].type == "text") {
        if (i == 0) td_element.innerText = cond[i][j].name;
        else td_element.innerHTML = "&nbsp;" + cond[i][j].name;
      }

      if (i > 0 && j > 0) td_element.style.textAlign = "left";
      else if (i == 0) td_element.style.backgroundColor = "skyblue";

      tr_element.appendChild(td_element);
    }
    document.getElementById("cond_menu").appendChild(tr_element);
  }

  var tr_element = document.createElement("tr");
  tr_element.innerHTML = "<td height=2 colspan=" + parseInt(cond[0].length+1) + "></td>";
  document.getElementById("cond_menu").appendChild(tr_element);

  var tr_element = document.createElement("tr");
  var td_element = document.createElement("td");
  td_element.width = 20;
  tr_element.appendChild(td_element);

  var td_element = document.createElement("td");
  td_element.colSpan = parseInt(cond[0].length);
  td_element.style.textAlign = "right";
  var input_element = document.createElement("input");
  input_element.type = "button";
  input_element.onclick = fnCondReset;
  input_element.style.backgroundColor = "#F3FCFF";
  input_element.style.width = "45px";
  input_element.value = "초기화";
  input_element.classList.add("TB09");
  td_element.appendChild(input_element);

  var span_element = document.createElement("span");
  span_element.innerHTML = "&nbsp;";
  td_element.appendChild(span_element);

  var input_element = document.createElement("input");
  input_element.type = "button";
  input_element.onclick = fnShowTable;
  input_element.style.backgroundColor = "#E5F8FF";
  input_element.style.width = "45px";
  input_element.value = "적용";
  input_element.classList.add("TB09");
  td_element.appendChild(input_element);

  tr_element.appendChild(td_element);
  document.getElementById("cond_menu").appendChild(tr_element);

  var tr_element = document.createElement("tr");
  tr_element.innerHTML = "<td height=3 colspan=" + parseInt(cond[0].length+1) + "></td>";
  document.getElementById("cond_menu").appendChild(tr_element);

  fnCondReset(0);

  // 오늘 기온 시간별로 예측.관측 자동 선택, 대표지점 체크 해제
  if (wrn_mode == "H") {
    now = new Date();
    now.setTime(now.getTime()-10*60*1000);
    var HH = now.getHours();

    var data = document.getElementsByName("today");
    for (var i=0; i<data.length; i++) {
      if (parseInt(HH) < 14) {
        if (data[i].value == "F") {
          data[i].checked = 1;
          break;
        }
      }
      else {
        if (data[i].value == "O") {
          data[i].checked = 1;
          break;
        }
      }
    }

    document.getElementById("rp_stn").checked = 0;
  }
  else {
    document.getElementById("rp_stn").checked = 1;
  }

  if (opt != 0) {
    fnGetStnList();
    makeLegendControl();
    fnBodyResize(0);
  }
}

// 관측/예측 자료 조회(ajax 호출)
function fnGetStnList(opt) {
  now = new Date();
  now.setTime(now.getTime()-10*60*1000);

  document.getElementById("loading").style.display = "block";
  stn_list = [];

  var tm = document.getElementById("tm").value;
  tm = tm.substring(0,4) + tm.substring(5,7) + tm.substring(8,10) + tm.substring(11,13) + tm.substring(14,16);
  var data = document.getElementsByName("data");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var step = data[i].value;
      break;
    }
  }

  if (wrn_mode == "C") var mode = 2, vars = "TMN";
  else if (wrn_mode == "H") var mode = 2, vars = "TMX";
  else if (wrn_mode == "D") var mode = 4, vars = "REH";

  var url = host + "/lsp/wrn/wrn_chk_lib.php?mode=" + mode + "&tmfc=" + tm + "&step=" + step + "&var=" + vars + "&help=0";
  console.log(url);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.overrideMimeType("application/x-www-form-urlencoded; charset=euc-kr");
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4 || xhr.status != 200) return;
    else {
      var stn_id = 0;
      var line = xhr.responseText.split('\n');
      if (xhr.responseText.length <= 1 && line[0] == "") {
        return;
      }

      line.forEach(function(l) {
        if (l[0] == "#" || l.length <= 1) {
          return;
        }

        var d = l.split(',');
        var object = {};

        if (wrn_mode == "C") {
          object.date   = d[7];
          object.type   = d[8];
          object.tmn    = d[9];
          object.tmn_tm = d[10];
          object.mnnm   = d[11];
        }
        else if (wrn_mode == "H") {
          if (d[1].indexOf("*") != -1) return;

          object.date   = d[7];
          object.type   = d[8];
          object.tmx    = d[9];
          object.tmx_tm = d[10];
          object.tcx    = d[11];
          object.tcx_tm = d[12];

          if (object.tcx_tm == 9999) {
            object.tcx = "";
            object.tcx_tm = "";
          }
        }
        else if (wrn_mode == "D") {
          object.date   = d[7];
          object.hm_avg = d[8];
          object.hm_min = d[9];
          object.hm_eff = d[10];
        }
        var n = stn_list.length;
        if (stn_id != d[0]) {
          stn_list[n] = {};
          stn_list[n].stn_id   = d[0];
          stn_list[n].stn_ko   = d[1];
          stn_list[n].reg_up   = d[2];
          stn_list[n].wrn_id   = d[3];
          stn_list[n].wrn_ko   = d[4];
          stn_list[n].rp_id    = d[5];
          stn_list[n].wrn_sort = parseInt(d[6]);
          stn_list[n].wrn_now  = 0;
          stn_list[n].data = [];
          stn_list[n].data.push(object);
          stn_id = d[0];
        }
        else {
          stn_list[n-1].data.push(object);
        }

      });

      fnGetWrnNowData(opt);
      fnDataCheck();
    }

  };
  xhr.send();
}

// 자료 정보 조회(파일유무)
function fnDataCheck() {

  if (wrn_mode == "C") var vars = "TMN";
  else if (wrn_mode == "H") var vars = "TMX";
  else if (wrn_mode == "D") var vars = "REH";

  var tm = document.getElementById("tm").value;
  tm = tm.substring(0,4) + tm.substring(5,7) + tm.substring(8,10) + tm.substring(11,13) + tm.substring(14,16);
  var data = document.getElementsByName("data");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var step = data[i].value;
      break;
    }
  }

  var url = host + "/lsp/wrn/wrn_chk_lib.php?mode=3&tmfc=" + tm + "&step=" + step + "&var=" + vars + "&help=0";
  console.log(url);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.overrideMimeType("application/x-www-form-urlencoded; charset=euc-kr");
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4 || xhr.status != 200) return;
    else {
      var stn_id = 0;
      var line = xhr.responseText.split('\n');
      if (xhr.responseText.length <= 1 && line[0] == "") {
        return;
      }

      line.forEach(function(l) {
        if (l[0] == "#" || l.length <= 1) {
          return;
        }

        if (l[0] == "@") var result = "<p style='color:red; font-weight:bold;'>예측 자료 없음</p>";
        else {
          var time = new Date();
          time.setTime(now.getTime()+10*60*1000);
          var result = "<p>자료 조회 시각: ";
          result += addZeros(time.getFullYear(),4) + "." + addZeros(time.getMonth()+1,2) + "." + addZeros(time.getDate(),2) + "." + addZeros(time.getHours(),2) + ":" + addZeros(time.getMinutes(),2);
          result += "&nbsp;<i class='fas fa-sync-alt' onclick='fnGetStnList();' style='cursor:pointer;'></i></p>";
        }

        document.getElementById("data_info").innerHTML = result;

      });
    }

  };
  xhr.send();
}

// 특보 발표 현황 조회
function fnGetWrnNowData(opt) {

  if (wrn_mode == "C") var wrn_type = "한파";
  else if (wrn_mode == "H") var wrn_type = "폭염";
  else if (wrn_mode == "D") var wrn_type = "건조";

  var url = host + "/url/wrn_now_data.php?fe=f&disp=0&help=0&tm=202008031500";
  var url = host + "/url/wrn_now_data.php?fe=f&disp=0&help=0";
  console.log(url);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.overrideMimeType("application/x-www-form-urlencoded; charset=euc-kr");
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4 || xhr.status != 200) return;
    else {
      var stn_id = 0;
      var line = xhr.responseText.split('\n');
      if (xhr.responseText.length <= 1 && line[0] == "") {
        return;
      }

      line.forEach(function(l) {
        if (l[0] == "#" || l.length <= 1) {
          return;
        }

        // 양쪽 TRIM, 중복 공백제거
        var d = l.replace(/(^ *)|( *$)/g, '').replace(/\s\s+/g, ' ').split(',');
        // 양쪽 TRIM
        for (var i=0; i<d.length; i++) {
          d[i] = d[i].trim();
        };

        if (d[6] == wrn_type) {
          n = stn_list.findIndex(function(x){return x.wrn_id == d[2];})
          if (n == -1) return;

          if      (d[7] == "주의") stn_list[n].wrn_now = 1;
          else if (d[7] == "경보") stn_list[n].wrn_now = 2;
        }
      });

      if (opt == 0) fnStnChg(opt);
      else fnShowTable();
    }

  };
  xhr.send();
}

// 점검표 표출
function fnShowTable(opt) {
  document.getElementById("loading").style.display = "block";

  var item = document.getElementById("wrn_table");
  while (item.hasChildNodes()) {
    item.removeChild(item.childNodes[0]);
  }

  //--------------------------------------------
  //1. 메뉴 정보 가져오기
  if (wrn_mode == "H" || wrn_mode == "C") {
    var data = document.getElementsByName("today");
    for (var i=0; i<data.length; i++) {
      if (data[i].checked == 1) {
        var today = data[i].value;
        break;
      }
    }
  }

  //var now = new Date();
  //now.setTime(now.getTime()-10*60*1000);

  var tm_today = addZeros(now.getFullYear(),4) + addZeros(now.getMonth()+1,2) + addZeros(now.getDate(),2);
  var date_today = new Date(tm_today.substring(0,4), parseInt(tm_today.substring(4,6))-1, tm_today.substring(6,8));

  var rp = document.getElementById("rp_stn");
  rp = rp.checked;

  var wrn_del = document.getElementById("wrn_del");
  wrn_del = wrn_del.checked;

  var list = "";
  var data = document.getElementsByName("list");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      list += data[i].value;
    }
  }
  if (list.toString().length == 0) {
    for (var i=0; i<data.length; i++) {
      if (wrn_mode == "C") {
        if (data[i].value == "T") {
          data[i].checked = true;
          list = data[i].value;
          break;
        }
      }
      else if (wrn_mode == "H") {
        if (data[i].value == "T") {
          data[i].checked = true;
          list = data[i].value;
          break;
        }
      }
      else if (wrn_mode == "D") {
        if (data[i].value == "E") {
          data[i].checked = true;
          list = data[i].value;
          break;
        }
      }
    }    
  }

  if (wrn_mode == "H" || wrn_mode == "C") var cond_opt = document.getElementById("cond_opt").value;

  var cond1 = document.getElementById("cond1");
  cond1 = cond1.checked;
  if (wrn_mode == "H" || wrn_mode == "C") {
    var cond2 = document.getElementById("cond2");
    cond2 = cond2.checked;
  }
  if (wrn_mode == "C") {
    var cond3 = document.getElementById("cond3");
    cond3 = cond3.checked;
  }

  var adv_cond1 = document.getElementById("adv_cond1").value;
  var wrn_cond1 = document.getElementById("wrn_cond1").value;
  if (wrn_mode == "H" || wrn_mode == "C") {
    var adv_cond2 = document.getElementById("adv_cond2").value;
    var wrn_cond2 = document.getElementById("wrn_cond2").value;
  }
  if (wrn_mode == "C") {
    var adv_cond3 = document.getElementById("adv_cond3").value;
    var wrn_cond3 = document.getElementById("wrn_cond3").value;
    var ext_cond1 = document.getElementById("ext_cond1").value;
  }

  var data = document.getElementsByName("tbl");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var tbl = data[i].value;
      break;
    }
  }

  var data = document.getElementsByName("day");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var day = data[i].value;
      break;
    }
  }

  //--------------------------------------------
  //2. 배열에 넣고 정렬
  for (var i=0; i<top_reg.length; i++) {
    top_reg[i].stn_num = 0;
    for (var j=0; j<top_reg[i].reg_arr.length; j++) {
      top_reg[i].reg_arr[j].wrn_arr = [];
      top_reg[i].reg_arr[j].stn_num = 0;
      for (var k=0; k<stn_list.length; k++) {
        if (stn_list[k].reg_up == top_reg[i].reg_arr[j].reg_id) {
          if (top_reg[i].reg_arr[j].wrn_arr.findIndex(function(x){return x.wrn_id == stn_list[k].wrn_id;}) == -1) {
            var n = top_reg[i].reg_arr[j].wrn_arr.length;
            top_reg[i].reg_arr[j].wrn_arr[n] = {};
            top_reg[i].reg_arr[j].wrn_arr[n].wrn_id = stn_list[k].wrn_id;
            top_reg[i].reg_arr[j].wrn_arr[n].wrn_ko = stn_list[k].wrn_ko;
            top_reg[i].reg_arr[j].wrn_arr[n].wrn_now = stn_list[k].wrn_now;
            top_reg[i].reg_arr[j].wrn_arr[n].wrn_sort = stn_list[k].wrn_sort;
            top_reg[i].reg_arr[j].wrn_arr[n].stn_arr = [];
            top_reg[i].reg_arr[j].wrn_arr[n].stn_num = 0;
            top_reg[i].reg_arr[j].wrn_arr[n].wrn_lvl = 0;
            top_reg[i].reg_arr[j].wrn_arr[n].disp_num = 0;
          }

          var n = top_reg[i].reg_arr[j].wrn_arr.findIndex(function(x){return x.wrn_id == stn_list[k].wrn_id;});
          var object = {};
          object.stn_id  = stn_list[k].stn_id;
          object.stn_ko  = stn_list[k].stn_ko;
          object.rp_id   = stn_list[k].rp_id;
          object.data    = stn_list[k].data;
          object.wrn_lvl = 0;

          if (rp == 1 && object.rp_id != object.stn_id) continue;
          top_reg[i].reg_arr[j].wrn_arr[n].stn_arr.push(object);
          top_reg[i].reg_arr[j].wrn_arr[n].stn_num++;
          top_reg[i].reg_arr[j].stn_num++;
          top_reg[i].stn_num++;
        }
      }
    }
  }

  for (var i=0; i<top_reg.length; i++) {
    for (var j=0; j<top_reg[i].reg_arr.length; j++) {
      top_reg[i].reg_arr[j].wrn_arr.sort(function(a,b){
        //return(a.wrn_id<b.wrn_id)?-1:(a.wrn_id>b.wrn_id)?1:0;
        return(a.wrn_sort<b.wrn_sort)?-1:(a.wrn_sort>b.wrn_sort)?1:0;
      });
    }
  }


  //--------------------------------------------
  //3. 주의보/경보 수준 체크
  for (var i=0; i<top_reg.length; i++) {
    for (var j=0; j<top_reg[i].reg_arr.length; j++) {
      for (var k=0; k<top_reg[i].reg_arr[j].wrn_arr.length; k++) {
        for (var l=0; l<top_reg[i].reg_arr[j].wrn_arr[k].stn_arr.length; l++) {         
          if (wrn_mode == "C") var tmn = -999, tmn_before = -999, tmn_diff = -999;
          else if (wrn_mode == "H") var tmx = -999, tmx_before = -999, tcx = -999, tcx_before = -999;
          else if (wrn_mode == "D") var hm_eff = -999, hm_eff_before = -999;

          for (var m=0; m<top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data.length; m++) {
            level = 0;

            if (wrn_mode == "H" || wrn_mode == "C") {
              if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].date == tm_today) {
                if      (today == "F" && top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "OBS") continue;
                else if (today == "O" && top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "FCT") continue;
              }
            }

            if (wrn_mode == "C") {
              if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn != "") {
                tmn  = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn);
                mnnm = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].mnnm);
                if (tmn_before != -999) {
                  tmn_diff = parseFloat(tmn)-parseFloat(tmn_before);
                  if (cond_opt == 'and' && cond1 == 1 && cond2 == 1) {
                    if      ((tmn_diff*-1) >= wrn_cond1 && tmn <= ext_cond1 && tmn <= wrn_cond2 && tmn_before <= wrn_cond2) level = 2;
                    else if ((tmn_diff*-1) >= adv_cond1 && tmn <= ext_cond1 && tmn <= adv_cond2 && tmn_before <= adv_cond2) level = 1;

                    if (cond3 == 1 && (isNaN(mnnm) || (level == 1 && mnnm - adv_cond3 < tmn) || (level == 2 && mnnm - wrn_cond3 < tmn))) level = 0;
                  }
                  else {
                    if (cond1 == 1) {
                      if      ((tmn_diff*-1) >= wrn_cond1 && tmn <= ext_cond1) level = 2;
                      else if ((tmn_diff*-1) >= adv_cond1 && tmn <= ext_cond1) level = 1;

                      if (cond3 == 1 && (isNaN(mnnm) || (level == 1 && mnnm - adv_cond3 < tmn) || (level == 2 && mnnm - wrn_cond3 < tmn))) level = 0;
                    }
                    if (cond2 == 1) {
                      if      (tmn <= wrn_cond2 && tmn_before <= wrn_cond2) level = 2;
                      else if (tmn <= adv_cond2 && tmn_before <= adv_cond2) level = 1;
                    }
                  }
                }
              }

              if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn == "") tmn_before = -999;
              else tmn_before = tmn; 
            }
            else if (wrn_mode == "H") {
              if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx != "") {
                tmx = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx);
                tcx = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tcx);
                if (tmx_before != -999) {
                  if (cond_opt == 'and' && cond1 == 1 && cond2 == 1) {
                    if      (tmx >= wrn_cond1 && tmx_before >= wrn_cond1 && tcx >= wrn_cond2 && tcx_before >= wrn_cond2) level = 2;
                    else if (tmx >= adv_cond1 && tmx_before >= adv_cond1 && tcx >= adv_cond2 && tcx_before >= adv_cond2) level = 1;
                  }
                  else {
                    if (cond1 == 1) {
                      if      (tmx >= wrn_cond1 && tmx_before >= wrn_cond1) level = 2;
                      else if (tmx >= adv_cond1 && tmx_before >= adv_cond1) level = 1;
                    }
                    if (cond2 == 1) {
                      if      (tcx >= wrn_cond2 && tcx_before >= wrn_cond2) level = 2;
                      else if (tcx >= adv_cond2 && tcx_before >= adv_cond2) level = 1;
                    }
                  }
                }
              }

              if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx == "") tmx_before = -999;
              else tmx_before = tmx; 

              if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tcx == "") tcx_before = -999;
              else tcx_before = tcx; 
            }
            else if (wrn_mode == "D") {
              if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_eff != "") {
                hm_eff = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_eff);
                if (hm_eff_before != -999) {
                  if (cond1 == 1) {
                    if      (hm_eff <= wrn_cond1 && hm_eff_before <= wrn_cond1) level = 2;
                    else if (hm_eff <= adv_cond1 && hm_eff_before <= adv_cond1) level = 1;
                  }
                }
              }

              if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_eff == "") hm_eff_before = -999;
              else hm_eff_before = hm_eff; 
            }

            var tm = top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].date;
            var date = new Date(tm.substring(0,4), parseInt(tm.substring(4,6))-1, tm.substring(6,8), 0, 0);
            var date_diff = (date.getTime() - date_today.getTime())/(24*60*60*1000);
            if (day > 0 && day != (date_diff+1)) continue;

            top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl = (top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl<level)?level:top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl;
            top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].wrn_lvl = (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].wrn_lvl<level)?level:top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].wrn_lvl;
          }
        }
      }
    }
  }

  for (var i=0; i<top_reg.length; i++) {
    for (var j=0; j<top_reg[i].reg_arr.length; j++) {
      for (var k=0; k<top_reg[i].reg_arr[j].wrn_arr.length; k++) {
        if (tbl == 3 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl > 0) {
          top_reg[i].reg_arr[j].wrn_arr[k].disp_num += top_reg[i].reg_arr[j].wrn_arr[k].stn_arr.length;
        }
        else if (tbl == 2 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 2) {
          top_reg[i].reg_arr[j].wrn_arr[k].disp_num += top_reg[i].reg_arr[j].wrn_arr[k].stn_arr.length;
        }
        else if (tbl == 1 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 1) {
          top_reg[i].reg_arr[j].wrn_arr[k].disp_num += top_reg[i].reg_arr[j].wrn_arr[k].stn_arr.length;
        }
        else if (tbl == 0 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 0) {
          top_reg[i].reg_arr[j].wrn_arr[k].disp_num += top_reg[i].reg_arr[j].wrn_arr[k].stn_arr.length;
        }
        else if (tbl == 4) {
          top_reg[i].reg_arr[j].wrn_arr[k].disp_num += top_reg[i].reg_arr[j].wrn_arr[k].stn_arr.length;
        }
      }
    }
  }

  console.log(top_reg);

  //--------------------------------------------
  //4. 표 만들기
  var thead_element = document.createElement("thead");
  var tbody_element = document.createElement("tbody");
 
  var i=0, j=0, k=0, l=0, li=0;
  var d_li = "<th class=wrn_th colspan=2>특보구역/현황</th><th class=stn colspan=2>AWS</th><th class=type>구분</th>";
  for (var m=0; m<top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data.length; m++) {
    if (wrn_mode == "H" || wrn_mode == "C") {
      if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].date == tm_today) {
        if      (today == "F" && top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "OBS") continue;
        else if (today == "O" && top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "FCT") continue;
      }
    }

    var tm = top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].date;
    var date = new Date(tm.substring(0,4), parseInt(tm.substring(4,6))-1, tm.substring(6,8), 0, 0);
    var date_diff = (date.getTime() - date_today.getTime())/(24*60*60*1000);

    var classname = "'data'";
    if (day > 0 && (day == (date_diff+1) || day == (date_diff+2))) {
      classname = "'data day'";
    }

    d_li += "<th class=" + classname + ">" + parseInt(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].date.substring(4,6)) + "." + parseInt(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].date.substring(6,8));

    if      (date_diff == -1) d_li += "(어제)";
    else if (date_diff == 0) d_li += "(오늘)";
    else if (date_diff == 1) d_li += "(내일)";
    else if (date_diff == 2) d_li += "(모레)";
    else if (date_diff == 3) d_li += "(글피)";
    d_li += "</th>";
  }

  var d_element = document.createElement("tr");
  d_element.innerHTML = d_li;
  thead_element.appendChild(d_element);

  for (var i=0; i<top_reg.length; i++) {
    if (document.getElementById("reg_id").value != "전국") {
      if (top_reg[i].stn_name != document.getElementById("reg_id").value) continue;
    }

    var j=0, k=0, l=0;
    d_li = "<td class=reg_name colspan=" + parseInt(5 + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data.length) + ">" + top_reg[i].name + "</td>";
    var d_element = document.createElement("tr");
    d_element.innerHTML = d_li;
    tbody_element.appendChild(d_element);

    for (var j=0; j<top_reg[i].reg_arr.length; j++) {
      for (var k=0; k<top_reg[i].reg_arr[j].wrn_arr.length; k++) {
        if (tbl < 4 && top_reg[i].reg_arr[j].wrn_arr[k].disp_num == 0) continue;

        if (tbl == 3 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 0) continue;
        else if (tbl == 2 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl != 2) continue;
        else if (tbl == 1 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl != 1) continue;
        else if (tbl == 0 && (top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl != 0 || top_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 0)) continue;

        if (wrn_del == 1 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_now != 0 && top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == top_reg[i].reg_arr[j].wrn_arr[k].wrn_now) continue;

        var wrn_head = 0;
        for (var l=0; l<top_reg[i].reg_arr[j].wrn_arr[k].stn_arr.length; l++) {        
          for (var li=0; li<list.toString().length; li++) {
            var d_li = "";
            if (wrn_head==0 && li==0) {
              var classname = "'wrn_ko'";
              if      (top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 2) classname = "'wrn_ko wrn" + wrn_mode + "'";
              else if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 1) classname = "'wrn_ko adv" + wrn_mode + "'";
              //d_li += "<td class=" + classname + " rowspan=" + top_reg[i].reg_arr[j].wrn_arr[k].disp_num*list.toString().length + ">" + top_reg[i].reg_arr[j].wrn_arr[k].wrn_ko + "</td>";
              d_li += "<td class=" + classname + " rowspan=" + top_reg[i].reg_arr[j].wrn_arr[k].disp_num*list.toString().length + " id=" + top_reg[i].reg_arr[j].wrn_arr[k].wrn_id + ">";
              d_li += top_reg[i].reg_arr[j].wrn_arr[k].wrn_ko + "</td>";

              if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 0) var wrn_now = "-"
              else if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 1) var wrn_now = "주의보"
              else if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 2) var wrn_now = "경보"

              d_li += "<td class=wrn_now rowspan=" + top_reg[i].reg_arr[j].wrn_arr[k].disp_num*list.toString().length + ">" + wrn_now + "</td>";
            }
            if (li==0) {
              var classname = "'stn_id'";
              if      (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].wrn_lvl == 2) classname = "'stn_id wrn" + wrn_mode + "'";
              else if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].wrn_lvl == 1) classname = "'stn_id adv" + wrn_mode + "'";
              d_li += "<td class=" + classname + " rowspan=" + list.toString().length + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].stn_id + "</td>";
              var classname = "'stn_ko'";
              if      (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].wrn_lvl == 2) classname = "'stn_ko wrn" + wrn_mode + "'";
              else if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].wrn_lvl == 1) classname = "'stn_ko adv" + wrn_mode + "'";
              d_li += "<td class=" + classname + " rowspan=" + list.toString().length + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].stn_ko;
              if (rp == 0 && top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].stn_id == top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].rp_id) d_li += "(대표)";
              d_li += "</td>";
            }

            if (wrn_mode == "C") {
              if (list.toString()[li] == "T") {
                d_li += "<td class='type small'>아침최저(시각)</td>";
              }
              else if (list.toString()[li] == "D") {
                d_li += "<td class='type small'>전날대비기온차</td>";
                var tmn_before = -999;
              }
              else if (list.toString()[li] == "N") {
                d_li += "<td class='type small'>평년일최저기온</td>";
              }
            }
            else if (wrn_mode == "H") {
              if (list.toString()[li] == "T") {
                d_li += "<td class='type small'>낮최고(시각)</td>";
              }
              else if (list.toString()[li] == "S") {
                d_li += "<td class='type small'>낮체감최고(시각)</td>";
              }
            }
            else if (wrn_mode == "D") {
              if (list.toString()[li] == "A") {
                d_li += "<td class='type'>평균습도</td>";
              }
              else if (list.toString()[li] == "N") {
                d_li += "<td class='type'>최저습도</td>";
              }
              else if (list.toString()[li] == "E") {
                d_li += "<td class='type'>실효습도</td>";
              }
            }
           
            for (var m=0; m<top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data.length; m++) {
              if (wrn_mode == "H" || wrn_mode == "C") {
                if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].date == tm_today) {
                  if      (today == "F" && top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "OBS") continue;
                  else if (today == "O" && top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "FCT") continue;
                }
              }

              if (wrn_mode == "C") {
                if (list.toString()[li] == "T") {
                  //if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn == null) {
                  if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn == "") {
                    d_li += "<td class=data>-</td>";
                  }
                  else {
                    var tmn = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn);
                    var classname = "'data'";
                    if (cond2 == 1) {
                      if      (tmn <= wrn_cond2) classname = "'data wrn" + wrn_mode + "'";
                      else if (tmn <= adv_cond2) classname = "'data adv" + wrn_mode + "'";
                    }

                    if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "OBS") {
                      d_li += "<td class=" + classname + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn + "(" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn_tm.substring(0,2);
                      d_li += ":" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn_tm.substring(2,4) + ")</td>";
                    }
                    else {
                      d_li += "<td class=" + classname + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn + "</td>";
                    }
                  }
                }
                else if (list.toString()[li] == "D") {
                  if (tmn_before != -999 && top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn != "") {
                    var tmn_diff = (parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn)-parseFloat(tmn_before)).toFixed(1);
                    var classname = "'data'";
                    if (cond1 == 1) {
                      if      ((tmn_diff*-1) >= wrn_cond1) classname = "'data wrn" + wrn_mode + "'";
                      else if ((tmn_diff*-1) >= adv_cond1) classname = "'data adv" + wrn_mode + "'";
                    }
                    d_li += "<td class=" + classname + ">" + tmn_diff + "</td>";
                  }
                  else {
                    d_li += "<td class=data>-</td>";
                  }

                  if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn == "") tmn_before = -999;
                  else tmn_before = top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmn;
                }
                else if (list.toString()[li] == "N") {
                  if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].mnnm == "") {
                    d_li += "<td class=data>-</td>";
                  }
                  else {
                    d_li += "<td class=data>" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].mnnm + "</td>";
                  }
                }
              }
              else if (wrn_mode == "H") {
                if (list.toString()[li] == "T") {
                  if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx == "") {
                    d_li += "<td class=data>-</td>";
                  }
                  else {
                    var tmx = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx);
                    var classname = "'data'";
                    if (cond1 == 1) {
                      if      (tmx >= wrn_cond1) classname = "'data wrn" + wrn_mode + "'";
                      else if (tmx >= adv_cond1) classname = "'data adv" + wrn_mode + "'";
                    }

                    if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "OBS") {
                      d_li += "<td class=" + classname + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx + "(" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx_tm.substring(0,2);
                      d_li += ":" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx_tm.substring(2,4) + ")</td>";
                    }
                    else {
                      d_li += "<td class=" + classname + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tmx + "</td>";
                    }
                  }
                }
                else if (list.toString()[li] == "S") {
                  if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tcx == "") {
                    d_li += "<td class=data>-</td>";
                  }
                  else {
                    var tcx = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tcx);
                    var classname = "'data'";
                    if (cond2 == 1) {
                      if      (tcx >= wrn_cond2) classname = "'data wrn" + wrn_mode + "'";
                      else if (tcx >= adv_cond2) classname = "'data adv" + wrn_mode + "'";
                    }

                    if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].type == "OBS") {
                      d_li += "<td class=" + classname + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tcx + "(" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tcx_tm.substring(0,2);
                      d_li += ":" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tcx_tm.substring(2,4) + ")</td>";
                    }
                    else {
                      d_li += "<td class=" + classname + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].tcx + "</td>";
                    }
                  }
                }
              }
              else if (wrn_mode == "D") {
                if (list.toString()[li] == "A") {
                  if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_avg == "") {
                    d_li += "<td class=data>-</td>";
                  }
                  else {
                    d_li += "<td class=data>" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_avg + "</td>";
                  }
                }
                else if (list.toString()[li] == "N") {
                  if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_min == "") {
                    d_li += "<td class=data>-</td>";
                  }
                  else {
                    d_li += "<td class=data>" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_min + "</td>";
                  }
                }
                else if (list.toString()[li] == "E") {
                  if (top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_eff == "") {
                    d_li += "<td class=data>-</td>";
                  }
                  else {
                    var hm_eff = parseFloat(top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_eff);
                    var classname = "'data'";
                    if (cond1 == 1) {
                      if      (hm_eff <= wrn_cond1) classname = "'data wrn" + wrn_mode + "'";
                      else if (hm_eff <= adv_cond1) classname = "'data adv" + wrn_mode + "'";
                    }

                    d_li += "<td class=" + classname + ">" + top_reg[i].reg_arr[j].wrn_arr[k].stn_arr[l].data[m].hm_eff + "</td>";
                  }
                }
              }

              wrn_head++;
            }

            var d_element = document.createElement("tr");
            d_element.innerHTML = d_li;
            tbody_element.appendChild(d_element);
          }
        }
      }
    }
  }

  document.getElementById("wrn_table").appendChild(thead_element);
  document.getElementById("wrn_table").appendChild(tbody_element);

  var width = 0;
  var th = document.querySelectorAll('.fixed_table thead th');
  for (var i=0; i<th.length; i++) {
    width += parseInt(getComputedStyle(th[i]).width.substring(0,getComputedStyle(th[i]).width.indexOf("px")));
  }

  document.querySelector('.fixed_table tbody').style.width = parseInt(width+25) + "px";

  if (opt != 0) fnShowRegMap();
  document.getElementById("loading").style.display = "none";

  if (document.getElementById("winput").style.display == "block") {
    winput_reg = top_reg;
    fnShowWrnInputTable();
    fnShowWrnInputRegMap();
  }
}

// 특보구역 지도 표출
function fnShowRegMap() {
  var num = 0;

  if (wrn_mode == "C") {
    var adv_color = "#A0DEFC";
    var wrn_color = "#7194DC";
  }
  else if (wrn_mode == "H") {
    var adv_color = "#FFC8FF";
    var wrn_color = "#F566A2";
  }
  else if (wrn_mode == "D") {
    var adv_color = "#FFFF90";
    var wrn_color = "#FFC90E";
  }

  var data = document.getElementsByName("tbl");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var tbl = data[i].value;
      break;
    }
  }

  var wrn_del = document.getElementById("wrn_del");
  wrn_del = wrn_del.checked;

  var data = document.getElementsByName("wrn_map");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var wrn_map = data[i].value;
      break;
    }
  }

  // 지도 1개 표출
  if (wrn_map != 2) {
    var div = document.querySelectorAll('#mapName');
    for (var i=0; i<div.length; i++) {
      div[i].parentNode.removeChild(div[i]);
    }

    document.getElementById("wrapper1").style.display = "none";
    if (map[1] != undefined) {
      map[0].unsync(map[1]);
      map[1].unsync(map[0]);
    }
  }
  else {
    num = 1;
  }

  for (var i=0; i<top_reg.length; i++) {
    for (var j=0; j<top_reg[i].reg_arr.length; j++) {
      for (var k=0; k<top_reg[i].reg_arr[j].wrn_arr.length; k++) {
        geoJsonLayers[num][top_reg[i].reg_arr[j].wrn_arr[k].wrn_id].feature.properties.wrn_lvl = top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl;
        geoJsonLayers[num][top_reg[i].reg_arr[j].wrn_arr[k].wrn_id].feature.properties.wrn_now = top_reg[i].reg_arr[j].wrn_arr[k].wrn_now;
        if (wrn_map == 2) geoJsonLayers[0][top_reg[i].reg_arr[j].wrn_arr[k].wrn_id].feature.properties.wrn_now = top_reg[i].reg_arr[j].wrn_arr[k].wrn_now;

        var tooltip = "<div><b>[" + top_reg[i].reg_arr[j].wrn_arr[k].wrn_ko + "]</b></div>";
        
        if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 0) var wrn_now = "-";
        else if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 1) var wrn_now = "주의보";
        else if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 2) var wrn_now = "경보";

        if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 0) var wrn_lvl = "-";
        else if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 1) var wrn_lvl = "주의보";
        else if (top_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 2) var wrn_lvl = "경보";

        tooltip += "<div>특보현황: " + wrn_now + "</div>";
        tooltip += "<div>특보예상: " + wrn_lvl + "</div>";
        geoJsonLayers[num][top_reg[i].reg_arr[j].wrn_arr[k].wrn_id].bindTooltip(tooltip, {sticky:true});
        if (wrn_map == 2) geoJsonLayers[0][top_reg[i].reg_arr[j].wrn_arr[k].wrn_id].bindTooltip(tooltip, {sticky:true});
      }
    }
  }

  if (wrn_map == 0) {
    geoJson[num].getLayers().map(function(layer) {
      if (layer.feature.properties.wrn_now == 2) layer.setStyle({ fill: true, fillColor: wrn_color, fillOpacity: 1 });
      else if (layer.feature.properties.wrn_now == 1) layer.setStyle({ fill: true, fillColor: adv_color, fillOpacity: 1 });
      else layer.setStyle({ fill: false });
    });
  }
  else if (wrn_map == 1) {
    geoJson[num].getLayers().map(function(layer) {
      if ((tbl >= 3 || tbl == 2) && layer.feature.properties.wrn_lvl == 2) layer.setStyle({ fill: true, fillColor: wrn_color, fillOpacity: 1 });
      else if ((tbl >= 3 || tbl == 1) && layer.feature.properties.wrn_lvl == 1) layer.setStyle({ fill: true, fillColor: adv_color, fillOpacity: 1 });
      else if ((tbl == 4 || tbl == 0) && layer.feature.properties.wrn_lvl == 0 && layer.feature.properties.wrn_now > 0) layer.setStyle({ fill: true, fillColor: "#E0E0E0", fillOpacity: 1 });
      else layer.setStyle({ fill: false });

      if (wrn_del == 1 && layer.feature.properties.wrn_lvl == layer.feature.properties.wrn_now) {
        layer.setStyle({ fill: false });
      }
    });
  }
  else if (wrn_map == 2) {
    geoJson[0].getLayers().map(function(layer) {
      if (layer.feature.properties.wrn_now == 2) layer.setStyle({ fill: true, fillColor: wrn_color, fillOpacity: 1 });
      else if (layer.feature.properties.wrn_now == 1) layer.setStyle({ fill: true, fillColor: adv_color, fillOpacity: 1 });
      else layer.setStyle({ fill: false });
    });

    geoJson[1].getLayers().map(function(layer) {
      if ((tbl >= 3 || tbl == 2) && layer.feature.properties.wrn_lvl == 2) layer.setStyle({ fill: true, fillColor: wrn_color, fillOpacity: 1 });
      else if ((tbl >= 3 || tbl == 1) && layer.feature.properties.wrn_lvl == 1) layer.setStyle({ fill: true, fillColor: adv_color, fillOpacity: 1 });
      else if ((tbl == 4 || tbl == 0) && layer.feature.properties.wrn_lvl == 0 && layer.feature.properties.wrn_now > 0) layer.setStyle({ fill: true, fillColor: "#E0E0E0", fillOpacity: 1 });
      else layer.setStyle({ fill: false });

      if (wrn_del == 1 && layer.feature.properties.wrn_lvl == layer.feature.properties.wrn_now) {
        layer.setStyle({ fill: false });
      }
    });
  }

}

// 지도에서 특보구역 선택 시 테이블 스크롤
function fnScrollTable() {
  var reg_up = this.feature.properties.regup;
  var reg_id = this.feature.properties.regid;
  var n = top_reg.findIndex(function(x){return x.stn_name == document.getElementById("reg_id").value;});
  if (n != -1) {
    var k = top_reg[n].reg_arr.findIndex(function(x){return x.reg_id == reg_up;});
    if (k == -1) {
      document.getElementById("reg_id").options[0].selected = true;
      fnShowTable(0);
    }
  }

  var n = document.getElementById("wrn_table").rows.length;
  for (var i=0; i<n; i++) {
    if (document.getElementById("wrn_table").rows[i].cells[0].id == reg_id) {
      document.querySelector('#wrn_table tbody').scrollTop = parseInt(17*(i-1));
      break;
    }
  }
}

// 지역 선택
function fnStnChg(opt) {
  if (opt == 0) {
    var n = map_code.findIndex(function(x){return x.stn_id == s_stnId;});
    if (n == -1) n = 0;
    document.getElementById("reg_id").options[n].selected = true;
  }
  else {
    var n = map_code.findIndex(function(x){return x.stn_name == document.getElementById("reg_id").value;});
  }
  var center = L.latLng(map_code[n].center)
  map[0].setView(center, map_code[n].initZoom);  

  fnShowTable();
}

// 조건 설정 초기화
function fnCondReset(opt) {
  if (wrn_mode == "C") {
    document.getElementById("cond1").checked = true;
    document.getElementById("cond2").checked = true;
    document.getElementById("cond3").checked = false;

    document.getElementById("cond_opt").value = "or";

    document.getElementById("adv_cond1").value = 10;
    document.getElementById("wrn_cond1").value = 15;
    document.getElementById("adv_cond2").value = -12;
    document.getElementById("wrn_cond2").value = -15;
    document.getElementById("adv_cond3").value = 3;
    document.getElementById("wrn_cond3").value = 3;
    document.getElementById("ext_cond1").value = 3;
  }
  else if (wrn_mode == "H") {
    //document.getElementById("cond1").checked = true;
    document.getElementById("cond2").checked = true;

    document.getElementById("cond_opt").value = "and";

    document.getElementById("adv_cond1").value = 33;
    document.getElementById("wrn_cond1").value = 35;
    document.getElementById("adv_cond2").value = 33;
    document.getElementById("wrn_cond2").value = 35;
  }
  else if (wrn_mode == "D") {
    document.getElementById("cond1").checked = true;

    document.getElementById("adv_cond1").value = 35;
    document.getElementById("wrn_cond1").value = 25;
  }

  if (opt != 0) fnShowTable();
}

// 최근시간
function tm_init(opt) {
  var now = new Date();
  now.setTime(parseInt((now.getTime()+2*60*60*1000)/(3*60*60*1000))*(3*60*60*1000) - 60*60*1000);
  var tm = addZeros(now.getFullYear(),4) + addZeros(now.getMonth()+1,2) + addZeros(now.getDate(),2) + addZeros(now.getHours(),2) + addZeros(0,2);

  document.getElementById("tm").value = tm.substring(0,4) + "." + tm.substring(4,6) + "." + tm.substring(6,8) + "." + tm.substring(8,10) + ":" + tm.substring(10,12);
  tm_value = tm;

  fnGetStnList(opt);
}

// 발표시간 입력 및 선택
function tm_input() {
  var tm = document.getElementById("tm").value;

  if (event.keyCode == 13) {
    if (tm.length != 16) {
      alert("시간 입력이 틀렸습니다. (년.월.일.시:분)");
      tm = tm_value;
      document.getElementById("tm").value = tm.substring(0,4) + "." + tm.substring(4,6) + "." + tm.substring(6,8) + "." + tm.substring(8,10) + ":" + tm.substring(10,12);
      return;
    }
    else if (tm.charAt(4) != "." || tm.charAt(7) != "." || tm.charAt(10) != "." || tm.charAt(13) != ":") {
      alert("시간 입력 양식이 틀렸습니다. (년.월.일.시:분)");
      tm = tm_value;
      document.getElementById("tm").value = tm.substring(0,4) + "." + tm.substring(4,6) + "." + tm.substring(6,8) + "." + tm.substring(8,10) + ":" + tm.substring(10,12);
      return;
    }
    else {
      var YY = tm.substring(0,4);
      var MM = tm.substring(5,7);
      var DD = tm.substring(8,10);
      var HH = tm.substring(11,13);
      var MI = tm.substring(14,16);

      err = 0;
      if (YY < 1990 || YY > 2100) err = 1;
      else if (MM < 1 || MM > 12) err = 2;
      else if (DD < 1 || DD > 31) err = 3;
      else if (HH < 0 || HH > 24) err = 4;
      else if (MI < 0 || MI > 60) err = 5;

      if (err > 0)
      {
        if      (err == 1) alert("년도가 틀렷습니다.(" + YY + ")");
        else if (err == 2) alert("월이 틀렸습니다.(" + MM + ")");
        else if (err == 3) alert("일이 틀렸습니다.(" + DD + ")");
        else if (err == 4) alert("시간이 틀렸습니다.(" + HH + ")");
        else if (err == 5) alert("분이 틀렸습니다.(" + MI + ")");

        tm = tm_value;
        document.getElementById("tm").value = tm.substring(0,4) + "." + tm.substring(4,6) + "." + tm.substring(6,8) + "." + tm.substring(8,10) + ":" + tm.substring(10,12);
        return;
      }

      var date = new Date(YY, parseInt(MM)-1, DD, HH, MI);
      date.setTime(parseInt((date.getTime()+2*60*60*1000)/(3*60*60*1000))*(3*60*60*1000) - 60*60*1000);
      tm = addZeros(date.getFullYear(),4) + addZeros(date.getMonth()+1,2) + addZeros(date.getDate(),2) + addZeros(date.getHours(),2) + addZeros(0,2);
      document.getElementById("tm").value = tm.substring(0,4) + "." + tm.substring(4,6) + "." + tm.substring(6,8) + "." + tm.substring(8,10) + ":" + tm.substring(10,12);
      tm_value = tm;

      fnGetStnList();
    }
  }
  else if (event.keyCode == 45 || event.keyCode == 46 || event.keyCode == 58) {
    event.returnValue = true;
  }
  else if (event.keyCode >= 48 && event.keyCode <= 57) {
    event.returnValue = true;
  }
  else {
    event.returnValue = false;
  }
}

// 시간 이동
function tm_move(moving) {
  var n = moving.length - 1;
  var mode = moving.charAt(n);
  var value = parseInt(moving);

  var tm = document.getElementById("tm").value;

  var YY = tm.substring(0,4);
  var MM = tm.substring(5,7);
  var DD = tm.substring(8,10);
  var HH = tm.substring(11,13);
  var MI = tm.substring(14,16);
  var date = new Date(YY, MM-1, DD, HH, MI);

  if (mode == "H") {
    date.setTime(date.getTime() + value*60*60*1000);
  }
  var tm = addZeros(date.getFullYear(),4) + addZeros(date.getMonth()+1,2) + addZeros(date.getDate(),2) + addZeros(date.getHours(),2) + addZeros(date.getMinutes(),2);
  document.getElementById("tm").value = tm.substring(0,4) + "." + tm.substring(4,6) + "." + tm.substring(6,8) + "." + tm.substring(8,10) + ":" + tm.substring(10,12);
  tm_value = tm;

  fnGetStnList();
}

// 숫자 자리수 맞춤
function addZeros(num, digit) {
  var zero = '';
  num = num.toString();
  if (num.length < digit) {
    for (var i=0; i < digit - num.length; i++) {
      zero += '0'
    }
  }
  return zero + num;
}

// inputbox에 숫자형식만 입력되도록 체크
function fn_onlyNumInput(e) {
  if (!isNaN(e.target.value) || (e.target.value[0] == "-" && e.target.value.length ==1)) {      
  }
  else {
    var value = "";
    var decimal_cnt = 0;
    for (var i=0; i<e.target.value.length; i++) {
      if ((i == 0 && e.target.value[i] == "-") || !isNaN(e.target.value[i])) {
        value += e.target.value[i];
      }      
      else if (decimal_cnt == 0 && e.target.value[i] == ".") {
        value += e.target.value[i];
        decimal_cnt++;
      }
    }
    //e.target.value = e.target.value.substring(0, e.target.value.length - 1);
    e.target.value = value;
    alert('숫자만 입력가능합니다.');
  }
}

// 분포도 팝업
function ana_view() {
  window.open("/lsp/aws/alwais_day.php?tm=&wrn="+wrn_mode,"","location=yes,left=20,top=20,width=1250,height=920,scrollbars=yes,resizable=yes");
}

// 구버전 이동
function old_view() {
  if (wrn_mode == "C" || wrn_mode == "H") {
    var url = "/wrn/wrn_ta_txt.php";
  }
  else if (wrn_mode == "D") {
    var url = "/wrn/wrn_dry_txt.php";
  }

  window.open(url,"","location=yes,left=20,top=20,width=1250,height=920,scrollbars=yes,resizable=yes");
}

// 지도 크기 조정
function fnMapResize() {
  if (mapOptions.width == 480) {
    mapOptions.width = 800;
    var div = document.querySelectorAll('#mapResize');
    for (var i=0; i<div.length; i++) {
      div[i].innerText = "좁게 보기";
    }
  }
  else {
    mapOptions.width = 480;
    var div = document.querySelectorAll('#mapResize');
    for (var i=0; i<div.length; i++) {
      div[i].innerText = "넓게 보기";
    }
  }

  resizeMap(0, mapOptions);
  resizeMap(1, mapOptions);
  map[0].invalidateSize();
  if (map.length > 1) map[1].invalidateSize();
}

// 함께 보기(지도 2개)
function fnDualMap() {
  document.getElementById("wrapper1").style.display = "block";
  if (map[1] == undefined) {
    createMap(1, wrapperId, mapOptions);
    //console.log(mapOptions);
  }
  map[0].sync(map[1]);
  map[1].sync(map[0]);

  var div = document.querySelectorAll('#mapName');
  for (var i=0; i<div.length; i++) {
    div[i].parentNode.removeChild(div[i]);
  }

  var control = L.control({position: 'topleft'})
  control.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'button_title')
    div.setAttribute("id", "mapName");
    div.innerText = "특보 현황";
    return div;
  };
  control.addTo(map[0]);

  var control = L.control({position: 'topleft'})
  control.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'button_title')
    div.setAttribute("id", "mapName");
    div.innerText = "특보 예상";
    return div;
  };
  control.addTo(map[1]);

  map[0].invalidateSize();
  map[1].invalidateSize();
  fnShowRegMap();
}

// 특보 입력창 실행
function fnWrnInput() {
  if (session_ok == 0) {
    alert("사용자가 로그인 되어있지 않습니다. 로그인 페이지로 이동합니다.");
    var G_loginPage = '/session/login.php';
    var loginPageUrl = G_loginPage + '?reqIeParamUrl=/fgd/main.php';
    window.location = loginPageUrl;
  }

  if (document.getElementById("winput").style.display == "block") {
    document.getElementById("winput").style.display = "none";
    return;
  }

  document.getElementById("winput").style.display = "block";
  fnResizeWrnInput();

  if (map.length <= 2) {
    mapOptions.height = 460;
    var width = mapOptions.width;
    mapOptions.width = 480;
    createMap(2, wrapperId, mapOptions);
    mapOptions.height = 600;
    mapOptions.width = width;

    var n = map_code.findIndex(function(x){return x.stn_id == s_stnId;});
    var center = L.latLng(map_code[n].center)
    map[2].setView(center, map_code[n].initZoom);  
    document.getElementById("s_stnid").innerText = "[관할청: " + map_code[n].stn_name + "]";
  }

  winput_reg = top_reg;
  fnShowWrnInputTable();
  fnShowWrnInputRegMap();
}

// 특보 입력창 크기 조정
function fnResizeWrnInput(opt) {
  if (opt != 1) {
    if (winput_width == -999) var table_width = 1000;
    else table_width = winput_width;
    if (winput_height == -999) var table_height = 530;
    else table_height = winput_height;

    document.getElementById("winput").style.width = parseInt(table_width) + "px";
    document.getElementById("winput").style.height = parseInt(table_height) + "px";
    if (winput_top == -999) document.getElementById("winput").style.top = "390px";
    else document.getElementById("winput").style.top = winput_top + "px";
    if (winput_left == -999) document.getElementById("winput").style.left= "505px";
    else document.getElementById("winput").style.left = winput_left + "px";
  }

  if (winput_width == -999) var table_width = 1000;
  else table_width = winput_width;
  document.getElementById("winput_table").style.width = parseInt(table_width-510) + "px";
}

// 특보 입력창 표 생성
function fnShowWrnInputTable(opt) {

  var item = document.getElementById("winput_tbody");
  while (item.hasChildNodes()) {
    item.removeChild(item.childNodes[0]);
  }

  var data = document.getElementsByName("wtbl");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var tbl = data[i].value;
      break;
    }
  }

  for (var i=0; i<winput_reg.length; i++) {
    if (s_stnId != 108) {
      if (winput_reg[i].stn_id != s_stnId) continue;
    }

    var j=0, k=0, l=0;
    var reg_text = "";
    var reg_total = 0;

    for (var j=0; j<winput_reg[i].reg_arr.length; j++) {
      var reg_count = 0;
      for (var k=0; k<winput_reg[i].reg_arr[j].wrn_arr.length; k++) {
        if (tbl == 3 && winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == 0) continue;
        else if (tbl == 2 && winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl != 2) continue;
        else if (tbl == 1 && winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl != 1) continue;
        else if (tbl == 0 && (winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl != 0 || winput_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 0)) continue;

        if (tbl != 0 && (winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == winput_reg[i].reg_arr[j].wrn_arr[k].wrn_now)) continue;

        if (reg_count == 0) {
          if (reg_text != "") reg_text += ", ";
          reg_text += winput_reg[i].reg_arr[j].reg_ko + "(" + winput_reg[i].reg_arr[j].wrn_arr[k].wrn_ko;
        }
        else reg_text += ", " + winput_reg[i].reg_arr[j].wrn_arr[k].wrn_ko;
        reg_count++;
      }
      reg_total += reg_count;
      if (reg_count > 0) reg_text += ")";
    }

    if (reg_total > 0) {
      var tr_element = document.createElement("tr");
      var td_element = document.createElement("td");
      if (tbl == 1) td_element.innerText = "주의보";
      else if (tbl == 2) td_element.innerText = "경보";
      else if (tbl == 0) td_element.innerText = "해제";
      td_element.style.borderRight = "1px solid black";
      td_element.style.borderTop = "1px solid black";
      td_element.width = 50;
      document.getElementById("winput_tbody").appendChild(td_element);
      var td_element = document.createElement("td");
      td_element.style.paddingLeft = "6px";
      td_element.style.paddingRight = "6px";
      td_element.style.textAlign = "left";
      td_element.style.borderTop = "1px solid black";
      td_element.innerText = reg_text;
      document.getElementById("winput_tbody").appendChild(td_element);
      document.getElementById("winput_tbody").appendChild(tr_element);
    }
  }

  if (!item.hasChildNodes()) {
      var tr_element = document.createElement("tr");
      var td_element = document.createElement("td");
      if (tbl == 1) td_element.innerText = "주의보";
      else if (tbl == 2) td_element.innerText = "경보";
      else if (tbl == 0) td_element.innerText = "해제";
      td_element.style.borderRight = "1px solid black";
      td_element.style.borderTop = "1px solid black";
      td_element.width = 50;
      document.getElementById("winput_tbody").appendChild(td_element);
      var td_element = document.createElement("td");
      td_element.innerText = "입력할 특보가 없습니다.";
      td_element.style.paddingLeft = "6px";
      td_element.style.paddingRight = "6px";
      td_element.style.textAlign = "left";
      td_element.style.borderTop = "1px solid black";
      document.getElementById("winput_tbody").appendChild(td_element);
      document.getElementById("winput_tbody").appendChild(tr_element);
  }
}

// 특보입력창 지도 생성
function fnShowWrnInputRegMap() {
  var data = document.getElementsByName("wtbl");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var tbl = data[i].value;
      break;
    }
  }

  var num = 2;

  if (wrn_mode == "C") {
    var adv_color = "#A0DEFC";
    var wrn_color = "#7194DC";
  }
  else if (wrn_mode == "H") {
    var adv_color = "#FFC8FF";
    var wrn_color = "#F566A2";
  }
  else if (wrn_mode == "D") {
    var adv_color = "#FFFF90";
    var wrn_color = "#FFC90E";
  }

  for (var i=0; i<winput_reg.length; i++) {
    for (var j=0; j<winput_reg[i].reg_arr.length; j++) {
      for (var k=0; k<winput_reg[i].reg_arr[j].wrn_arr.length; k++) {
        geoJsonLayers[num][winput_reg[i].reg_arr[j].wrn_arr[k].wrn_id].feature.properties.wrn_lvl = winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl;
        geoJsonLayers[num][winput_reg[i].reg_arr[j].wrn_arr[k].wrn_id].feature.properties.wrn_now = winput_reg[i].reg_arr[j].wrn_arr[k].wrn_now;
      }
    }
  }

  geoJson[num].getLayers().map(function(layer) {
    if ((tbl >= 3 || tbl == 2) && layer.feature.properties.wrn_lvl == 2) layer.setStyle({ fill: true, fillColor: wrn_color, fillOpacity: 1 });
    else if ((tbl >= 3 || tbl == 1) && layer.feature.properties.wrn_lvl == 1) layer.setStyle({ fill: true, fillColor: adv_color, fillOpacity: 1 });
    else if ((tbl == 4 || tbl == 0) && layer.feature.properties.wrn_lvl == 0 && layer.feature.properties.wrn_now > 0) layer.setStyle({ fill: true, fillColor: "#E0E0E0", fillOpacity: 1 });
    else layer.setStyle({ fill: false });

    if (layer.feature.properties.wrn_lvl == layer.feature.properties.wrn_now) {
      layer.setStyle({ fill: false });
    }
  });
}

// 특보구역 추가/제거
function fnWrnAdd() {
  var data = document.getElementsByName("wtbl");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var tbl = data[i].value;
      break;
    }
  }

  var reg_id = this.feature.properties.regid;

  for (var i=0; i<winput_reg.length; i++) {
    for (var j=0; j<winput_reg[i].reg_arr.length; j++) {
      for (var k=0; k<winput_reg[i].reg_arr[j].wrn_arr.length; k++) {
        if (winput_reg[i].reg_arr[j].wrn_arr[k].wrn_id == reg_id) {
          if (s_stnId != 108 && winput_reg[i].stn_id != s_stnId) {
            alert('관할 지역이 아닙니다.');
            return;
          }

          if (tbl == 0 && winput_reg[i].reg_arr[j].wrn_arr[k].wrn_now == 0) {
            alert('해제할 특보가 없습니다.');
            return;
          }
          else if (tbl == 1 && tbl == winput_reg[i].reg_arr[j].wrn_arr[k].wrn_now) {
            alert('이미 주의보가 발표된 지역입니다.');
            return;
          }
          else if (tbl == 2 && tbl == winput_reg[i].reg_arr[j].wrn_arr[k].wrn_now) {
            alert('이미 경보가 발표된 지역입니다.');
            return;
          }

          if (winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl != tbl) winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl = tbl;
          else {
            if (tbl != 0) {
              winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl = winput_reg[i].reg_arr[j].wrn_arr[k].wrn_now;
            }
            else winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl = -1;
          }
        }
      }
    }
  }

  fnShowWrnInputTable();
  fnShowWrnInputRegMap();
}

// 특보 편집기로 데이터 전송
function fnTransferData() {
  var data = document.getElementsByName("wtbl");
  for (var i=0; i<data.length; i++) {
    if (data[i].checked == 1) {
      var tbl = data[i].value;
      break;
    }
  }

  var check = document.formSub;
  //while (check.hasChildNodes()) {
  //  check.removeChild(check.childNodes[0]);
  //}
  check.action = 'http://afs.kma.go.kr/afs/wrn/spe/wrnRetrieveMgrOpenGis.jsp';
  check.target = 'wrnView';

  var wrn_data = {};
  wrn_data.wrnTp = wrn_mode;
  if (tbl == 1) wrn_data.wrnLvl = "2";
  else if (tbl == 2) wrn_data.wrnLvl = "3";
  else if (tbl == 0) wrn_data.wrnLvl = "0";
  wrn_data.tmFc = tm_value;
  wrn_data.regId = [];

  for (var i=0; i<winput_reg.length; i++) {
    if (s_stnId != 108) {
      if (winput_reg[i].stn_id != s_stnId) continue;
    }

    for (var j=0; j<winput_reg[i].reg_arr.length; j++) {
      for (var k=0; k<winput_reg[i].reg_arr[j].wrn_arr.length; k++) {
        if (winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == winput_reg[i].reg_arr[j].wrn_arr[k].wrn_now) continue;
        else if (winput_reg[i].reg_arr[j].wrn_arr[k].wrn_lvl == tbl) wrn_data.regId[wrn_data.regId.length] = winput_reg[i].reg_arr[j].wrn_arr[k].wrn_id;
      }
    }
  }

  console.log(wrn_data);
  document.getElementById("directInput").value = JSON.stringify(wrn_data);
  check.submit();
}

// 특보입력 창 드래그 적용
function initDragElement() {
  var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
  var popups = document.getElementsByClassName("winput");
  var elmnt = null;
  var currentZIndex = 100; //TODO reset z index when a threshold is passed

  for (var i = 0; i < popups.length; i++) {
    var popup = popups[i];
    var header = getHeader(popup);

    //popup.onmousedown = function() {
    //  this.style.zIndex = "" + ++currentZIndex;
    //};

    if (header) {
      header.parentPopup = popup;
      header.onmousedown = dragMouseDown;
    }
  }

  function dragMouseDown(e) {
    elmnt = this.parentPopup;
    //elmnt.style.zIndex = "" + ++currentZIndex;

    e = e || window.event;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    if (!elmnt) {
      return;
    }

    e = e || window.event;
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    if (elmnt.offsetTop - pos2 > 95) {
      elmnt.style.top = elmnt.offsetTop - pos2 + "px";
      winput_top = elmnt.offsetTop - pos2;
    }
    else {
      elmnt.style.top = "95px";
      winput_top = 95;
    }
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    winput_left = elmnt.offsetLeft - pos1;

    fnBodyResize(1, winput_top, winput_left);
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function getHeader(element) {
    var headerItems = element.getElementsByClassName("winput-header");

    if (headerItems.length === 1) {
      return headerItems[0];
    }

    return null;
  }
}

// 특보입력 창 크기변경 적용
function initResizeElement() {
  var popups = document.getElementsByClassName("winput");
  var element = null;
  var startX, startY, startWidth, startHeight, startLeft, startTop;
  var src;
  //var direction = ["right", "bottom", "left", "top", "rightbottom", "righttop", "leftbottom", "lefttop"];
  var direction = ["right", "left"];

  for (var i = 0; i < popups.length; i++) {
    var p = popups[i];

    for (var j = 0; j < direction.length; j++) {
      var resizer = document.createElement("div");
      resizer.className = "resizer-" + direction[j];
      p.appendChild(resizer);
      resizer.addEventListener("mousedown", initDrag, false);
      resizer.parentPopup = p;
    }
  }

  function initDrag(e) {
    //src = this.classList.value;
    src = this.className;
    element = this.parentPopup;

    startX = e.clientX;
    startY = e.clientY;
    startLeft   = parseInt(document.defaultView.getComputedStyle(element).left);
    startTop    = parseInt(document.defaultView.getComputedStyle(element).top);
    startWidth  = parseInt(document.defaultView.getComputedStyle(element).width,  10);
    startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
    document.documentElement.addEventListener("mousemove", doDrag, false);
    document.documentElement.addEventListener("mouseup", stopDrag, false);
  }

  function doDrag(e) {
    if (src.indexOf("right") != -1) element.style.width = startWidth + e.clientX - startX + "px";
    if (src.indexOf("left") != -1) {
      element.style.width = startWidth - (e.clientX - startX) + "px";
      element.style.left = startLeft + (e.clientX - startX) + "px";
      winput_left = startLeft + (e.clientX - startX);
    }
    if (src.indexOf("bottom") != -1) element.style.height = startHeight + e.clientY - startY + "px";
    if (src.indexOf("top") != -1) {
      element.style.height = startHeight - (e.clientY - startY) + "px";
      element.style.top = startTop + (e.clientY - startY) + "px";
    }
    winput_width = parseInt(document.defaultView.getComputedStyle(element).width, 10);
    fnResizeWrnInput(1);
  }

  function stopDrag() {
    document.documentElement.removeEventListener("mousemove", doDrag, false);
    document.documentElement.removeEventListener("mouseup", stopDrag, false);
  }
}