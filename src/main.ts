import Stats from "three/examples/jsm/libs/stats.module.js";
import "./style.css";
import { Game } from "./Game";

new Game();

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  stats.end();
  requestAnimationFrame(animate);
}

animate();
