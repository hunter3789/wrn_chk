<?
Header("Content-Type: text/plain");

// 1. 사용자 입력사항
$mode = $_REQUEST["mode"];

if(empty($mode) && $mode != "0") {
  printf("###error");
  return;
}

$tmfc = $_REQUEST["tmfc"];
$step = $_REQUEST["step"];
$help = $_REQUEST["help"];
$var  = $_REQUEST["var"];

// 2. DB 연결
$mode_login = 2;  // AFS
$login_php = "/fct/www/include/tb_login.php";
require( $login_php );
$dbconn = TB_Login($mode_login);

// 특보구역별 AWS 지점 정보
if ($mode == "0") {
  // 3. SQL
  $sz = "
  select reg_id, reg_ko wrn_ko, reg_up
  from reg_wrn2
  where tm_ed > sysdate
    and reg_id like 'L%'
    and reg_up is not NULL
    and reg_up = 'L1000000'
  ";

  $stmt = odbc_prepare($dbconn, $sz);
  $exec = odbc_execute($stmt);
  while ($rs = odbc_fetch_array($stmt)) {
    echo $rs[REG_ID].",";
    echo $rs[WRN_KO].",";
    echo "=\n";
  }
  odbc_close($dbconn);
}
// 특보구역별 AWS 지점 정보
else if ($mode == "1") {

  if ($tm == "" || strlen($tm) < 10)
    $nt = time()-10*60;
  else
    $nt = mktime(substr($tm,8,2),substr($tm,10,2),0,substr($tm,4,2),substr($tm,6,2),substr($tm,0,4));
  $tm = date("YmdHi", $nt);

  if ($help == 1) {
    echo "###########################################################################\n";
    echo "#  [ AWS지점의 예보구역코드와 특보구역코드 확인용 ] \n";
    echo "#\n";
    echo "#  1. STN_ID     : AWS 지점번호\n";
    echo "#  2. STN_KO     : AWS 지점명\n";
    echo "#  3. STN_SP     : AWS 특성코드\n";
    echo "#  4. LON        : AWS 경도(degree)\n";
    echo "#  5. LAT        : AWS 위도(degree)\n";
    echo "#  6. HT         : AWS 해발고도(m)\n";
    echo "#  7. REG_UP     : 상위 특보구역코드\n";
    echo "#  8. WRN_ID     : 특보구역코드\n";
    echo "#  9. WRN_KO     : 특보구역명\n";
    echo "# 10. SFC_STN_ID : 특보발표 대표지점번호\n";
    echo "# 11. WRN_SORT   : 특보구역 정렬(통보문 지점순)\n";
    echo "###########################################################################\n";
    echo "#STN_ID,STN_KO,STN_SP,LON,LAT,HT,REG_UP,WRN_ID,WRN_KO,SFC_STN_ID,WRN_SORT=\n";
  }

  $url = "/fct/REF/INI/wrn_sort.ini";
  $n = 0;

  $fp = fopen($url, "r");
  if ($fp) {
    while (!feof($fp)) {
      $str = fgets($fp, 2048);
      if ($str[0] == "#") continue;
      $input = explode(",",$str);
      $sort[$n]   = $input[0];
      $wrn_id[$n] = $input[1];
      $n++;
    }
    fclose($fp);
  }

  // 3. SQL
  $sz = "
  select a.stn_id stn_id, stn_ko, stn_sp, lon, lat, ht, reg_up, wrn_id, wrn_ko, sfc_stn_id
  from (
    select stn_id, stn_ko, stn_sp, lon, lat, ht, fct_id
    from stn_aws
    where tm_ed >= to_date(:tm,'yyyymmddhh24mi') and tm_st < to_date(:tm,'yyyymmddhh24mi')
      --and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A')
      and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A','Y','X') --익산,서산 추가
			and stn_id not in (518) --강원북부산지-해안 제거_2022.02.09_양희선
  ) a, (
    select stn_id, reg_id wrn_id, sfc_stn_id
    from wrn_aws2_info2
    where tm_ed >= to_date(:tm,'yyyymmddhh24mi') and tm_st < to_date(:tm,'yyyymmddhh24mi')
  ) b, (
    select reg_id, reg_ko wrn_ko, reg_up
    from reg_wrn2
    where tm_ed > sysdate
      and reg_id like 'L%'
      and reg_up is not NULL
      and reg_up not like 'L1000000'
  ) c
  where b.stn_id = a.stn_id
    and b.wrn_id = c.reg_id
  order by stn_id
  ";
  if ($rp == 1) {
    $sz.="and b.stn_id = sfc_stn_id";
  }

  $stmt = odbc_prepare($dbconn, $sz);
  $exec = odbc_execute($stmt, array($tm, $tm, $tm, $tm));
  while ($rs = odbc_fetch_array($stmt)) {
    echo $rs[STN_ID].",";
    echo $rs[STN_KO].",";
    echo $rs[STN_SP].",";
    echo $rs[LON].",";
    echo $rs[LAT].",";
    echo $rs[HT].",";
    echo $rs[REG_UP].",";
    echo $rs[WRN_ID].",";
    echo $rs[WRN_KO].",";
    echo $rs[SFC_STN_ID].",";

    $k = array_search($rs[WRN_ID], $wrn_id);
    if ($k !== false) echo $sort[$k].",";
    else echo ",";

    echo "=\n";
  }
  odbc_close($dbconn);
}
// 최고.최저기온 조회
else if ($mode == "2") {

  if ($help == 1) {
    echo "###########################################################################\n";
    echo "#  [ 최고.최저기온 조회 ] \n";
    echo "#\n";
    echo "#  1. STN_ID        : AWS 지점번호\n";
    echo "#  2. STN_KO        : AWS 지점명\n";
    echo "#  3. WRN_ID        : 특보구역코드\n";
    echo "#  4. WRN_KO        : 특보구역명\n";
    echo "#  5. SFC_STN_ID    : 특보발표 대표지점번호\n";
    echo "#  6. WRN_SORT      : 특보구역 정렬(통보문 지점순)\n";
    echo "#  7. DATE          : 날짜\n";
    echo "#  8. TYPE          : 구분(OBS:관측, FCT:예측)\n";
    if ($var == "TMX") {
      echo "#  9. TMX           : 일 최고기온\n";
      echo "# 10. TMX_TM        : 일 최고기온 시각\n";
      echo "# 11. TCMX          : 일 최고 체감기온\n";
      echo "# 12. TCMX_TM       : 일 최고 체감기온 시각\n";
      echo "###########################################################################\n";
      echo "#STN_ID,STN_KO,WRN_ID,WRN_KO,SFC_STN_ID,WRN_SORT,DATE,TYPE,TMX,TMX_TM,TCMX,TCMX_TM,=\n";
    }
    else     if ($var == "TMN") {
      echo "#  9. TMN           : 아침 최저기온\n";
      echo "# 10. TMN_TM        : 아침 최저기온 시각\n";
      echo "###########################################################################\n";
      echo "#STN_ID,STN_KO,WRN_ID,WRN_KO,SFC_STN_ID,WRN_SORT,DATE,TYPE,TMN,TMN_TM,=\n";
    }
  }

  $url = "http://cht.kma.go.kr/lsp/wrn/wrn_chk_lib.php?mode=1";
  $stn_num = 0;

  $fp = fopen($url, "r");
  if ($fp) {
    while (!feof($fp)) {
      $str = fgets($fp, 2048);
      if ($str[0] == "#") continue;
      $input = explode(",",$str);
      $stn_id[$stn_num]     = $input[0];
      $stn_ko[$stn_num]     = $input[1];
      $reg_up[$stn_num]     = $input[6];
      $wrn_id[$stn_num]     = $input[7];
      $wrn_ko[$stn_num]     = $input[8];
      $sfc_stn_id[$stn_num] = $input[9];  //대표지점 번호
      $sort[$stn_num]       = $input[10]; //정렬 순서
      $stn_num++;
    }

    fclose($fp);
  }

  $fct_day_max = 4; //글피까지
  $tm1 = date("Ymd", time()-24*60*60-10*60);               //어제
  $tm2 = date("Ymd", time()-10*60);                        //오늘
  $tm3 = date("Ymd", time()+($fct_day_max-1)*60*60-10*60); //글피
  $nt1 = mktime(0,0,0,substr($tm1,4,2),substr($tm1,6,2),substr($tm1,0,4));
  $nt2 = mktime(0,0,0,substr($tm2,4,2),substr($tm2,6,2),substr($tm2,0,4));
  $nt3 = mktime(0,0,0,substr($tm3,4,2),substr($tm3,6,2),substr($tm3,0,4));

  stn_obs_data();
  for ($dn=0; $dn<$obs_day_max; $dn++) {
    $date_tm[$dn] = date("Ymd",$nt1+($dn)*24*60*60);
  }

  if ($var == "TMN") stn_mnnm_data();

  if ($step == "I") {
    $YY = substr($tmfc,0,4);
    $MM = substr($tmfc,4,2);
    $DD = substr($tmfc,6,2);
    $HH = substr($tmfc,8,2);

    if ($HH < 5) {
      $nt = mktime(9,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4)) - 24*60*60;
    }
    else if ($HH >= 17) {
      $nt = mktime(9,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4));
    }
    else {
      $nt = mktime(21,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4)) - 24*60*60;
    }
    $tmfc = date("YmdHi", $nt);
  }

  $url = "http://cht.kma.go.kr/cgi-bin/url/nph-dfs_shrt_grd_stn?interval=1&tmfc1=".$tmfc."&step=".$step."&stn=";
  for ($n=0; $n<count($stn_id); $n++) {
    //if (($var == "TMX" && $ta_max[$n][0] !== NULL) || ($var == "TMN" && $ta_min[$n][0] !== NULL)) {
    if (($var == "TMX" && ($ta_max[$n][0] !== NULL || $stn_id[$n] == $sfc_stn_id[$n])) || ($var == "TMN" && ($ta_min[$n][0] !== NULL || $stn_id[$n] == $sfc_stn_id[$n]))) {
      $url .= $stn_id[$n].":";
    }
  }

  stn_fct_data($url);

  for ($n=0; $n<count($stn_id); $n++) {
    //if ($fct_day_max > 0) {
    //  if ($var == "TMX" && $ta_max[$n][$obs_day_max+$fct_day_max-1] === NULL) continue;
    //  if ($var == "TMN" && $ta_min[$n][$obs_day_max+$fct_day_max-1] === NULL) continue;
    //}

    //if ($var == "TMX" && $ta_max[$n][0] === NULL) continue;
    //if ($var == "TMN" && $ta_min[$n][0] === NULL) continue;
    if ($var == "TMX" && $ta_max[$n][0] === NULL && $stn_id[$n] != $sfc_stn_id[$n]) continue;
    if ($var == "TMN" && $ta_min[$n][0] === NULL && $stn_id[$n] != $sfc_stn_id[$n]) continue;

    for ($dn=0; $dn<$obs_day_max+$fct_day_max; $dn++) {
    //for ($dn=0; $dn<$obs_day_max+4; $dn++) { //글피까지
      if ($dn >= $obs_day_max && $date_tm[$dn] === NULL) {
        $date = date("Ymd", $nt2 + ($dn-$obs_day_max)*24*60*60);
        //printf("%d,%s,%s,%s,%s,%d,%s,FCT,,,", $stn_id[$n], $stn_ko[$n], $reg_up[$n], $wrn_id[$n], $wrn_ko[$n], $sfc_stn_id[$n], $date);
        printf("%d,%s,%s,%s,%s,%d,%d,%s,FCT,,,", $stn_id[$n], $stn_ko[$n], $reg_up[$n], $wrn_id[$n], $wrn_ko[$n], $sfc_stn_id[$n], $sort[$n], $date);
        if ($var == "TMX") {
          echo ",,";
        }
        else if ($var == "TMN") {
          if ($ta_mnnm[$n][$dn] !== NULL) printf("%.1f,", $ta_mnnm[$n][$dn]);
          else echo ",";
        }
      }
      else {
        //printf("%d,%s,%s,%s,%s,%d,%s,", $stn_id[$n], $stn_ko[$n], $reg_up[$n], $wrn_id[$n], $wrn_ko[$n], $sfc_stn_id[$n], $date_tm[$dn]);
        printf("%d,%s,%s,%s,%s,%d,%d,%s,", $stn_id[$n], $stn_ko[$n], $reg_up[$n], $wrn_id[$n], $wrn_ko[$n], $sfc_stn_id[$n], $sort[$n], $date_tm[$dn]);
        if ($dn<$obs_day_max) echo "OBS,";
        else echo "FCT,";
 
        if ($var == "TMX") {
          if ($ta_max[$n][$dn] === NULL || $ta_max[$n][$dn] == -999.) echo ",";
          else printf("%.1f,", $ta_max[$n][$dn]);
          if ($ta_max_tm[$n][$dn] === NULL) echo ",";
          else printf("%04d,", $ta_max_tm[$n][$dn]);
          if ($tc_max[$n][$dn] === NULL || $tc_max[$n][$dn] == -999.) echo ",";
          else printf("%.1f,", $tc_max[$n][$dn]);
          if ($tc_max_tm[$n][$dn] === NULL) echo ",";
          else printf("%04d,", $tc_max_tm[$n][$dn]);
        }
        else if ($var == "TMN") {
          if ($ta_min[$n][$dn] === NULL || $ta_min[$n][$dn] == -999.) echo ",";
          else printf("%.1f,", $ta_min[$n][$dn]);
          if ($ta_min_tm[$n][$dn] === NULL) echo ",";
          else printf("%04d,", $ta_min_tm[$n][$dn]);
          if ($ta_mnnm[$n][$dn] !== NULL) printf("%.1f,", $ta_mnnm[$n][$dn]);
          else echo ",";
        }
      }
      echo "=\n";
    }
  }

  odbc_close($dbconn);
}
// 최신 예보파일 시각 조회
else if ($mode == "3") {

/*
  if ($step == "I") $itv = 12;
  else if ($step == "G") $itv = 3;

  $nt = time();
  $nt = intval($nt / ($itv * 60 * 60)) * $itv * 60 * 60;
  if ($step == "G") $nt -= 60 * 60;

  for ($k = 0; $k < 2; $k++) {
    if (file_check($nt, $step)) break;
    else $nt -= $itv * 60 * 60;
  }

  echo date("YmdHi",$nt);
*/

  if ($step == "I") {
    $YY = substr($tmfc,0,4);
    $MM = substr($tmfc,4,2);
    $DD = substr($tmfc,6,2);
    $HH = substr($tmfc,8,2);

    if ($HH < 5) {
      $nt = mktime(9,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4)) - 24*60*60;
    }
    else if ($HH >= 17) {
      $nt = mktime(9,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4));
    }
    else {
      $nt = mktime(21,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4)) - 24*60*60;
    }
  }
  else {
    $nt = mktime(substr($tmfc,8,2),0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4));
  }

  if (file_check($nt, $step) == 1) echo $fname;
  else echo "@no data";

  odbc_close($dbconn);
}
// 실효습도 조회
else if ($mode == "4") {

  if ($help == 1) {
    echo "###########################################################################\n";
    echo "#  [ 습도 조회 ] \n";
    echo "#\n";
    echo "#  1. STN_ID        : AWS 지점번호\n";
    echo "#  2. STN_KO        : AWS 지점명\n";
    echo "#  3. WRN_ID        : 특보구역코드\n";
    echo "#  4. WRN_KO        : 특보구역명\n";
    echo "#  5. SFC_STN_ID    : 특보발표 대표지점번호\n";
    echo "#  6. WRN_SORT      : 특보구역 정렬(통보문 지점순)\n";
    echo "#  7. DATE          : 날짜\n";
    echo "#  8. HM_AVG        : 일 평균 습도\n";
    echo "#  9. HM_MIN        : 일 최저 습도\n";
    echo "# 10. HM_EF         : 실효 습도\n";
    echo "###########################################################################\n";
    echo "#STN_ID,STN_KO,WRN_ID,WRN_KO,SFC_STN_ID,WRN_SORT,DATE,HM_AVG,HM_MIN,HM_EF,=\n";
  }

  $url = "http://cht.kma.go.kr/lsp/wrn/wrn_chk_lib.php?mode=1";
  $stn_num = 0;

  $fp = fopen($url, "r");
  if ($fp) {
    while (!feof($fp)) {
      $str = fgets($fp, 2048);
      if ($str[0] == "#") continue;
      $input = explode(",",$str);
      // 특성코드 습도 사용지점 판별
      if ($input[2][3] == "0") continue;
      $stn_id[$stn_num]     = $input[0];
      $stn_ko[$stn_num]     = $input[1];
      $reg_up[$stn_num]     = $input[6];
      $wrn_id[$stn_num]     = $input[7];
      $wrn_ko[$stn_num]     = $input[8];
      $sfc_stn_id[$stn_num] = $input[9];  //대표지점 번호
      $sort[$stn_num]       = $input[10]; //정렬 순서
      $stn_num++;
    }

    fclose($fp);
  }

  $fct_day_max = 4; //글피까지
  $tm1 = date("Ymd", time()-5*24*60*60-10*60);             //5일 전
  $tm2 = date("Ymd", time()-24*60*60-10*60);               //어제
  $tm3 = date("Ymd", time()-10*60);                        //오늘
  $tm4 = date("Ymd", time()+($fct_day_max-1)*24*60*60-10*60); //글피
  $nt1 = mktime(0,0,0,substr($tm1,4,2),substr($tm1,6,2),substr($tm1,0,4));
  $nt2 = mktime(0,0,0,substr($tm2,4,2),substr($tm2,6,2),substr($tm2,0,4));
  $nt3 = mktime(0,0,0,substr($tm3,4,2),substr($tm3,6,2),substr($tm3,0,4));
  $nt4 = mktime(0,0,0,substr($tm4,4,2),substr($tm4,6,2),substr($tm4,0,4));

  hm_obs_data();
  for ($dn=0; $dn<=$obs_day_max; $dn++) {
    $date_tm[$dn] = date("Ymd",$nt1+($dn)*24*60*60);
  }

  if ($step == "I") {
    $YY = substr($tmfc,0,4);
    $MM = substr($tmfc,4,2);
    $DD = substr($tmfc,6,2);
    $HH = substr($tmfc,8,2);

    if ($HH < 5) {
      $nt = mktime(9,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4)) - 24*60*60;
    }
    else if ($HH >= 17) {
      $nt = mktime(9,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4));
    }
    else {
      $nt = mktime(21,0,0,substr($tmfc,4,2),substr($tmfc,6,2),substr($tmfc,0,4)) - 24*60*60;
    }
    $tmfc = date("YmdHi", $nt);
  }

  $url = "http://cht.kma.go.kr/cgi-bin/url/nph-dfs_shrt_grd_stn?tmfc1=".$tmfc."&step=".$step."&vars=REH&&stn=";
  for ($n=0; $n<count($stn_id); $n++) {
    //if ($hm_avg[$n][0] !== NULL || $stn_id[$n] == $sfc_stn_id[$n]) {
    if ($hm_avg[$n][0] !== NULL) {
      $url .= $stn_id[$n].":";
    }
  }

  hm_fct_data($url);

  for ($n=0; $n<count($stn_id); $n++) {

    //if ($hm_avg[$n][0] === NULL || $hm_avg[$n][$obs_day_max+$fct_day_max-1] == -999.) continue;
    if (($hm_avg[$n][0] === NULL || $hm_avg[$n][$obs_day_max+$fct_day_max-1] == -999.) && $stn_id[$n] != $sfc_stn_id[$n]) continue;

    //for ($dn=0; $dn<$obs_day_max+$fct_day_max; $dn++) {
    for ($dn=$obs_day_max-1; $dn<$obs_day_max+$fct_day_max; $dn++) {
      //printf("%d,%s,%s,%s,%s,%d,%s,", $stn_id[$n], $stn_ko[$n], $reg_up[$n], $wrn_id[$n], $wrn_ko[$n], $sfc_stn_id[$n], $date_tm[$dn]);
      printf("%d,%s,%s,%s,%s,%d,%d,%s,", $stn_id[$n], $stn_ko[$n], $reg_up[$n], $wrn_id[$n], $wrn_ko[$n], $sfc_stn_id[$n], $sort[$n], $date_tm[$dn]);

      if ($hm_avg[$n][$dn] === NULL || $hm_avg[$n][$dn] == -999.) echo ",";
      else printf("%.1f,", $hm_avg[$n][$dn]);
      if ($hm_min[$n][$dn] === NULL || $hm_min[$n][$dn] == 0.) echo ",";
      else printf("%.1f,", $hm_min[$n][$dn]);
      if ($hm_eff[$n][$dn] === NULL || $hm_eff[$n][$dn] == -999.) echo ",";
      else printf("%.1f,", $hm_eff[$n][$dn]);
      echo "=\n";
    }
  }

  odbc_close($dbconn);
}



