//--------------------------------------------------------

let map; // 맵 저장 변수
let marker; // 마커 임시 저장 변수
let lonlat; // 맵의 좌표 정보 저장
let lat; // 위도
let lon; // 경도

// 마커들
let markers_curruntLocation; // 현재위치 마커
let markers_startLocation; // 출발점
let markers_destination; // 도착점
let markers_waypoint = []; // 경유지
let markers_pet = []; // 반려동물 관련 마커
let markers_place = []; // 검색결과 마커들
let deletemarker;

// 경로 그리기에 필요한 변수들
let pMarkerArr = [];
let drawInfoArr = [];
let resultdrawArr = [];

// 폴리곤 그리기
let drawingObject = null;

// 사용자 라인
let line;


// 마커 클릭 시 주소를 보여줄 input text
const startpointText = document.querySelector('.startPointText');

const waypointtext1 = document.querySelector('.waypointText1');
const waypointtext2 = document.querySelector('.waypointText2');
const waypointtext3 = document.querySelector('.waypointText3');
const waypointtext4 = document.querySelector('.waypointText4');
const waypointtext5 = document.querySelector('.waypointText5');
let waypointTexts = [waypointtext1, waypointtext2, waypointtext3, waypointtext4, waypointtext5];

const waypoint1 = document.getElementById('waypoint1');
const waypoint2 = document.getElementById('waypoint2');
const waypoint3 = document.getElementById('waypoint3');
const waypoint4 = document.getElementById('waypoint4');
const waypoint5 = document.getElementById('waypoint5');
let waypoints = [waypoint1, waypoint2, waypoint3, waypoint4, waypoint5];

const deleteWaypoint1 = document.getElementById('delete_waypoint1');
const deleteWaypoint2 = document.getElementById('delete_waypoint2');
const deleteWaypoint3 = document.getElementById('delete_waypoint3');
const deleteWaypoint4 = document.getElementById('delete_waypoint4');
const deleteWaypoint5 = document.getElementById('delete_waypoint5');
let deleteWaypoints = [deleteWaypoint1, deleteWaypoint2, deleteWaypoint3, deleteWaypoint4, deleteWaypoint5];

const destinationText = document.querySelector('.destinationText');

const nowLocationText = document.querySelector('.nowLocation_text');

// 장소 검색에 활용할 값
let inputplace;
let place;
const searchBtn = document.querySelector('.map_searchbar_searchBtn');


// 지도생성 ---------------------------------------------------------

// 페이지가 로딩이 된 후 호출하는 함수입니다.
function initTmap(){
    // map 생성
    // Tmapv2.Map을 이용하여, 지도가 들어갈 div, 넓이, 높이를 설정합니다.
    map = new Tmapv2.Map("map_div", { // 지도가 생성될 div
        center : new Tmapv2.LatLng(35.1596124, 129.0601826), // Default좌표 : 혜도빌딩
        width : "64vw", // 지도의 넓이
        height : "90vh", // 지도의 높이
        zoom : 17,   
    });
    navigator.geolocation.getCurrentPosition(onGeoOkay, onGeoError);
}



// 마커그리기 --------------------------------------------------------


// 현재위치 아이콘 클릭하면 현재 위치로 이동
const moveToNowLocation = document.getElementById('tools_nowlocation');
moveToNowLocation.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(onGeoOkay, onGeoError);
}); 

// 시작점 마커
const starting_marker = document.getElementById('starting_marker');
starting_marker.addEventListener('click', () => {
    map.addListener("click", onClickStartMarker);
    makeMarkerMenu.classList.toggle('active');
});

// 경유지 마커
const waypoint_marker = document.getElementById('waypoint_marker');
waypoint_marker.addEventListener('click', () => {
    map.addListener("click", onClickWaypointMarker);
    makeMarkerMenu.classList.toggle('active');
});

// 도착지 마커
const destination_marker = document.getElementById('destination_marker');
destination_marker.addEventListener('click', () => {
    map.addListener("click", onClickDestinationMarker);
    makeMarkerMenu.classList.toggle('active');
});

searchBtn.addEventListener('click', () => {
    // removeMarkers(markers_place);
    inputplace = document.querySelector('.inputplace');
    place = inputplace.value;
    searchPOI(place);
})

