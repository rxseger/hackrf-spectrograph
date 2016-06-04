#!/usr/bin/env node
var babar = require('babar')
var radio = require('hackrf-stream')()
var stft = require('stft')(1, 2048, onFreq)

function onFreq (real, imaginary) {
  var formatted = []
  for (var i = 0; i < real.length; i++) {
    formatted.push([ i, real[i] ])
  }
  console.log(babar(formatted, { width: 128, height: 32 }))
}

console.log("found device", radio.device.getVersion())

radio.device.setFrequency(2.48e9, function () {
  console.log("set frequency to", 2.48e9)
  radio.device.setBandwidth(2e6, function () {
    console.log("set bandwidth to", 2e6)
    radio.device.setSampleRate(8e6, function () {
      console.log("set sample rate to", 8e6)
      var rx = radio.createReadStream()
      rx.on('data', function (data) {
        for (var j = 0; j < data.length / 128; j++) {
          var slice = data.slice(j * data.length / 128, (j + 1) * data.length / 128)
          var array = new Array(slice.length)
          for (var i = 0; i < slice.length; i++) {
            array[i] = slice[i] / 255
          }
          var floats = new Float32Array(array)
          stft(floats)
        }
      })
    })
  })
})
