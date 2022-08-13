"use strict";

let coords;
let coords2;
let lati, lngi;
let arr = [];
let arr2 = [];
let locations;
let v = 0;
let a = 0;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (pos) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    coords = [lat, lng];

    let map = L.map("map").setView(coords, 9);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on(
      "click",
      function (mapE) {
        const { lat, lng } = mapE.latlng;
        coords2 = mapE.latlng;
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        )
          .then((res) => res.text())
          .then((data) => {
            lati = JSON.parse(data).latitude;
            lngi = JSON.parse(data).longitude;
            return JSON.parse(data);
          })
          .then(function (data) {
            L.marker([lat, lng])
              .addTo(map)
              .bindPopup(
                L.popup({
                  maxWidth: 250,
                  minWidth: 125,
                  className: "popup",
                })
              )
              .setPopupContent(`${data.locality}`)
              .openPopup();
            return data.countryName;
          })
          .then(function (data) {
            return fetch(`https://restcountries.com/v2/name/${data}`);
          })
          .then((res) => res.text())
          .then((data) => {
            return JSON.parse(data);
          })
          .then(function (data) {
            function render(dataFor) {
              const html = `<div class="render" data-id="${v++}">
              <div class="flag">
                <img src="${dataFor[0].flags.svg}" />
              </div>
              <div class="descont">
                <div class="desc">
                  <p>${
                    dataFor[0].name.includes("Russia")
                      ? "Russia (occupant)"
                      : dataFor[0].name
                  }</p>
                  <div>capital: ${dataFor[0].capital}</div>
                  <div>language: ${dataFor[0].languages[0].name}</div>
                  <div>currency: ${dataFor[0].currencies[0].name}</div>
                </div>
              </div>
            </div>`;
              document
                .querySelector(".float")
                .insertAdjacentHTML("afterbegin", html);
              arr.push([lati, lngi]);
              data[0].array = { arrow: arr };
              locations = data[0].array.arrow;
            }
            return render(data), data;
          })
          .then(function (data) {
            let h = 0;
            document.querySelectorAll(".render").forEach((ell, i, arr) => {
              ell.addEventListener("click", function (el) {
                map.setView(locations[ell.dataset.id], 9, {
                  animate: true,
                  pan: {
                    duration: 1,
                  },
                });
              });
            });
          });
      },
      function () {
        alert("Couldnt get your location");
      }
    );
  });
}
