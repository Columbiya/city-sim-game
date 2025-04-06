import "./style.css";
import { Game } from "./Game";

new Game();

function animate() {
  requestAnimationFrame(animate);
}

animate();
