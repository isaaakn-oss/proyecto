(function () {
  "use strict";
  window.__BRAND__ = {
    name: "San Buche",
    whatsapp: "5491165306304",
    // Horario por día (0 = domingo). Cada tramo: [abre, cierra] en horas decimales.
    hours: {
      0: [],
      1: [[12, 16], [18, 22]],
      2: [[12, 16], [18, 22]],
      3: [[12, 16], [18, 22]],
      4: [[12, 16], [18, 22]],
      5: [[12, 16], [18, 23]],
      6: [[12, 16], [18, 23]]
    },
    // Recetas de abajo hacia arriba. Cada capa: [tipo, etiqueta].
    santos: {
      "santa-suprema": {
        name: "Santa Suprema",
        layers: [
          ["pan", "Pan"],
          ["mayo", "Mayo cítrica"],
          ["lechuga", "Lechuga"],
          ["tomate", "Tomate"],
          ["pollo", "Milanesa de pollo crispy"],
          ["mozzarella", "Mozzarella"],
          ["pesto", "Pesto"],
          ["panTop", "Pan"]
        ]
      },
      "san-milan": {
        name: "San Milán",
        layers: [
          ["pan", "Pan"],
          ["lactonesa", "Lactonesa de ajo"],
          ["lechuga", "Lechuga"],
          ["tomate", "Tomate"],
          ["carne", "Milanesa de carne crispy"],
          ["mozzarella", "Mozzarella"],
          ["pesto", "Pesto"],
          ["panTop", "Pan"]
        ]
      },
      "san-phillypo": {
        name: "San Phillypo",
        layers: [
          ["pan", "Pan enmantecado"],
          ["desmenuzada", "Carne desmenuzada"],
          ["barbacoa", "Barbacoa"],
          ["cebolla", "Cebolla"],
          ["mozzarella", "Mozzarella"],
          ["panceta", "Panceta"],
          ["panTop", "Pan enmantecado"]
        ]
      },
      "santa-girgola": {
        name: "Santa Girgola",
        layers: [
          ["pan", "Pan"],
          ["mostaza", "Mostaza dulce"],
          ["rucula", "Rúcula"],
          ["girgola", "Milanesa de gírgolas"],
          ["mozzarella", "Mozzarella"],
          ["cebolla", "Cebolla"],
          ["panTop", "Pan"]
        ]
      },
      "santa-porchetta": {
        name: "Santa Porchetta",
        layers: [
          ["pan", "Pan"],
          ["mayoAjo", "Mayo de ajo"],
          ["porchetta", "Porchetta"],
          ["provoleta", "Provoleta"],
          ["morron", "Morrón inglés"],
          ["panTop", "Pan"]
        ]
      }
    }
  };
})();
