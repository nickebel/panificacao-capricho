/*
 * Acessibilidade em Libras — Panificação Capricho
 * Integra o widget oficial do VLibras conforme a documentação:
 * https://vlibras.gov.br/doc/widget/installation/webpageintegration.html
 */
(function () {
  "use strict";

  if (!document.body || document.querySelector("[data-capricho-vlibras]")) return;

  // Realça o foco do botão para facilitar a navegação por teclado.
  var style = document.createElement("style");
  style.textContent = ":root{--vlibras-btn-outline:3px solid #38271d;--vlibras-btn-focus-visible-outline:3px solid #38271d;--vlibras-btn-focus-visible-shadow:0 0 0 4px #e4b88b;--vlibras-btn-hover-filter:brightness(1.12)}";
  document.head.appendChild(style);

  // O contêiner vem antes do script, para que o widget o encontre ao iniciar.
  var widget = document.createElement("div");
  widget.setAttribute("vw", "");
  widget.setAttribute("data-capricho-vlibras", "");
  widget.className = "enabled";
  widget.innerHTML =
    '<div vw-access-button class="active"></div>' +
    '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.appendChild(widget);

  var script = document.createElement("script");
  script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  script.async = true;
  script.onerror = function () {
    // O conteúdo e as opções de contato por mensagem continuam disponíveis.
    widget.setAttribute("data-vlibras-unavailable", "true");
  };
  document.head.appendChild(script);
})();
