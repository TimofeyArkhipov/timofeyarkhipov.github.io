
/* Please, don't do shit-code  */
Element.prototype.closest || (Element.prototype.closest = function(t) { for (var e = this; e;) { if (e.matches(t)) return e;e = e.parentElement } return null });

Element.prototype.matches || (Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector);

Object.assign || Object.defineProperty(Object, "assign", { enumerable: !1, configurable: !0, writable: !0, value: function(e) { "use strict"; if (null == e) throw new TypeError("Cannot convert first argument to object"); for (var t = Object(e), n = 1; n < arguments.length; n++) { var o = arguments[n]; if (null != o) for (var a = Object.keys(Object(o)), c = 0, b = a.length; c < b; c++) { var i = a[c], l = Object.getOwnPropertyDescriptor(o, i); void 0 !== l && l.enumerable && (t[i] = o[i]) } } return t } });

window.NodeList && !NodeList.prototype.forEach && (NodeList.prototype.forEach = Array.prototype.forEach);

function $$(e, o, t) { "function" != typeof o ? o = o || document : (t = o, o = document); var c = o.querySelectorAll(e); return c = Array.prototype.slice.call(o.querySelectorAll(e)), "function" == typeof t && c.forEach(function(e, o, c) { t(e, o, c) }), c }

function addCss(r, s) { var a = function(r) { Object.assign(r.style, s) }; if (Array.isArray(r))
        for (var n = r.length - 1; n >= 0; n--) a(r[n]);
    else a(r) }







'use strict'

// function parallax() {
//     let elements = document.querySelectorAll('.mousemove');
//     let width = window.innerWidth;


//     document.addEventListener('mousemove', (e)=>{
//             let speed0 = elements[0].getAttribute('data');
//             let x0 = (window.innerWidth - e.pageX*speed0)/400;
//             let y0 = (window.innerWidth - e.pageY*speed0)/1000;

//             let speed1 = elements[1].getAttribute('data');
//             let x1 = (window.innerWidth - e.pageX*speed1)/400;
//             let y1 = (window.innerWidth - e.pageY*speed1)/1000;

//             elements[0].style.transform = `translateX(${x0}px)`;
//             elements[1].style.transform = `translateX(${x1}px)`;
       
//     });
    

// }

// parallax();

let popup = document.querySelector('.video-block__popup');

document.addEventListener('click', (e) => {
  // console.log(e.target)
  let popup = document.querySelector('.video-block__popup')

  if (popup.classList.contains('open')) {
      if (e.target != document.querySelector('.video-block__popup_iframe')) {
          popup.classList.remove('open')
          document.querySelectorAll('iframe').forEach(i => {
              const source = i.src
              i.src = ''
              i.src = source
          })
      }
  } else {
      if (e.target == document.querySelector('.video-block__play img')) {
          document.querySelector('.video-block__popup').classList.add('open')
          popup = document.querySelector('.video-block__popup')
      }
  }

})