// 기온 관측 자료 조회
function stn_obs_data() {

  global $var;
  global $nt1, $nt2; //nt1: 시작일, nt2: 종료일
  global $dbconn;
  global $stn_id;
  global $ta_max, $ta_min, $ta_max_tm, $ta_min_tm, $tc_max, $tc_max_tm;
  global $obs_day_max;

  // 1. 시간설정
  if ($nt2 > time()-10*60) $nt2 = time() - 10*60; //종료일은 오늘까지만
  if ($nt1 > $nt2) $nt1 = mktime(0,0,0,date("m",$nt2),date("d",$nt2),date("Y",$nt2));

  $tm1 = date("Ymd",$nt1);
  $tm2 = date("Ymd",$nt2);
  $obs_day_max = intval(($nt2 - $nt1)/(24*60*60)) + 1;

  //echo "#".date("YmdH",$nt1)." ".date("YmdH",$nt2)."\n";

  // 2. AWS 통계값 읽기(어제)
  $dn = intval(($nt1 - $nt1)/(24*60*60));

  // 2.1 일최고기온 읽기 (폭염용)
  if ($var == "TMX") {
    // 2.1.1 쿼리문 작성 
    $sz1 = "
    select tm, aws_id, ta_max, ta_max_tm, tc_max, tc_max_tm
    from aws_day
    where 1=1
      and tm = TO_DATE(:tm1,'YYYY.MM.DD') 
    order by aws_id, tm
    ";

    $sz2 = "
    select stn_id, lon, lat, ht, stn_ko
    from stn_aws
    where 1=1
      and tm_ed >= TO_DATE(:tm1,'YYYY.MM.DD') 
      and tm_st < TO_DATE(:tm1,'YYYY.MM.DD') 
      --and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A')
      and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A','Y','X') --익산,서산 추가
    ";

    $sz = "
    select tm, aws_id, stn_ko, ta_max, ta_max_tm, tc_max, tc_max_tm
    from (".$sz1.") a, (".$sz2.") b
    where a.aws_id = b.stn_id
    order by aws_id, tm
    ";

    // 2.1.2 데이터 추출 및 배열에 입력
    $stmt = odbc_prepare($dbconn, $sz);
    $exec = odbc_execute($stmt, array($tm1,$tm1,$tm1));

    while ($rs = odbc_fetch_array($stmt)) {
      $n = array_search($rs[AWS_ID], $stn_id);
 
      if ($n !== false) {
        //$nt = mktime(0,0,0,substr($rs[TM],5,2),substr($rs[TM],8,2),substr($rs[TM],0,4));
        //$dn = intval(($nt - $nt1)/(24*60*60));

        $ta_max[$n][$dn]       = $rs[TA_MAX];
        $ta_min[$n][$dn]       = $rs[TA_MIN];

        $ta_max_tm[$n][$dn]    = $rs[TA_MAX_TM];
        $ta_min_tm[$n][$dn]    = $rs[TA_MIN_TM];

        //일최고체감온도 및 습도 표출 추가_2020.08.10_양희선
        $tc_max[$n][$dn]       = $rs[TC_MAX];  //체감온도
        $tc_max_tm[$n][$dn]    = $rs[TC_MAX_TM];  //체감온도 시간
      }
    }
  }
  // 2.2 아침최저기온 읽기 (한파용)
  else if ($var == "TMN") {
    // 2.2.1 쿼리문 작성 
    $sz1 = "
    select aws_id, to_char(tm,'HH24') hh, ta_min, ta_min_mi
    from (select tm, aws_id, ta_min, ta_min_mi, aws_id||'_'||ta_min as tmp_ta_min
         from aws_hr_ta
         where TM between to_date(:tm1,'YYYY.MM.DD HH24:MI') and to_date(:tm,'YYYY.MM.DD HH24:MI')
    )
    where TM between to_date(:tm1,'YYYY.MM.DD HH24:MI') and to_date(:tm,'YYYY.MM.DD HH24:MI')
    and ta_min is not null
    and tmp_ta_min in (
          select aws_id||'_'||min(ta_min) as tmp_ta_min
          from aws_hr_ta
          where TM between to_date(:tm1,'YYYY.MM.DD HH24:MI') and to_date(:tm,'YYYY.MM.DD HH24:MI')
          group by aws_id
    ) 
    order by aws_id  ";

    $sz2 = "
    select stn_id, lon, lat, ht, stn_ko
    from stn_aws
    where 1=1
      and tm_ed >= TO_DATE(:tm1,'YYYY.MM.DD') 
      and tm_st < TO_DATE(:tm1,'YYYY.MM.DD')
      --and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A')
      and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A','Y','X') --익산,서산 추가
    ";

    $sz = "
    select aws_id, hh, ta_min, ta_min_mi
    from (".$sz1.") a, (".$sz2.") b
      where a.aws_id = b.stn_id
      order by aws_id asc, hh desc
    ";
  
    // 2.2.2 데이터 추출 및 배열에 입력
    $nt = mktime(0,0,0,substr($tm1,4,2),substr($tm1,6,2),substr($tm1,0,4));
    $mn_st = date("YmdHi",$nt+3*60*60+1*60);
    $mn_ed = date("YmdHi",$nt+9*60*60);

    $stmt = odbc_prepare($dbconn, $sz);
    $exec = odbc_execute($stmt, array($mn_st, $mn_ed, $mn_st, $mn_ed, $mn_st, $mn_ed, $tm1, $tm1));

    while ($rs = odbc_fetch_array($stmt)) {
      $n = array_search($rs[AWS_ID], $stn_id);

      if ($n !== false) {
        $hh = $rs[HH]-1;
        $mi = 60+$rs[TA_MIN_MI];

        $ta_min[$n][$dn] = $rs[TA_MIN];
        $ta_min_tm[$n][$dn] = sprintf('%02d%02d',$hh,$mi);      
      }
    }
  }

  // 3. 실시간 AWS 기온 관측값 읽기(오늘)
  $dn = intval(($nt2 - $nt1)/(24*60*60));

  // 3.1 일최고기온 읽기 (폭염용)
  if ($var == "TMX") {
    $url = "http://cht.kma.go.kr/cgi-bin/url/nph-aws_sort?".date("YmdHi", time()-10*60+1*60)."_0_0_dtM_-500_9999_0_m"; //aws 일 극값은 24:00분까지 기록... 00:01분 부터 다음 날로 기록...

    if (($fp = fopen($url,"r")) !== FALSE) {

      while (($d = fgetcsv($fp, 500, ",")) !== FALSE) {     
        if ($d[0][0] == "#") continue;
        $n = array_search(intval(trim($d[0])), $stn_id);

        if ($n !== false) {
          $ta_max[$n][$dn]       = floatval(trim($d[8]));
          $ta_max_tm[$n][$dn]    = trim($d[9]);
                
          //체감온도 및 습도 표출 추가_2020.08.21_양희선
          $tc_max[$n][$dn]       = floatval(trim($d[21]));  //체감온도
          $tc_max_tm[$n][$dn]    = trim($d[22]);  //체감온도 시간
        }
      } // while (($d = fgetcsv($fp, 100, " ")) !== FALSE)

      fclose($fp);
    } //if (($fp = fopen($url,"r")) !== FALSE)
  }

  // 3.2 아침최저기온 읽기 (한파용)
  else if ($var == "TMN") {
    // 3.2.1 쿼리문 작성 
    $sz1 = "
    select aws_id, to_char(tm,'HH24') hh, ta_min, ta_min_mi
    from (select tm, aws_id, ta_min, ta_min_mi, aws_id||'_'||ta_min as tmp_ta_min
         from aws_hr_ta
         where TM between to_date(:tm1,'YYYY.MM.DD HH24:MI') and to_date(:tm,'YYYY.MM.DD HH24:MI')
    )
    where TM between to_date(:tm1,'YYYY.MM.DD HH24:MI') and to_date(:tm,'YYYY.MM.DD HH24:MI')
    and ta_min is not null
    and tmp_ta_min in (
          select aws_id||'_'||min(ta_min) as tmp_ta_min
          from aws_hr_ta
          where TM between to_date(:tm1,'YYYY.MM.DD HH24:MI') and to_date(:tm,'YYYY.MM.DD HH24:MI')
          group by aws_id
    ) 
    order by aws_id  ";

    $sz2 = "
    select stn_id, lon, lat, ht, stn_ko
    from stn_aws
    where 1=1
      and tm_ed >= TO_DATE(:tm1,'YYYY.MM.DD') 
      and tm_st < TO_DATE(:tm,'YYYY.MM.DD')+1 
      --and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A')
      and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A','Y','X') --익산,서산 추가
    ";

    $sz = "
    select aws_id, hh, ta_min, ta_min_mi
    from (".$sz1.") a, (".$sz2.") b
      where a.aws_id = b.stn_id
      order by aws_id asc, hh desc
    ";
  
    // 3.2.2 데이터 추출 및 배열에 입력
    $nt = mktime(0,0,0,substr($tm2,4,2),substr($tm2,6,2),substr($tm2,0,4));
    $mn_st = date("YmdHi",$nt+3*60*60+1*60);
    $mn_ed = date("YmdHi",$nt+9*60*60);

    $stmt = odbc_prepare($dbconn, $sz);
    $exec = odbc_execute($stmt, array($mn_st, $mn_ed, $mn_st, $mn_ed, $mn_st, $mn_ed, $tm2, $tm2));

    while ($rs = odbc_fetch_array($stmt)) {
      $n = array_search($rs[AWS_ID], $stn_id);

      if ($n !== false) {
        $hh = $rs[HH]-1;
        $mi = 60+$rs[TA_MIN_MI];

        $ta_min[$n][$dn] = $rs[TA_MIN];
        $ta_min_tm[$n][$dn] = sprintf('%02d%02d',$hh,$mi);      
      }
    }
  }

}