//----------------------------------------------------------

// 사용자 라인 그리고 거리 및 시간 구하는 함수
const drawUserLine = document.getElementById('tools_draw_line');
drawUserLine.addEventListener("click", function(e) {
    line = new Tmapv2.extension.MeasureDistance({
        map: map
    });
});

// 폴리곤 그리기
const drawUserPolygon = document.getElementById('tools_draw_polygon');
drawUserPolygon.addEventListener("click", function(e) {
    drawPolygon();
})

//----------------------------------------------------------

const resetMap = document.getElementById('tools_reset');
resetMap.addEventListener('click', () => {
    if (markers_startLocation) {
        removeMarkers(markers_startLocation);
    }
    if (markers_destination) {
        removeMarkers(markers_destination);
    }
    if (markers_waypoint.length > 0) {
        for (let i = 0; i < markers_waypoint.length; i++) {
            resetWaypoint(markers_waypoint[i]);
        }
    }
    deleteLine();
    clearDrawing();
    map.destroy();
    initTmap();
    markers_curruntLocation.setMap(map);
    drawingObject = null;
});



//----------------------------------------------------------

// geolacation getCurrentPosition 호출 성공시
function onGeoOkay(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    lonlat = new Tmapv2.LatLng(lat, lon);
    map.setCenter(lonlat);
    map.setZoom(17);

    addCurrentMarkerAni(Tmapv2.MarkerOptions.ANIMATE_BOUNCE);
    reverseGeo(markers_curruntLocation, nowLocationText);
    getWeather();
}

// geolacation getCurrentPosition 호출 실패시
function onGeoError() {
    alert("현재의 위치를 찾을 수 없습니다. 위치 액세스를 허용해주세요.");
}


// 현재위치 마커를 추가하는 함수입니다.
function addCurrentMarkerAni(aniType) {
    lonlat = new Tmapv2.LatLng(lat, lon);
                
    let func = function() {
        //Marker 객체 생성.
        if(!markers_curruntLocation) {
            markers_curruntLocation = new Tmapv2.Marker({
                position: lonlat, //Marker의 중심좌표 설정.
                icon: "image/map/worker.png", //Marker의 아이콘.
                draggable: true, //Marker의 드래그 가능 여부.
                animation: aniType, //Marker 애니메이션.
                animationLength: 850, //애니메이션 길이.
                title: '현재위치', //Marker 타이틀.
                map: map //Marker가 표시될 Map 설정.
            });

            markers_curruntLocation.addListener('dragend', () => {
                reverseGeo(markers_curruntLocation, nowLocationText);
                getWeather();
            });
        } else {
            markers_curruntLocation.setPosition(lonlat);
        }
    }
    func();
}

// 모든 마커를 제거하는 함수입니다. 
function removeMarkers(marker) {
    if (marker == markers_startLocation || marker == markers_destination) {
        deleteLine();
    }
    if (marker) {
        marker.setMap(null);
        marker = '';
    }
}


// 클릭한 지점에 출발 마커 생성
function onClickStartMarker(e){

    removeMarkers(markers_startLocation); // 시작지점 마커가 이미 있다면 지움.
    
    // 클릭 위치의 좌표값 가져오기
    lonlat = e.latLng;

    //Marker 객체 생성.
    markers_startLocation = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(lonlat.lat(),lonlat.lng()), //Marker의 중심좌표 설정.
        map: map, //Marker가 표시될 Map 설정.
        icon: "image/map/start.png",
        iconSize: new Tmapv2.Size(30, 40),
        title: '드래그해서 이동',
        draggable : true
    });

    // 'dragend' 이벤트 핸들러 등록
    markers_startLocation.addListener('dragend', function(e) {
        findRoute();
    });

    // 닫기 버튼 생성
    markers_startLocation.addListener('mouseenter', function(e) {
        if (deletemarker == undefined) {
            deletemarker = new Tmapv2.Marker({
                position: new Tmapv2.LatLng(markers_startLocation.getPosition().lat() + 0.0003, markers_startLocation.getPosition().lng() + 0.0001),
                map: map,
                icon: "image/map/delete.png",
                iconSize: new Tmapv2.Size(10, 10),
                title: '마크 삭제'
            });

            deletemarker.addListener('click', function(e) {
                markers_startLocation.setMap(null);
                markers_startLocation = '';
                deletemarker = '';
                deleteLine();
            });
        }
    });

    markers_startLocation.addListener('mouseleave', function(e) {
        setTimeout(removeMarkers, 300, deletemarker);
        deletemarker = undefined;
    });

    map.removeListener('click', onClickStartMarker);
    findRoute();
}

