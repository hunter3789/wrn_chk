<!DOCTYPE HTML>
<HTML>
<HEAD>
<title>특보 점검표(기온/건조)</title>
<meta http-equiv="Content-Type" content="text/html; charset=EUC-KR"/>
<meta http-equiv='X-UA-Compatible' content='IE=edge'/>

<script language="javascript" src="/sys/js/dateutil.js"></script>
<script language="javascript" src="/sys/js/popupCalendar.js"></script>

<link rel="stylesheet" href="/lsp/htdocs/css/leaflet/leaflet.css" />
<link rel="stylesheet" href="/lsp/htdocs/css/gis.css">
<link rel="stylesheet" type="text/css" href="/lsp/htdocs/css/fontawesome/css/all.css"/>
<link rel="stylesheet" href="./style.css?<?=date('Ymdhis')?>">

<!-- jQuery -->
<script type="text/javascript" src="/lsp/htdocs/js/jquery/jquery-3.4.1.min.js"></script>
<script type="text/javascript" src="/lsp/htdocs/js/jquery/jquery-migrate-3.1.0.min.js"></script>
<script type="text/javascript" src="/sys/js/reload-frame.js"></script>
<!-- Map Config -->
<script type="text/javascript" src="/lsp/htdocs/js/mapConfig.js"></script>

<!-- Leaflet -->
<script type="text/javascript" src="/lsp/htdocs/js/leaflet/leaflet-src.js"></script>
<!-- Proj4 -->
<script type="text/javascript" src="/lsp/htdocs/js/proj4/proj4.js"></script>
<script type="text/javascript" src="/lsp/htdocs/js/proj4leaflet/proj4leaflet.js"></script>
<!-- AfsMapTms -->
<script type="text/javascript" src="/lsp/htdocs/js/AfsMapTmsProviders/Leaflet.AfsMapTmsProviders.js"></script>
<!-- Leaflet plugin -->
<script type="text/javascript" src="/lsp/htdocs/js/leaflet-pattern/leaflet.pattern-src.js"></script>
<script type="text/javascript" src="/lsp/htdocs/js/leaflet-CanvasMarkers/leaflet.canvas-markers.js"></script>
<script type="text/javascript" src="/lsp/htdocs/js/leaflet-canvaslayer/L.CanvasLayer.js"></script>
<script type="text/javascript" src="/lsp/htdocs/js/leaflet-sync/L.Map.Sync.js"></script>

<!-- Map Common -->
<script type="text/javascript" src="/lsp/htdocs/js/afsMapConfig.js"></script>
<script type="text/javascript" src="/lsp/htdocs/js/afsMapLayer.js"></script>
<script type="text/javascript" src="./afsWrnLayer.js?<?=date('Ymdhis')?>"></script>
<script type="text/javascript" src="./afsMapProvider.js?<?=date('Ymdhis')?>"></script>

<!-- JS -->
<script type="text/javascript">
<!--
var s_stnId = "<?=$_SESSION["s_stnId"]?>";
//-->
</script>
<script type="text/javascript" src="./wrn_chk.js?<?=date('Ymdhis')?>"></script>

</HEAD>
<BODY onload='onLoad();' bgcolor=#ffffff topmargin=5 leftmargin=5 marginwidth=5 marginheight=5 style='overflow:hidden;'>

<div id=head style='position:relative; overflow:hidden; height:42px; Background-Color:#FFFFFF; display:flex; align-items:center;'>
  <div style='min-width:10px;'></div>
  <div><img src='http://afs.kma.go.kr/htdocsStm/images/ptl/logo.png'></div>
  <div style='min-width:4px;'></div>
  <div style='font-weight:bold; font-size:18px; font-family:Nanum Gothic, sans-serif; white-space:nowrap;'>특보점검표</div>
  <div style='min-width:40px;'></div>
  <div><input id=button_H type=button class=button onclick="menu_init('H');" value="폭염"></div>
  <div style='min-width:10px;'></div>
  <div><input id=button_C type=button class=button onclick="menu_init('C');" value="한파"></div>
  <div style='min-width:10px;'></div>
  <div><input id=button_D type=button class=button onclick="menu_init('D');" value="건조"></div>