// 기온 예측 자료 조회
function stn_fct_data($url) {

  global $var;
  global $nt2; //오늘 날짜
  global $stn_id;
  global $ta_max, $ta_min, $ta_max_tm, $ta_min_tm, $tc_max, $tc_max_tm;
  global $obs_day_max, $fct_day_max, $date_tm;

  $nt_max = 0;

  $fp = fopen($url."&vars=".$var, "r");
  if ($fp) {
    while (!feof($fp)) {
      $str = fgets($fp, 2048);
      if ($str[0] == "#") continue;
      $input = explode(",",$str);
      if (floatval($input[8]) == -999.) continue;
      $n = array_search(intval($input[7]), $stn_id);
      if ($n !== false) {         
        $YY = intval(intval($input[1])/100000000);
        $MM = intval(intval($input[1])/1000000)%100;
        $DD = intval(intval($input[1])/10000)%100;

        $nt = mktime(0,0,0,$MM,$DD,$YY);
        $dn = intval(($nt - $nt2)/(24*60*60));
        if ($dn < 0 || $dn >= $fct_day_max) continue;
        if ($nt_max < $nt) $nt_max = $nt;
        $dn += $obs_day_max;
        if ($date_tm[$dn] === NULL) $date_tm[$dn] = sprintf("%02d%02d%02d", $YY, $MM, $DD);
        if ($var == "TMX") {
          $ta_max[$n][$dn] = floatval($input[8]);
        }
        else if ($var == "TMN") {
          $ta_min[$n][$dn] = floatval($input[8]);
        }
      }
    }

    fclose($fp);
  }

  if ($var == "TMX") {
    $fp = fopen($url."&vars=STX", "r");
    if ($fp) {
      while (!feof($fp)) {
        $str = fgets($fp, 2048);
        if ($str[0] == "#") continue;
        $input = explode(",",$str);
        if (floatval($input[8]) == -999.) continue;
        $n = array_search(intval($input[7]), $stn_id);
        if ($n !== false) {         
          $YY = intval(intval($input[1])/100000000);
          $MM = intval(intval($input[1])/1000000)%100;
          $DD = intval(intval($input[1])/10000)%100;

          $nt = mktime(0,0,0,$MM,$DD,$YY);
          $dn = intval(($nt - $nt2)/(24*60*60));
          if ($dn < 0 || $dn >= $fct_day_max) continue;
          if ($nt_max < $nt) $nt_max = $nt;
          $dn += $obs_day_max;
          if ($date_tm[$dn] === NULL) $date_tm[$dn] = sprintf("%02d%02d%02d", $YY, $MM, $DD);
          $tc_max[$n][$dn] = floatval($input[8]);
        }
      }

      fclose($fp);
    }   
  }

  //if ($nt_max > 0) $fct_day_max = intval(($nt_max - $nt2)/(24*60*60)) + 1;
  //else $fct_day_max = 0;
}

