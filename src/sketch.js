import P5 from "p5"
import fromEvent from "xstream/extra/fromEvent"

class Sketch {
  constructor(setupHook, rootString) {
    this.setupHook = setupHook
    this.drawHooks = {}
    const root = document.querySelector(rootString)
    this.p5Master = new P5(this.sketch(), root)
  }

  draw(p5) {
    const home = this
    return () => {
      Object.keys(home.drawHooks).forEach(name => {
        let hook = home.getHook(name)
        hook.hook(p5)
      })
    }
  }

  setup(p5) {
    const home = this
    return () => {
      home.setupHook(p5)
    }
  }

  sketch() {
    const home = this
    return function(p5) {
      home.p5 = p5
      p5.setup = home.setup(p5)
      p5.draw = home.draw(p5)
    }
  }

  setHook(hook) {
    this.drawHooks[hook.name] = {
      name: hook.name,
      hook: p5 => {
        p5.push()
        hook.hook(p5)
        p5.pop()
      }
    }
  }

  getHook(name) {
    return this.drawHooks[name]
  }

  unsetHook(name) {
    let hook = this.drawHooks[name]
    this.drawHooks[name] = undefined
    return hook
  }

  driver(sinks$) {
    const home = this
    sinks$.addListener({
      next: hook => {
        home.setHook(hook)
      },
      complete: () => {
        console.log("from p5-driver", "P5-stream completed")
      }
    })

    return {
      events: {
        set: (name, evt) => {
          home.events[name] = fromEvent(home.p5, evt)
          return home.events[name]
        },
        get: name => home.events[name],
        getOrSet: (name, evt) => {
          const event = home.events[name]
          return event ? event : this.set(name, evt)
        }
      }
    }
  }
}

const makeP5Driver = (setupHook, rootString) => {
  const sketch = new Sketch(setupHook, rootString)
  return sketch.driver
}

export default makeP5Driver