</div>

<!-- 메뉴 -->
<div id=menu style='position:relative; overflow:hidden;'>
<table cellpadding=0 cellspacing=0 border=0 width=100% class='T02_Style01'>
<tr>
  <td nowrap class=T02_List01>
    <table border=0 cellpadding=0 cellspacing=0 align=left>
    <!-- 1번째 줄 -->
    <tr>
      <td>
        <table border=0 cellpadding=0 cellspacing=0 align=left>
        <tr height=2></tr>
        <tr height=22>
          <td nowrap width=10></td>
          <td nowrap class=T02_Title02>&middot;&nbsp;지역</td>
          <td nowrap width=10></td> 
          <td nowrap>
            <select id=reg_id name=reg_id onChange='fnStnChg();' class='text3'>
              <option selected>전국</option>
              <option>수도권청</option>
              <option>대전청</option>
              <option>강원청</option>
              <option>광주청</option>
              <option>부산청</option>
              <option>대구청</option>
              <option>제주청</option>
              <option>청주지청</option>
              <option>전주지청</option>
            </select>
          </td>

          <td nowrap width=20></td>
          <td nowrap class=T02_Title02>&middot;&nbsp;자료</td>
          <td nowrap width=10></td>
          <td nowrap>
            <span class="radio-style"><input type="radio" id="data01" name="data" onclick="fnGetStnList();" value="G" checked=""><label for="data01" class=text1>예보</label></span>
            <span class="radio-style"><input type="radio" id="data02" name="data" onclick="fnGetStnList();" value="I"><label for="data02" class=text1>BEST</label></span>
          </td>
          <td nowrap width=20></td>
          <td nowrap class=T02_Title02>&middot;&nbsp;발표시각</td>
          <td nowrap width=10></td>
          <td nowrap><input type=button class=TB08 style="background-color:#ffffff; width:40px;" onclick="tm_init();" value='NOW'></td>
          <td nowrap width=5></td> 
          <td style='padding:0 0 0 2;'><input type="text" name="tm" id="tm" value="0" maxlength="16" class=TimeBox style="width:130px;" onkeypress="tm_input();"></td>
          <td nowrap width=5></td>
          <td nowrap><input type=button class=TB09 onclick="tm_move('-6H');" style="background-color:#e5f8ff; width:35px;" value="-6H"></td>
          <td nowrap width=2></td>
          <td nowrap><input type=button class=TB09 onclick="tm_move('-3H');" style="background-color:#f3fcff; width:35px;" value="-3H"></td>
          <td nowrap width=2></td>
          <td nowrap><input type=button class=TB09 onclick="tm_move('+3H');" style="background-color:#fff4f1; width:35px;" value="+3H"></td>
          <td nowrap width=2></td>
          <td nowrap><input type=button class=TB09 onclick="tm_move('+6H');" style="background-color:#ffebe5; width:35px;" value="+6H"></td>

          <td nowrap width=20></td>
          <td nowrap class=T02_Title02>&middot;&nbsp;요소</td>
          <td nowrap width=10></td>
          <td nowrap>
            <table border=0 cellpadding=0 cellspacing=0 align=left id=list_menu>
            </table>
          </td>

          <td nowrap width=20></td>
          <td nowrap class=T02_Title02>&middot;&nbsp;대표지점</td>
          <td nowrap>
            <span class="checkbox-style">
              <input type="checkbox" id="rp_stn" name="rp_stn" onclick="fnShowTable();" checked>
            </span>
          </td>
        </tr>
        </table>
      </td>
    </tr>

    <!-- 2번째 줄 -->
    <tr>
      <td nowrap>
        <table border=0 cellpadding=0 cellspacing=0 align=left>
        <tr height=22>
          <td nowrap style='min-width:10px;'></td>

          <td nowrap>
            <table border=0 cellpadding=0 cellspacing=0 align=left id=ta_menu style="display:block;">
            <tr>
              <td nowrap class=T02_Title02>&middot;&nbsp;오늘 기온</td>
              <td nowrap style='min-width:10px;'></td> 
              <td nowrap>
                <span class="radio-style"><input type="radio" id="today01" name="today" onclick="fnShowTable();" value="O" checked><label for="today01" class=text1>관측</label></span>
                <span class="radio-style"><input type="radio" id="today02" name="today" onclick="fnShowTable();" value="F"><label for="today02" class=text1>예측</label></span>
              </td>

              <td nowrap style='min-width:20px;'></td>
            </tr>
            </table>
          </td>

          <td nowrap class=T02_Title02>&middot;&nbsp;표출</td>
          <td nowrap style='min-width:10px;'></td>
          <td nowrap>
            <span class="radio-style"><input type="radio" id="tbl01" name="tbl" onclick="fnShowTable();" value="4" checked><label for="tbl01" class=text1>전체</label></span>
            <span class="radio-style"><input type="radio" id="tbl02" name="tbl" onclick="fnShowTable();" value="3"><label for="tbl02" class=text1>주의보+경보</label></span>
            <span class="radio-style"><input type="radio" id="tbl03" name="tbl" onclick="fnShowTable();" value="1"><label for="tbl03" class=text1>주의보</label></span>
            <span class="radio-style"><input type="radio" id="tbl04" name="tbl" onclick="fnShowTable();" value="2"><label for="tbl04" class=text1>경보</label></span>
            <span class="radio-style"><input type="radio" id="tbl05" name="tbl" onclick="fnShowTable();" value="0"><label for="tbl05" class=text1>해제</label></span>
            </span>
          </td>

          <td nowrap style='min-width:20px;'></td>
          <td nowrap class=T02_Title02>&middot;&nbsp;특보 기발표 구역 제외</td>
          <td nowrap>
            <span class="checkbox-style">
              <input type="checkbox" id="wrn_del" name="wrn_del" onclick="fnShowTable();">
            </span>
          </td>

          <td nowrap style='min-width:20px;'></td>
          <td nowrap class=T02_Title02>&middot;&nbsp;기준 날짜</td>
          <td nowrap style='min-width:10px;'></td>
          <td nowrap>
            <span class="radio-style"><input type="radio" id="day01" name="day" onclick="fnShowTable();" value="0" checked><label for="day01" class=text1>전체</label></span>
            <span class="radio-style"><input type="radio" id="day02" name="day" onclick="fnShowTable();" value="1"><label for="day02" class=text1>어제~오늘</label></span>
            <span class="radio-style"><input type="radio" id="day03" name="day" onclick="fnShowTable();" value="2"><label for="day03" class=text1>오늘~내일</label></span>
            <span class="radio-style"><input type="radio" id="day04" name="day" onclick="fnShowTable();" value="3"><label for="day04" class=text1>내일~모레</label></span>
            <span class="radio-style"><input type="radio" id="day05" name="day" onclick="fnShowTable();" value="4"><label for="day05" class=text1>모레~글피</label></span>
            </span>
          </td>
        </tr>
        </table>
      </td>
    </tr>

    <tr height=3>
      <td>
      </td>
    </tr>

    <!-- 3번째 줄 -->
    <tr>
      <td>
        <table border=0 cellpadding=0 cellspacing=0 align=left>
        <tr style='vertical-align:top;'>
          <td nowrap width=10></td>
          <td>
            <table border=0 cellpadding=0 cellspacing=0 align=left id=cond_menu>
            </table>
          </td>

          <td nowrap width=20></td> 
          <td><input type=button class=TB08 style="margin-top:18px; background-color:#EEEEEE; width:65px; height:20px; border-radius:3px;" onclick="fnWrnInput();" value='특보 입력'></td>
          <td nowrap width=8></td> 
          <td><input type=button class=TB08 style="margin-top:18px; background-color:#EEEEEE; width:80px; height:20px; border-radius:3px;" onclick="ana_view();" value='일통계 분포도'></td>
          <td nowrap width=8></td> 
          <td><input type=button class=TB08 style="margin-top:18px; background-color:#EEEEEE; width:80px; height:20px; border-radius:3px;" onclick="old_view();" value='(구)버전 이동'></td>

        </tr>
        </table>
      </td>
    </tr>

    </table>

  </td>