// 클릭한 지점에 도착 마커 생성
function onClickDestinationMarker(e){

    removeMarkers(markers_destination); // 시작지점 마커가 이미 있다면 지움.
    
    lonlat = e.latLng;
    //Marker 객체 생성.
    markers_destination = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(lonlat.lat(),lonlat.lng()), //Marker의 중심좌표 설정.
        map: map, //Marker가 표시될 Map 설정.
        icon: "image/map/destination.png",
        iconSize: new Tmapv2.Size(30, 40),
        title: '드래그해서 이동',
        draggable : true
    });

    // 'dragend' 이벤트 핸들러 등록
    markers_destination.addListener('dragend', function(e) {
        findRoute();
    });

    // 닫기 버튼 생성
    markers_destination.addListener('mouseenter', function(e) {
        if (deletemarker == undefined) {
            deletemarker = new Tmapv2.Marker({
                position: new Tmapv2.LatLng(markers_destination.getPosition().lat() + 0.0003, markers_destination.getPosition().lng() + 0.0001),
                map: map,
                icon: "image/map/delete.png",
                iconSize: new Tmapv2.Size(10, 10),
                title: '마크 삭제'
            });

            deletemarker.addListener('click', function(e) {
                markers_destination.setMap(null);
                markers_destination = '';
                deletemarker = undefined;
                deleteLine();
            });
        }
    });

    markers_destination.addListener('mouseleave', function(e) {
        setTimeout(removeMarkers, 300, deletemarker);
        deletemarker = undefined;
    });
      
    map.removeListener('click', onClickDestinationMarker);
    findRoute();
}

// 클릭한 지점에 경유지 마커 생성
function onClickWaypointMarker(e){

    if (markers_waypoint.length < 5) {
        let number = markers_waypoint.length;
        markerImage = "image/map/waypoint" + (number + 1) + ".png";

        lonlat = e.latLng;
        //Marker 객체 생성.
        let waypointmarker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(lonlat.lat(),lonlat.lng()), //Marker의 중심좌표 설정.
            map: map, //Marker가 표시될 Map 설정.
            icon: markerImage,
            iconSize: new Tmapv2.Size(30, 40),
            title: '드래그해서 이동',
            draggable : true
        });

    // 'dragend' 이벤트 핸들러 등록
    waypointmarker.addListener('dragend', function(e) {
        findRoute();
    });

    // 닫기 버튼 생성
    waypointmarker.addListener('mouseenter', function(e) {
        if (deletemarker == undefined) {
            deletemarker = new Tmapv2.Marker({
                position: new Tmapv2.LatLng(waypointmarker.getPosition().lat() + 0.0003, waypointmarker.getPosition().lng() + 0.0001),
                map: map,
                icon: "image/map/delete.png",
                iconSize: new Tmapv2.Size(10, 10),
                title: '마크 삭제'
            });

            deletemarker.addListener('click', function(e) {
                resetWaypoint(waypointmarker);
                deletemarker = undefined;
            });
        }
    });

    waypointmarker.addListener('mouseleave', function(e) {
        setTimeout(removeMarkers, 300, deletemarker);
        deletemarker = undefined;
    });

        markers_waypoint.push(waypointmarker);
        findRoute();
        waypoints[number].classList.toggle('active');
    } else {
        alert('경유지는 5개까지 설정 가능합니다.');
    }
    map.removeListener('click', onClickWaypointMarker);
}

