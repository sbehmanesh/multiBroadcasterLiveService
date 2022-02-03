function showComments(){
  element = document.querySelector('.right_menu');
  element.classList.remove('none');
  element.classList.add('block');
  window.setTimeout(function(){
    element.classList.add('active');
  },10);
}

function closeComments(){
  element = document.querySelector('.right_menu');
  element.classList.remove('active');  
  window.setTimeout(function(){
    element.classList.remove('block');  
    element.classList.add('none');  
  },10);
}

document.querySelector('.menu').addEventListener('click',showComments);
document.querySelector('.close-menu').addEventListener('click',closeComments);


var all_functional_btns = document.querySelectorAll('div.btn');

for (let el of all_functional_btns) {
  el.addEventListener("click", (e) => {
    var pos_class = el.getAttribute('data-positive');
    var neg_class = el.getAttribute('data-negetive');
    if(el.classList.contains('active')){
      el.classList.remove('active');
      el.children[0].classList.remove(neg_class);
      el.children[0].classList.add(pos_class);
    }else{
      el.classList.add('active');
      el.children[0].classList.remove(pos_class);
      el.children[0].classList.add(neg_class);
    }
  })
}

document.querySelector('#end-live').addEventListener('click',function(){
  window.location.href = 'https://www.whitecells.net'
});