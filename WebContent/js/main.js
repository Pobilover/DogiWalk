const showMap = document.querySelector('.map_diary');
const map = parent.document.querySelector('.map');

showMap.addEventListener('click', () => {
    console.log('뀨')
    map.classList.toggle('active');
});