window.onload = ()=>{
  document.querySelector('.fire-wrap1').innerHTML=`<div id="sparks1"></div>`;
  document.querySelector('.fire-wrap2').innerHTML=`<div id="sparks2"></div>`;
  
  particlesJS("sparks1", {
    "particles":{
      "number":{
        "value":800,
        "density":{
          "enable":true,
          "value_area":10000
        }
      },
      "color":{
        "value":"#fd7907"
      },
      "shape":{
        "type":"circle",
        "stroke":{
          "width":0,
          "color":"#000000"
        },
        "polygon":{
          "nb_sides":3
        },
        "image":{
          "src":"img/github.svg",
          "width":100,
          "height":100
        }
      },
      "opacity":{
        "value":0.8,
        "random":true,
        "anim":{
          "enable":false,
          "speed":1,
          "opacity_min":0.1,
          "sync":false
        }
      },
      "size":{
        "value":4,
        "random":true,
        "anim":{
          "enable":true,
          "speed":5,
          "size_min":0.01,
          "sync":false
        }
      },
      "line_linked":{
        "enable":false,
        "distance":5000,
        "color":"#ffffff",
        "opacity":0.4,
        "width":1
      },
      "move":{
        "enable":true,
        "speed":2.8,
        "direction":"top",
        "random":true,
        "straight":false,
        "out_mode":"out",
        "bounce":false,
        "attract":{
          "enable":false,
          "rotateX":600,
          "rotateY":1200
        }
      }
    },"interactivity":{
      "detect_on":"canvas",
      "events":{
        "onhover":{
          "enable":false,
          "mode":"bubble"
        },
        "onclick":{
          "enable":false,
          "mode":"repulse"
        },
        "resize":true
      },
      "modes":{
        "grab":{
          "distance":400,
          "line_linked":{
            "opacity":0.5
          }
        },
        "bubble":{
          "distance":400,
          "size":10,
          "duration":0.3,
          "opacity":1,
          "speed":3
        },
        "repulse":{
          "distance":500,
          "duration":0.4
        },
        "push":{
          "particles_nb":4
        },
        "remove":{
          "particles_nb":2
        }
      }
    },
    "retina_detect":true
  });
  
  
  
  
  
  
  
  
  particlesJS("sparks2", {
  "particles":{
    "number":{
      "value":800,
      "density":{
        "enable":true,
        "value_area":4000
      }
    },
    "color":{
      "value":"#fd7907"
    },
    "shape":{
      "type":"circle",
      "stroke":{
        "width":0,
        "color":"#000000"
      },
      "polygon":{
        "nb_sides":3
      },
      "image":{
        "src":"img/github.svg",
        "width":100,
        "height":100
      }
    },
    "opacity":{
      "value":0.8,
      "random":true,
      "anim":{
        "enable":false,
        "speed":1,
        "opacity_min":0.1,
        "sync":false
      }
    },
    "size":{
      "value":4,
      "random":true,
      "anim":{
        "enable":true,
        "speed":5,
        "size_min":0.01,
        "sync":false
      }
    },
    "line_linked":{
      "enable":false,
      "distance":5000,
      "color":"#ffffff",
      "opacity":0.4,
      "width":1
    },
    "move":{
      "enable":true,
      "speed":2.8,
      "direction":"top",
      "random":true,
      "straight":false,
      "out_mode":"out",
      "bounce":false,
      "attract":{
        "enable":false,
        "rotateX":600,
        "rotateY":1200
      }
    }
  },"interactivity":{
    "detect_on":"canvas",
    "events":{
      "onhover":{
        "enable":false,
        "mode":"bubble"
      },
      "onclick":{
        "enable":false,
        "mode":"repulse"
      },
      "resize":true
    },
    "modes":{
      "grab":{
        "distance":400,
        "line_linked":{
          "opacity":0.5
        }
      },
      "bubble":{
        "distance":400,
        "size":10,
        "duration":0.3,
        "opacity":1,
        "speed":3
      },
      "repulse":{
        "distance":500,
        "duration":0.4
      },
      "push":{
        "particles_nb":4
      },
      "remove":{
        "particles_nb":2
      }
    }
  },
  "retina_detect":true
  });
  
  
    
    setTimeout(()=>{
      document.querySelector('.video-block__popup').innerHTML+=` <iframe width="1663" height="758" src="https://www.youtube.com/embed/Hf-DoiDBy1c" title="Free 4K Purple Abstract Liquid Background 003" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    }, 1500);
   
  };

// document.querySelector('.video-block__play').addEventListener('click', ()=>{
//   document.querySelector('.video-block__popup').classList.add('open')
//   // popup = document.querySelector('.video-block__popup')
// });

// document.querySelector('.video-block__close').addEventListener('click', ()=>{
//   document.querySelector('.video-block__popup').classList.remove('open')
//         document.querySelectorAll('iframe').forEach(i => {
//             const source = i.src
//             i.src = ''
//             i.src = source
//         })
// })







  $$('.payments__wrap img',function(el,ind){
    addCss(el, {
        animationDelay: ind * .06 + 's'
    })
})



document.addEventListener('scroll', (e)=>{
  let deg = window.scrollY;
  document.querySelector('.cross1 img').style.transform = `rotate(${deg/20}deg)`;
  document.querySelector('.cross2 img').style.transform = `rotate(${deg/10}deg)`;
  document.querySelector('.cross3 img').style.transform = `rotate(${deg/10}deg)`;
  document.querySelector('.cross4 img').style.transform = `rotate(${deg/20}deg)`;
  document.querySelector('.cross5 img').style.transform = `rotate(${deg/20}deg)`;
})

// .cross1





const parallax = $$('.parallax');
// const parallax= document.querySelectorAll('.paralax')
// console.log
if (!('ontouchstart' in window) && !(navigator.maxTouchPoints > 0) && !(navigator.msMaxTouchPoints > 0)) {
    for (let index = 0; index < parallax.length; index++) {
        new Parallax(parallax[index]);

    }
}

