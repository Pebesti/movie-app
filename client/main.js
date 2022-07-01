import MovieApp from "./movie-app";
import Alpine from "alpinejs";

window.Alpine = Alpine;
Alpine.data("movieApp", MovieApp);
Alpine.start();