// 평년 최저기온 자료 조회
function stn_mnnm_data() {

  global $nt1, $nt3; //어제, 글피
  global $stn_id;
  global $dbconn;
  global $ta_mnnm;
  global $obs_day_max, $fct_day_max;

  $tm1 = date("Ymd",$nt1);
  $tm3 = date("Ymd",$nt3);

  // 쿼리문 작성 
  for ($dn = 0; $dn < $obs_day_max+$fct_day_max-1 ; $dn++) {

    $tm_mm = date("m",$nt1 + 24*60*60*$dn);
    $tm_dd = date("d",$nt1 + 24*60*60*$dn);

    // 신 기후평년값 조회하도록 변경함(tm_st: 2021)
    $sz1 = "
    select stn_id, mm, dd, ta_min
    from sfc_norm_day
    where 1=1
      and tm_st = 2021
      and mm = ".$tm_mm." 
      and dd = ".$tm_dd."
    order by stn_id
    ";

    $sz2 = "
    select stn_id, lon, lat, ht, stn_ko
    from stn_aws
    where 1=1
      and tm_ed >= TO_DATE(:tm1,'YYYY.MM.DD') 
      and tm_st < TO_DATE(:tm,'YYYY.MM.DD')+1 
      --and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A')
      and substr(stn_sp,1,1) in ('0','1','3','4','5','9','A','Y','X') --익산,서산 추가
    ";

    $sz = "
    select a.stn_id, mm, dd, ta_min
    from (".$sz1.") a, (".$sz2.") b
      where a.stn_id = b.stn_id
      order by stn_id
    ";

    // 데이터 추출 및 배열에 입력
    $stmt = odbc_prepare($dbconn, $sz);
    $exec = odbc_execute($stmt, array($tm1,$tm3));

    while ($rs = odbc_fetch_array($stmt)) {
      $n = array_search(intval($rs[STN_ID]), $stn_id);
      if ($n !== false) {
        if ($dn < $obs_day_max-1) {
          $ta_mnnm[$n][$dn] = $rs[TA_MIN];
        }
        else if ($dn == $obs_day_max-1) {
          $ta_mnnm[$n][$dn]   = $rs[TA_MIN];
          $ta_mnnm[$n][$dn+1] = $rs[TA_MIN];
        }
        else $ta_mnnm[$n][$dn+1] = $rs[TA_MIN];
      }
    }

  }

}


