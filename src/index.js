import "./styles.css"
import P5 from "p5"
import xs from "xstream"
import fromEvent from "xstream/extra/fromEvent"

const appRef = document.getElementById("app")
const appSize = appRef.getBoundingClientRect()

/**
 * hook: {name: string, hook: function}
 */
const Sketch = {
  draw: function(p5) {
    const home = this
    return () => {
      Object.keys(home.drawHooks).forEach(name => {
        let hook = home.getHook(name)
        hook.hook(p5)
      })
    }
  },
  setup: function(p5) {
    const home = this

    return () => {
      home.setupHook(p5)
    }
  },
  sketch: function() {
    const home = this
    return function(p5) {
      home.p5 = p5

      p5.setup = home.setup(p5)
      p5.draw = home.draw(p5)
    }
  },
  drawHooks: {},
  setHook: function(hook) {
    this.drawHooks[hook.name] = {
      name: hook.name,
      hook: p5 => {
        p5.push()
        hook.hook(p5)
        p5.pop()
      }
    }
  },
  getHook: function(name) {
    return this.drawHooks[name]
  },
  unsetHook: function(name) {
    this.drawHooks[name] = undefined
  },
  sources: function(sinks$) {
    const home = this
    const listener = {
      next: doodle => {
        home.setHook({
          name: doodle.name,
          hook: doodle.hook
        })
      },
      complete: doodle => {
        home.unsetHook(doodle.name)
      }
    }
    sinks$.addListener(listener)
    return {
      events: {
        set: (name, evt) => {
          home.events[name] = fromEvent(home.p5, evt)
          return home.events[name]
        },
        get: name => home.events[name]
      }
    }
  },
  state: {},
  events: {}
}

Sketch.setupHook = p5 => {
  p5.createCanvas(400, 400)
  p5.background(255, 0, 0)
}

new P5(Sketch.sketch().bind(Sketch), "#root")

const setupP5 = (setupCb, domNode) => {}