function resetWaypoint(waymarker) {
    let index = markers_waypoint.indexOf(waymarker);
    markers_waypoint[index].setMap(null);
    markers_waypoint.splice(index, 1);
    
    let tempPosition = [];

    for (let i = 0; i < 5; i++) {
        if (markers_waypoint[i]) {
            tempPosition.push(markers_waypoint[i].getPosition());
            markers_waypoint[i].setMap(null);
        }
    }

    console.log(tempPosition)

    markers_waypoint = [];

    for (let i = 0; i < tempPosition.length; i++) {
        let tempImage = "image/map/waypoint" + (i + 1) + ".png";
        markers_waypoint[i] = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(tempPosition[i].lat(), tempPosition[i].lng()), //Marker의 중심좌표 설정.
            map: map, //Marker가 표시될 Map 설정.
            icon: tempImage,
            iconSize: new Tmapv2.Size(30, 40),
            draggable : true
        });

    // 'dragend' 이벤트 핸들러 등록
    markers_waypoint[i].addListener('dragend', function(e) {
        findRoute();
    });

    // 닫기 버튼 생성
    markers_waypoint[i].addListener('mouseenter', function(e) {
        if (deletemarker == undefined) {
            deletemarker = new Tmapv2.Marker({
                position: new Tmapv2.LatLng(markers_waypoint[i].getPosition().lat() + 0.0003, markers_waypoint[i].getPosition().lng() + 0.0001),
                map: map,
                icon: "image/map/delete.png",
                iconSize: new Tmapv2.Size(10, 10),
                title: '마크 삭제'
            });

            deletemarker.addListener('click', function(e) {
                resetWaypoint(markers_waypoint[i]);
                deletemarker = undefined;
            });
        }
    });

    markers_waypoint[i].addListener('mouseleave', function(e) {
        setTimeout(removeMarkers, 300, deletemarker);
        deletemarker = undefined;
    });
    }
    tempPosition = [];
    findRoute();
}

// 클릭한 지점에 마커 생성
function onClickRoute(e){   
    lonlat = e.latLng;
    //Marker 객체 생성.
    marker = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(lonlat.lat(),lonlat.lng()), //Marker의 중심좌표 설정.
        map: map, //Marker가 표시될 Map 설정.
        icon: markerImage,
        iconSize: new Tmapv2.Size(30, 40),
        draggable : true
    });
      
    // markers.push(marker);
    map.removeListener('click', onClickRoute);
}

// -------------------------------------------------------------------------------------

// 경로탐색 API 사용요청    