</tr>
</table>
</div>

<!-- 바디 -->
<div id=body style='overflow:auto;' onscroll='fnBodyScroll();'>

  <div style='height:6px;'></div>
  <div style='display:flex;'>
    <div style='min-width:4px;'></div>
    <div id=subject style='white-space:nowrap;'></div>
    <div style='min-width:10px;'></div>
    <div id=data_info style='white-space:nowrap;'></div>
  </div>
  <div style='height:6px;'></div>

  <div id=container style='display:flex;'>
    <div style='min-width:4px;'></div>
    <div id='wrapper0'>
    </div>
    <div id='wrapper1'>
    </div>
    <div style='min-width:15px;'></div>
    <div id=wrn_table_container class=table_container>
      <table id=wrn_table class='table fixed_table' cellspacing=0 cellpadding=0>
      </table>
    </div>
  </div>

  <div id=hidden_div style='visibility:hidden;'></div>

  <form name="formSub" mehod="POST">
      <input type="hidden" id="directInput" name="directInput" />
  </form>

  <!-- 특보 입력창 -->
  <div id=winput class=winput style='position:absolute; z-index:1000; display:none; background-color:white; border:1px solid black; text-align:center; vertical-align:middle; padding:4px;'>
    <div class="winput-header">여기를 드래그해서 이동 / 좌우 테두리 드래그해서 크기조정</div>
    <div style='height:20px; text-align:right;'><button class=TB08 style='position:relative; right:6px; height:20px; width:40px; cursor:pointer; border-radius:3px;' onclick="document.getElementById('winput').style.display = 'none';">창닫기</button></div>
    <div id=winput_container style='display:flex;'>
      <div id='wrapper2'>
      </div>
      <div style='min-width:15px;'></div>
      <div id=winput_table_container>
        <div style='text-align:left;'>
          <span class="radio-style"><input type="radio" id="wtbl03" name="wtbl" onclick="fnShowWrnInputTable(); fnShowWrnInputRegMap();" value="1" checked><label for="wtbl03" class=text1>주의보</label></span>
          <span class="radio-style"><input type="radio" id="wtbl04" name="wtbl" onclick="fnShowWrnInputTable(); fnShowWrnInputRegMap();" value="2"><label for="wtbl04" class=text1>경보</label></span>
          <span class="radio-style"><input type="radio" id="wtbl05" name="wtbl" onclick="fnShowWrnInputTable(); fnShowWrnInputRegMap();" value="0"><label for="wtbl05" class=text1>해제</label></span>
        </div>
        <div style='height:4px;'></div>
        <div style='text-align:left;' id=s_stnid></div>

        <div style='height:4px;'></div>
        <table id=winput_table style='border:1px solid black;' cellspacing=0 cellpadding=0>
          <thead>
            <tr style='background-color:#D7EAF4;'>
              <th style='border-right:1px solid black;' nowrap>종류</th>
              <th nowrap>특보구역</th>
            </tr>
          </thead>
          <tbody id=winput_tbody>
          </tbody>
        </table>
        <div style='height:4px;'></div>
        <div style='height:20px; text-align:right;'><button class=TB08 style='height:20px; width:80px; cursor:pointer; border-radius:3px;' onclick="fnTransferData();">특보 입력하기</button></div>
      </div>
    </div>
  </div>

</div>
<!-- 바디 끝 -->

<div id=loading style='position:absolute; top:0px; left:0px; z-index:1100; width:100%; height:100%; background-color:#eeeeee; opacity:0.5; text-align:center; vertical-align:middle;'>
  <div class=_ku_LoadingBar></div>
</div>

</BODY>
</HTML>