// 습도 관측 자료 조회
function hm_obs_data() {

  global $var;
  global $nt1, $nt2; //nt1: 시작일, nt2: 종료일
  global $dbconn;
  global $stn_id;
  global $hm_avg, $hm_min;
  global $obs_day_max;

  // 1. 시간설정
  $tm1 = date("Ymd",$nt1);
  $tm2 = date("Ymd",$nt2);
  $obs_day_max = intval(($nt2 - $nt1)/(24*60*60)) + 1;

  // 2. AWS 통계값 읽기
  // 2.1. 24회 관측자료를 활용한 일평균 습도 계산
  $sz1 = "
  select to_char(tm-1/24/60,'yyyymmdd') tm, aws_id, avg(hm) hm1, count(hm) num1, min(hm_min) hm_min
  from aws_hr_hm
  where tm between to_date(:tm,'yyyymmdd')+1/24 and to_date(:tm,'yyyymmdd')+1
    and hm > 0 ";
  $sz1 .= "group by to_char(tm-1/24/60,'yyyymmdd'), aws_id ";

  // 2.2. 8회 관측자료를 활용한 일평균 습도 계산
  $sz2 = "
  select to_char(tm-1/24/60,'yyyymmdd') tm, aws_id, avg(hm) hm2, count(hm) num2
  from aws_hr_hm
  where tm between to_date(:tm,'yyyymmdd')+1/24 and to_date(:tm,'yyyymmdd')+1
    and mod(to_number(to_char(tm,'hh24')),3) = 0 
    and hm > 0 ";
  $sz2 .= "group by to_char(tm-1/24/60,'yyyymmdd'), aws_id ";

  // 2.3. 해당되는 AWS 지점 정보 -- 2018.04.26 서산 지점 특성코드 변경분 반영(X)
	// 서청주(예)(181) 지점 추가_2022.05.06_양희선
  $sz3 = "
  select stn_id, lon, lat, ht, stn_ko
  from stn_aws
  where tm_ed > to_date(:tm,'yyyymmdd') and tm_st < to_date(:tm,'yyyymmdd')+1
    and (stn_sp like '0%' or stn_sp like '1%' or stn_sp like '2%' or stn_sp like '3%' or stn_sp like '4%' or stn_sp like 'A%' or stn_sp like 'X%' or stn_sp like 'Y%' or stn_id = 181) ";

  // 2.4. 실효습도 추출
  $sz = "
  select tm, aws_id, stn_ko, lon, lat, ht, hm_avg, hm_min
  from (
    select a.tm tm, a.aws_id aws_id, decode(num2,8,hm2,hm1) hm_avg, hm_min
    from (".$sz1.") a, (".$sz2.") b
    where b.aws_id = a.aws_id(+)
      and b.tm = a.tm(+)
  ) c, (".$sz3.") d
  where c.aws_id = d.stn_id
  order by aws_id, tm ";
  $stmt = odbc_prepare($dbconn, $sz);
  //echo $sz."\n";
  $exec = odbc_execute($stmt, array($tm1,$tm2,$tm1,$tm2,$tm1,$tm2));

  while ($rs = odbc_fetch_array($stmt)) {
    $n = array_search($rs[AWS_ID], $stn_id);
    if ($n !== false) {
      $nt_avg = mktime(0,0,0,substr($rs[TM],4,2),substr($rs[TM],6,2),substr($rs[TM],0,4));
      $dn = intval(($nt_avg - $nt1)/(24*60*60));
      $hm_avg[$n][$dn] = $rs[HM_AVG];
      $hm_min[$n][$dn] = $rs[HM_MIN];
    }
  }

}