function findRoute() {
    placeList();
    if (markers_startLocation && markers_destination) {
        var headers = {}; 
        headers["appKey"]="n2IwI2iBAAaPo1CrlNRhm97bE9BUPkzy5C7L9K9C";

        let passList ="";

        if (markers_waypoint.length > 0) {
            passList = passList + markers_waypoint[0].getPosition().lng() + ", " + markers_waypoint[0].getPosition().lat();
            for (let i = 1; i < markers_waypoint.length; i++) {
                passList = passList + "_" + markers_waypoint[i].getPosition().lng() + ", " + markers_waypoint[i].getPosition().lat();
            }
        }

        $.ajax({
            method : "POST",
            headers : headers,
            url : "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json&callback=result",
            async : false,
            data : {
                "startX" : markers_startLocation.getPosition().lng(),
                "startY" : markers_startLocation.getPosition().lat(),
                "endX" : markers_destination.getPosition().lng(),
                "endY" : markers_destination.getPosition().lat(),
                "passList" : passList,
                "serchOption" : 0,
                "reqCoordType" : "WGS84GEO",
                "resCoordType" : "EPSG3857",
                "startName" : "출발지",
                "endName" : "도착지"
            },    
            success : function(response) {
                var resultData = response.features;

                //결과 출력
                var tDistance = "총 거리 : "
                        + ((resultData[0].properties.totalDistance) / 1000)
                                .toFixed(1) + "km,";
                var tTime = " 총 시간 : "
                        + ((resultData[0].properties.totalTime) / 60)
                                .toFixed(0) + "분";

                $("#result").text(tDistance + tTime);
                
                deleteLine();

                for ( var i in resultData) { //for문 [S]
                    var geometry = resultData[i].geometry;
                    var properties = resultData[i].properties;
                    var polyline_;


                    if (geometry.type == "LineString") {
                        for ( var j in geometry.coordinates) {
                            // 경로들의 결과값(구간)들을 포인트 객체로 변환 
                            var latlng = new Tmapv2.Point(
                                    geometry.coordinates[j][0],
                                    geometry.coordinates[j][1]);
                            // 포인트 객체를 받아 좌표값으로 변환
                            var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
                                    latlng);
                            // 포인트객체의 정보로 좌표값 변환 객체로 저장
                            var convertChange = new Tmapv2.LatLng(
                                    convertPoint._lat,
                                    convertPoint._lng);
                            // 배열에 담기
                            drawInfoArr.push(convertChange);
                        }
                    } else {
                        var markerImg = "";
                        var pType = "";
                        var size;

                        if (properties.pointType == "S") { //출발지 마커
                            markerImg = "iamge/map/start.png";
                            pType = "S";
                            size = new Tmapv2.Size(30, 40);
                        } else if (properties.pointType == "E") { //도착지 마커
                            markerImg = "iamge/map/destination.png";
                            pType = "E";
                            size = new Tmapv2.Size(30, 40);
                        } else { //각 포인트 마커
                            markerImg = "http://topopen.tmap.co.kr/imgs/point.png";
                            pType = "P";
                            size = new Tmapv2.Size(4, 4);
                        }

                        // 경로들의 결과값들을 포인트 객체로 변환 
                        var latlon = new Tmapv2.Point(
                                geometry.coordinates[0],
                                geometry.coordinates[1]);

                        // 포인트 객체를 받아 좌표값으로 다시 변환
                        var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
                                latlon);

                        var routeInfoObj = {
                            markerImage : markerImg,
                            lng : convertPoint._lng,
                            lat : convertPoint._lat,
                            pointType : pType
                        };

                        // Marker 추가
                        marker_p = new Tmapv2.Marker(
                                {
                                    position : new Tmapv2.LatLng(
                                            routeInfoObj.lat,
                                            routeInfoObj.lng),
                                    icon : routeInfoObj.markerImage,
                                    iconSize : size,
                                    map : map
                                });
                        pMarkerArr.push(marker_p);        
                    }
                }//for문 [E]
                drawLine(drawInfoArr);
            },
            error : function(request, status, error) {
                console.log("code:" + request.status + "\n"
                        + "message:" + request.responseText + "\n"
                        + "error:" + error);
            }
        });
    } else {
        deleteLine();
    }
}


function addComma(num) {
var regexp = /\B(?=(\d{3})+(?!\d))/g;
return num.toString().replace(regexp, ',');
}

function drawLine(arrPoint) {
    var polyline_;

    polyline_ = new Tmapv2.Polyline({
    path : arrPoint,
    direction : true,
    strokeColor : "#3399ff",
    strokeWeight : 5,
    directionColor: "black", 
    map : map
    });
    resultdrawArr.push(polyline_);
}

function deleteLine() {
    if (resultdrawArr.length > 0) {
        for ( var i in resultdrawArr) {
            resultdrawArr[i]
                    .setMap(null);
        }
        resultdrawArr = [];
    }    
    drawInfoArr = [];

    for (let i = 0; i < pMarkerArr.length; i++) {
        pMarkerArr[i].setMap(null);
    }
    pMarkerArr = [];
}

//--------------------------------------------------------

