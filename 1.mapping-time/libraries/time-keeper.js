"use strict";

var TimeKeeper = function(sel){
  var dom = $(sel),
      nav = $('nav'),
      dimmer, ruler,
      slider = nav.find('input[name=speed]'),
      menu = nav.find('select'),
      rates = [0, 1, 30, 60, 30*60, 60*60, 12*60*60, 24*60*60, 7*24*60*60, 28*24*60*60],
      speeds = ['stopped', 'realtime', '½ minute', '1 minute', '½ hour', '1 hour', '½ day', '1 day', '1 week', '1 month'],
      modes = {
       single:{ label:'Right Now', start:  0, end: 1, step:'years'},
      minutes:{ label:'An hour',    start:-30, end:30, step:'minutes', skip:3},
      meridia:{ label:'Half a day', start: -6, end: 6, step:'hours',   skip:.5},
        hours:{ label:'A Day',      start:-12, end:12, step:'hours'},
         days:{ label:'A Week',  start: -3, end: 4, step:'days'},
        weeks:{ label:'A Month', start: -14, end: 16, step:'days'},
       months:{ label:'A Year',  start: -6, end: 6, step:'months'}
      },
      mode = sessionStorage.getItem('mode') || 'single',
      speed = 1;

  var that = {
    init:function(){
      $('body').on('mousemove', that.showNav)
      $(document).on('mouseout', that.hideNav)
      menu.on('change', that.updateFrames)
      for (var val in modes) menu.append(
        `<option value="${val}">${modes[val].label}</option>`
      )
      slider.prop({min:-(rates.length-1), max:rates.length-1})
            .on('input', that.updateSpeed)

      let w = sessionStorage.getItem('sketchWidth') || 1,
          h = sessionStorage.getItem('sketchHeight') || 1;
      $('head').append(`<style> .sketch{width:${w}px; height:${h}px; } </style>`)

      setTimeout(function(){
        menu.val(mode)
        that.updateSpeed()
        that.updateFrames()
        setInterval(that.updateLabels, 100)
        ruler = setInterval(that.updateDims, 100)
      })
      return that
    },

    showNav:function(e){
      clearTimeout(dimmer)
      if (e.clientY < window.innerHeight/3)
        nav.addClass('active')
      else
        nav.removeClass('active')

      if (!nav[0].contains(e.target))
        dimmer = setTimeout(that.hideNav, 500)
    },

    hideNav:function(){
      nav.removeClass('active')
    },

    updateSpeed:function(){
      let val = slider.val(),
          slot = Math.abs(val),
          sign = Math.sign(val),
          label = (sign<0 ? '−' : '') + speeds[slot] + (slot>1 ? '/s' : '')
      speed = sign * rates[slot];
      nav.find('span').text(label)
      for (var i=0; i<window.frames.length; i++)
        window.frames[i].clockSpeed(speed)
    },

    updateFrames:function(){
      mode = menu.val()
      sessionStorage.setItem('mode', mode)
      dom.attr('class', mode)
         .find('.cell').remove()

      let {start=0, end=0, step, skip=1} = modes[mode]
      for (var i=start; i<end; i+=skip){
        that.addFrame({offset:i, step, speed})
      }
    },

    updateDims:function(){
      let frame = window.frames[0],
          w = frame.width,
          h = frame.height;
      if (w!==undefined && h!==undefined){
        sessionStorage.setItem('sketchWidth', w)
        sessionStorage.setItem('sketchHeight', h)
        $('head').append(`<style> .sketch{width:${w}px; height:${h}px; } </style>`)
        clearInterval(ruler)
      }
    },

    updateLabels:function(){
      $('iframe').each( (i, frameElt) => {
        let label = frameElt.nextSibling,
            frameObj = window.frames[i],
            fmt = ['hours','minutes'].indexOf(modes[mode].step)>=0 ? 'time' : 'date',
            timestamp = frameObj.clock().text[fmt];
        label.innerText = (mode == 'single') ? '' : timestamp

      })
    },

    addFrame:function({offset=0, step='hours', speed=1.0}){
      let nocache = new Date().getTime(),
          links = [...document.querySelectorAll('link')].map(elt => elt.href.indexOf('time-keeper')<0 ? elt.outerHTML : ''),
          sketch = $(`<div class="cell"><div class="timestamp">&nbsp;</div></div>`).appendTo(dom)
      $('<iframe>').addClass('sketch').attr('srcdoc',`
        <html>
          <head>
            <meta charset="UTF-8">
            <script language="javascript" type="text/javascript" src="lib/p5.min.js"></script>
            <script language="javascript" type="text/javascript" src="lib/moment.min.js"></script>
            <script language="javascript" type="text/javascript" src="lib/clock.js"></script>
            <script> clockSpeed(${speed}); clockOffset(${offset}, "${step}") </script>
            <script language="javascript" type="text/javascript" src="sketch.js?v=${nocache}"></script>
            ${links.join(' ')}
            <style>
              html, body { height: 100%; padding: 0; margin: 0; }
              body { display: flex; justify-content: center; align-items: center; }
            </style>
          </head>
          <body>
          </body>
        </html>
      `).prependTo(sketch)
    }


  }

  return (dom.length==0) ? {} : that.init()
}


$(document).ready(function(){
  TimeKeeper('#time-keeper')
})