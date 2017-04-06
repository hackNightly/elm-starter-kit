window.onload = () => {
	require("./styles/main.less")

	var Elm = require("../elm/Main");
	var root = document.getElementById("main");

	var main = Elm.Main.embed(root);
}