// 좌표를 주소로 변환하는 함수
function reverseGeo(marker, inputbox) {
    var headers = {}; 
    headers["appKey"]="n2IwI2iBAAaPo1CrlNRhm97bE9BUPkzy5C7L9K9C";
    
    $.ajax({
            method : "GET",
            headers : headers,
            url : "https://apis.openapi.sk.com/tmap/geo/reversegeocoding?version=1&format=json&callback=result",
            async : false,
            data : {
                "coordType" : "WGS84GEO",
                "addressType" : "A10",
                "lon" : marker.getPosition().lng(),
                "lat" : marker.getPosition().lat()
            },
            success : function(response) {
                // 3. json에서 주소 파싱
                var arrResult = response.addressInfo;

                //법정동 마지막 문자 
                var lastLegal = arrResult.legalDong
                        .charAt(arrResult.legalDong.length - 1);

                // 새주소
                newRoadAddr = arrResult.city_do + ' '
                        + arrResult.gu_gun + ' ';

                if (arrResult.eup_myun == ''
                        && (lastLegal == "읍" || lastLegal == "면")) {//읍면
                    newRoadAddr += arrResult.legalDong;
                } else {
                    newRoadAddr += arrResult.eup_myun;
                }
                newRoadAddr += ' ' + arrResult.roadName + ' '
                        + arrResult.buildingIndex;

                // 새주소 법정동& 건물명 체크
                if (arrResult.legalDong != ''
                        && (lastLegal != "읍" && lastLegal != "면")) {//법정동과 읍면이 같은 경우

                    if (arrResult.buildingName != '') {//빌딩명 존재하는 경우
                        newRoadAddr += (' (' + arrResult.legalDong
                                + ', ' + arrResult.buildingName + ') ');
                    } else {
                        newRoadAddr += (' (' + arrResult.legalDong + ')');
                    }
                } else if (arrResult.buildingName != '') {//빌딩명만 존재하는 경우
                    newRoadAddr += (' (' + arrResult.buildingName + ') ');
                }

                result = newRoadAddr;
                inputbox.value = result;
                inputbox.innerHTML = result;
            },
            error : function(request, status, error) {
                console.log("code:" + request.status + "\n"
                        + "message:" + request.responseText + "\n"
                        + "error:" + error);
            }
        });

}


//---------------------------------------------------------------------------------
//마커의 옵션을 설정해주는 함수입니다.
function addMarker(lonlatoption){
    // 마커 생성
    var placemarker = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(lonlatoption.lonlat.latitude(),lonlatoption.lonlat.longitude()), //Marker의 중심좌표 설정.
        map: map, //Marker가 표시될 Map 설정..
        title : lonlatoption.title //마우스 위치시 출력할 타이틀
    });

    markers_place.push(placemarker);
}

//특정 장소를 검색하는 함수입니다.
function searchPOI(place) {
    var center = map.getCenter();//map의 중심 좌표 값을 받아 옵니다.
    var optionObj = {
        reqCoordType:"WGS84GEO", //요청 좌표계 옵셥 설정입니다.
        resCoordType:"WGS84GEO",  //응답 좌표계 옵셥 설정입니다.
        centerLon:map.getCenter().lng(),  //POI검색시 중앙좌표의 경도입니다.
        centerLat:map.getCenter().lat()  //POI검색시 중앙좌표의 위도입니다.
    };
    var params = {
        onComplete:onComplete,
        onProgress:onProgress,
        onError:onError
    };
    var tData = new Tmapv2.extension.TData();
    tData.getPOIDataFromSearchJson(encodeURIComponent(place),optionObj,params);//encodeURIComponent함수로 해당 파라메터 값을 처리합니다.
}

//POI검색
function onComplete() {
    
    console.log(this._responseData); //json로 데이터를 받은 정보들을 콘솔창에서 확인할 수 있습니다.
    
    if(this._responseData.searchPoiInfo.pois.poi != ''){
        jQuery(this._responseData.searchPoiInfo.pois.poi).each(function(){//결과를 each문으로 돌려 마커를 등록합니다.
            //response 데이터중 원하는 값을 find 함수로 찾습니다.
            var name = this.name;
            var id = this.id;
            var lon = this.frontLon;
            var lat = this.frontLat;
            var lonlatoption = {
                title : name,//마커 라벨 text 설정
                lonlat:new Tmapv2.LatLng(lat,lon)//마커 라벨 좌표 설정
            };
            addMarker(lonlatoption);//마커를 추가하는 함수입니다.
        });
    }else {
        alert('검색결과가 없습니다.');
    }
    map.setZoom(15);
}

//데이터 로드중 실행하는 함수입니다.
function onProgress(){
        
}

//데이터 로드 중 에러가 발생시 실행하는 함수입니다.
function onError(){
    alert("onError");
}

    //-------------------------------------------------------------
function getDrawingObject() {
    if (drawingObject == null) {
        // 도형을 그리는 객체 생성
        drawingObject = new Tmapv2.extension.Drawing(
            {
                map: map, // 지도 객체
                strokeWeight: 2, // 테두리 두께
                strokeColor:"green", // 테두리 색상
                strokeOpacity:0.5, // 테두리 투명도
                fillColor:"green", // 도형 내부 색상
                fillOpacity:0.1 // 도형 내부 투명도
            }
        );
    }
    // 객체 반환
    return drawingObject;
}

