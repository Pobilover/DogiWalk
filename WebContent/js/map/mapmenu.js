const makeMarkerBtn = document.getElementById('tools_marker');
const makeMarkerMenu = document.querySelector('.map_showMap_side_marker')
makeMarkerBtn.addEventListener('click', () => {
    makeMarkerMenu.classList.toggle('active');
});

const petmakeMarkerBtn = document.getElementById('tools_pet_marker');
const petmakeMarkerMenu = document.querySelector('.map_showMap_side_petmarker')
petmakeMarkerBtn.addEventListener('click', () => {
    petmakeMarkerMenu.classList.toggle('active');
});

const directions_search = document.getElementById("btn_menu");
const popupwindow = document.querySelector(".map_searchbar");
directions_search.addEventListener('click', () => {
    popupwindow.classList.toggle('active');
    directions_search.classList.toggle('active');
    
});