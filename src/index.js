import "./styles.css"
import makeP5Driver from "./sketch"

const driver = makeP5Driver(p5 => {
  p5.createCanvas(900, 900)
  p5.background(255, 0, 0)
}, "#app")

console.log(driver)
