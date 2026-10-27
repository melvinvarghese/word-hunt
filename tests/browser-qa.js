'use strict';
document.querySelector('#width').addEventListener('change',e=>document.querySelector('iframe').style.width=e.target.value+'px');
document.querySelector('#level').addEventListener('change',e=>document.querySelector('iframe').src='./fixture.html?level='+e.target.value);