// 습도 예측 자료 조회
function hm_fct_data($url) {

  global $var;
  global $nt3; //nt1: 시작일, nt2: 종료일
  global $dbconn;
  global $stn_id, $stn_ko;
  global $hm_avg, $hm_min, $hm_eff;
  global $obs_day_max, $fct_day_max, $date_tm;

  // 1. 시간설정
  $tm3 = date("Ymd",$nt3);
  $tm4 = date("Ymd",$nt3 + 24*60*60);
  //$fct_day_max = intval(($nt4 - $nt3)/(24*60*60)) + 1;

  // 2. AWS 통계값 읽기
  // 2.1. 24회 관측자료를 활용한 최소 습도 계산
  $sz1 = "
  select trunc(to_number(to_char(tm-1/24/60,'hh24'))/3)*3+3 hh, aws_id, min(hm_min) hm_min
  from aws_hr_hm
  where tm between to_date(:tm,'yyyymmdd')+1/24 and to_date(:tm,'yyyymmddhh24')
    and hm > 0 ";
  $sz1 .= "group by trunc(to_number(to_char(tm-1/24/60,'hh24'))/3)*3+3, aws_id ";

  // 2.2. 8회 관측자료를 활용한 습도
  $sz2 = "
  select decode(to_char(tm,'hh24'),'00','24',to_char(tm,'hh24')) hh, aws_id, hm
  from aws_hr_hm
  where tm between to_date(:tm,'yyyymmdd')+1/24 and to_date(:tm,'yyyymmddhh24')
    and mod(to_number(to_char(tm,'hh24')),3) = 0 
    and hm > 0 ";

  // 2.3. 해당되는 AWS 지점 정보 -- 2018.04.26 서산지점 특성코드 변경분 반영(X)
	// 서청주(예)(181) 지점 추가_2022.05.06_양희선
  $sz3 = "
  select stn_id, lon, lat, ht, stn_ko
  from stn_aws
  where tm_ed > to_date(:tm,'yyyymmddhh24') and tm_st < to_date(:tm,'yyyymmddhh24')
    and (stn_sp like '0%' or stn_sp like '1%' or stn_sp like '2%' or stn_sp like '3%' or stn_sp like '4%' or stn_sp like 'A%' or stn_sp like 'X%' or stn_sp like 'Y%' or stn_id = 181) ";

  // 2.4. 습도 추출
  $sz = "
  select hh, aws_id, stn_ko, lon, lat, ht, hm, hm_min
  from (
    select b.hh hh, b.aws_id aws_id, hm, hm_min
    from (".$sz1.") a, (".$sz2.") b
    where b.aws_id = a.aws_id(+)
      and b.hh = a.hh(+)
  ) c, (".$sz3.") d
  where c.aws_id = d.stn_id 
  order by aws_id, hh ";
  $stmt = odbc_prepare($dbconn, $sz);
  //echo $sz."\n";
  $exec = odbc_execute($stmt, array($tm3,$tm4,$tm3,$tm4,$tm3,$tm4));

  $hh_max = 0;

  while ($rs = odbc_fetch_array($stmt)) {
    $hh = intval($rs[HH]/3)-1;
    if ($hh > $hh_max) $hh_max = $hh;

    $n = array_search($rs[AWS_ID], $stn_id);
    if ($n !== false) {
      if ($rs[HM] > 0) $hm[$n][$hh] = $rs[HM];
      $hm_hh_min[$n][$hh] = $rs[HM_MIN];
    }
  }
  $hh_max_today = $hh_max;

  // 3. 예측 자료 조회
  //echo $url;
  $fp = fopen($url, "r");
  if ($fp) {
    while (!feof($fp)) {
      $str = fgets($fp, 2048);
      if ($str[0] == "#") continue;
      $input = explode(",",$str);
      if (floatval($input[8]) == -999.) continue;
      $n = array_search(intval(trim($input[7])), $stn_id);
      if ($n !== false) {         
        $nt = mktime(substr(trim($input[1]),8,2),0,0,substr(trim($input[1]),4,2),substr(trim($input[1]),6,2),substr(trim($input[1]),0,4));
        $dn = intval(($nt - $nt3)/(24*60*60));
        $hh = intval(($nt - $nt3)/(3*60*60)) - 1;
        if ($hh < 0 || intval($hh/8) >= $fct_day_max) continue;

        if ($hh > $hh_max) $hh_max = $hh;
        if ($hm[$n][$hh] === NULL) $hm[$n][$hh] = floatval($input[8]);

        $dn += $obs_day_max;
        if ($date_tm[$dn] === NULL) $date_tm[$dn] = date("Ymd", $nt);
      }
    }

    fclose($fp);
  }

  // 4. 지점별 일 평균습도 계산
  $fct_day_max = intval(($hh_max+1)/8);

  for ($n = 0; $n < count($stn_id); $n++) {
    // 초기화
    for ($dn = $obs_day_max; $dn < $fct_day_max + $obs_day_max; $dn++) {
      $hm_min[$n][$dn] = 0;
      $hm_avg[$n][$dn] = 0;
      $num_avg[$n][$dn] = 0;
      $hm_eff[$n][$dn] = 0;
    }

    // 최소습도 확인
    for ($k = 0; $k <= $hh_max_today; $k++) {
      if ($hm_hh_min[$n][$k] <= 0 || $hm_hh_min[$n][$k] === NULL) continue;
      $dn = intval($k/8);
      if ($dn > 0) break;
      $dn += $obs_day_max;
      if ($hm_min[$n][$dn] <= 0 || $hm_min[$n][$dn] > $hm_hh_min[$n][$k]) $hm_min[$n][$dn] = $hm_hh_min[$n][$k];
    }

    // 평균습도 계산 (예측의 경우, 최소습도도 계산)
    for ($k = 0; $k <= $hh_max; $k++) {
      if ($hm[$n][$k] <= 0 || $hm[$n][$k] === NULL) continue;
      $dn = intval($k/8);
      if ($dn >= $fct_day_max) break;
      $dn += $obs_day_max;
      $hm_avg[$n][$dn] += $hm[$n][$k];
      $num_avg[$n][$dn]++;
      if ($hm_min[$n][$dn] <= 0 || $hm_min[$n][$dn] > $hm[$n][$k]) $hm_min[$n][$dn] = $hm[$n][$k];
    }

    for ($dn = $obs_day_max; $dn < $fct_day_max + $obs_day_max; $dn++) {
      if ($num_avg[$n][$dn] == 8) {
        $hm_avg[$n][$dn] /= $num_avg[$n][$dn];
      }
      else {
        $hm_avg[$n][$dn] = -999.;
      }
    }

    //echo $stn_id[$n]." ".$stn_ko[$n]."\n";
    //print_r($hm[$n]);
  }


  // 실효습도 계산
  for ($n = 0; $n < count($stn_id); $n++) {
    for ($dn=$obs_day_max-1; $dn<$obs_day_max+$fct_day_max; $dn++) {
      for ($i = 0; $i < 5; $i++) {
        if ($hm_avg[$n][$dn-4+$i] > 0) {
          $hm_eff[$n][$dn] += pow(0.7,4-$i)*$hm_avg[$n][$dn-4+$i];
        }
        else {
          $hm_eff[$n][$dn] = -999.;
          break;
        }
      }
      if ($hm_eff[$n][$dn] > 0) $hm_eff[$n][$dn] *= 0.3;
    }
  }

  $fct_day_max = 4;

}


// 예보 자료 존재여부 체크
function file_check($tm, $step)
{
  global $fname;

  $tm = date("YmdHi",$tm-9*60*60);

  $YY          = substr($tm, 0, 4);
  $MM          = substr($tm, 4, 2);
  $DD          = substr($tm, 6, 2);
  $HH          = substr($tm, 8, 2);
  $MI          = substr($tm, 10, 2);

  if      ($step == "I")   $fname = "/C4N2_DATA/DFSD/SHRT/MERG/".$YY.$MM."/".$DD."/DFS_SHRT_GRD_BEST_MERG_TMX.".$YY.$MM.$DD.$HH.$MI;
  else if ($step == "G")   $fname = "/C4N2_DATA/DFSD/SHRT/GEMD/".$YY.$MM."/".$DD."/DFS_SHRT_GRD_GEMD_TMX.".$YY.$MM.$DD.$HH.$MI;

  //echo $fname."\n";

  if (file_exists($fname)) {
    return 1;
  }
  else {
    return 0;
  }
}

?>