function drawPolygon() {
    // 도형 객체의 폴리곤을 그리는 함수
    getDrawingObject().drawPolygon();
}

function clearDrawing() {
    // 도형 객체의 도형을 삭제하는 함수
    getDrawingObject().clear();
}

function placeList() {
    if (markers_startLocation) {
        reverseGeo(markers_startLocation, startpointText);
    }
    if (markers_waypoint.length > 0) {
        for (let i = 0; i < markers_waypoint.length; i++) {
            reverseGeo(markers_waypoint[i], waypointTexts[i]);
        }
    }
    if (markers_destination) {
        reverseGeo(markers_destination, destinationText);
    }
}

// ----------------------------------------------------------------
for (let i = 0; i < 5; i++) {
    deleteWaypoints[i].addEventListener('click', () => {
        if (markers_waypoint[i]) {
            resetWaypoint(markers_waypoint[i]);
            waypoints[i].classList.toggle('active');
        }
    });
}

$( function() {
    // 드래그 앤 드롭 기능 추가
    $( ".search_box" ).sortable({
    // 순서가 변경될 때마다 실행할 함수 지정
    update: function(event, ui) {
        console.log("순서가 변경되었습니다.");
    },
    // 드래그 대상에서 출발지와 도착지 제외
    items: "> div:not(:first-child):not(:last-child)"
    
    });
    $( ".search_box" ).disableSelection();
} );


// ----------------------------------------------------------------------
// 날씨 api - fontawesome 아이콘
var weatherIcon = {
    '01' : 'fas fa-sun',
    '02' : 'fas fa-cloud-sun',
    '03' : 'fas fa-cloud',
    '04' : 'fas fa-cloud-meatball',
    '09' : 'fas fa-cloud-sun-rain',
    '10' : 'fas fa-cloud-showers-heavy',
    '11' : 'fas fa-poo-storm',
    '13' : 'far fa-snowflake',
    '50' : 'fas fa-smog'
};

// 날씨 api - 서울
function getWeather() {
    let lon = markers_curruntLocation.getPosition().lng();
    let lat = markers_curruntLocation.getPosition().lat();

    var apiURI = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=426f011a3ed58caf2ac30b91272ce6ba&lang=kr";
    $.ajax({
        url: apiURI,
        dataType: "json",
        type: "GET",
        async: "false",
        success: function(resp) {
            $('.weather_icon').empty();
            $('.weather_description').empty();
            $('.current_temp').empty();
            $('.humidity').empty();
            $('.wind').empty();
            $('.city').empty();
            $('.cloud').empty();
            $('.temp_min').empty();
            $('.temp_max').empty();

            console.log(resp)

            var $Icon = (resp.weather[0].icon).substr(0,2);
            var $weather_description = resp.weather[0].main;
            var $Temp = Math.floor(resp.main.temp- 273.15) + 'º';
            var $humidity = '습도&nbsp;&nbsp;&nbsp;&nbsp;' + resp.main.humidity+ ' %';
            var $wind = '바람&nbsp;&nbsp;&nbsp;&nbsp;' +resp.wind.speed + ' m/s';
            var $city = resp.name;
            var $cloud = '구름&nbsp;&nbsp;&nbsp;&nbsp;' + resp.clouds.all +"%";
            var $temp_min = '최저 온도&nbsp;&nbsp;&nbsp;&nbsp;' + Math.floor(resp.main.temp_min- 273.15) + 'º';
            var $temp_max = '최고 온도&nbsp;&nbsp;&nbsp;&nbsp;' + Math.floor(resp.main.temp_max- 273.15) + 'º';
               
            $('.weather_icon').append('<i class="' + weatherIcon[$Icon] +' fa-2x" style="height : 40px; width : 50px;"></i>');
            $('.weather_description').prepend($weather_description);
            $('.current_temp').prepend($Temp);
            $('.humidity').prepend($humidity);
            $('.wind').prepend($wind);
            $('.city').append($city);
            $('.cloud').append($cloud);
            $('.temp_min').append($temp_min);
            $('.temp_max').append($temp_max);               
        }
    })
}
