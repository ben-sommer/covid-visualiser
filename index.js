var sideLength = 100;
var squareSize = 5;
var squarePadding = 1;

var cases = 0;
var deaths = 0;
var count = 0;

var currentCountry = "US";
var currentPopulation = 328200000;

var currentCountry2 = "BR";
var currentPopulation2 = 209500000;

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

var c2 = document.getElementById("canvas2");
var ctx2 = c2.getContext("2d");

function checkSquare(num, x, y) {
  var numRoot = Math.sqrt(num);
  var numRootLow = Math.floor(numRoot);
  var numRootHigh = Math.ceil(numRoot);
  if (sideLength-x < numRootLow && sideLength-y < numRootLow) {
    return true;
  }
  if (num > sideLength-y + (numRootLow*numRootLow) && sideLength-x == numRootLow && sideLength-y < numRootLow) {
    return true;
  };
  if (num > (numRootHigh*numRootLow) && sideLength-x < numRootHigh && sideLength-y < numRootHigh && sideLength-x <= (num - (numRootHigh*numRootLow) - 1)) {
    return true;
  };
  return false
}

function drawRect(x, y, width, height, a, b, z, c, d, p) {
  count++;
  z.fillStyle = 'green';
  if (checkSquare(Math.round(c/p*10000), a, b)) z.fillStyle = "orange";
  if (checkSquare(Math.round(d/p*10000), a, b)) z.fillStyle = "red";
  z.fillRect(x, y, width, height);
};

function reDraw(z, c, d, p, x) {
  z.clearRect(0, 0, x.width, x.height);

  for (a=1;a<=sideLength;a++) {
    for (b=1;b<=sideLength;b++) {
      drawRect((a-1)*(squareSize+squarePadding)+0.5, (b-1)*(squareSize+squarePadding)+0.5, squareSize, squareSize, a, b, z, c, d, p);
    }
  }
};

function hideError() {
  // document.getElementById("credit").style.display = "block";
  document.getElementById("placeholder").style.display = "none";
  document.getElementById("canvas").style.display = "block";
  document.getElementById("canvas2").style.display = "block";
};

function showError() {
  // document.getElementById("credit").style.display = "none";
  document.getElementById("placeholder").style.display = "block";
  document.getElementById("canvas").style.display = "none";
  document.getElementById("canvas2").style.display = "none";
};

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function startLoop() {

  hideError();

  if (localStorage.getItem("country")) {
    currentCountry = localStorage.getItem("country");
    document.getElementById("country-select").value = localStorage.getItem("country");
    document.getElementById("country-label").innerHTML = document.getElementById("country-select").options[document.getElementById("country-select").selectedIndex].text;
  } else {
    localStorage.setItem("country", "US");
    document.getElementById("country-select").value = "US";
    document.getElementById("country-label").innerHTML = document.getElementById("country-select").options[document.getElementById("country-select").selectedIndex].text;
  };

  if (localStorage.getItem("country2")) {
    currentCountry2 = localStorage.getItem("country2");
    document.getElementById("country-select2").value = localStorage.getItem("country2");
    document.getElementById("country-label2").innerHTML = document.getElementById("country-select2").options[document.getElementById("country-select2").selectedIndex].text;
  } else {
    localStorage.setItem("country2", "BR");
    document.getElementById("country-select2").value = "BR";
    document.getElementById("country-label2").innerHTML = document.getElementById("country-select2").options[document.getElementById("country-select2").selectedIndex].text;
  };

  fetch(`https://world-geo-data.p.rapidapi.com/countries/${currentCountry}?format=json`, {
  	"method": "GET",
  	"headers": {
  		"x-rapidapi-host": "world-geo-data.p.rapidapi.com",
  		"x-rapidapi-key": "88d3ea5b96msh46ad662c03e78b1p128a19jsn7c8518e47f35"
  	}
  })
  .catch(() => {
    c.width = 200;
    c.height = 200;
    showError();
  })
  .then(response => response.json())
  .then(countryData => {
    // sideLength = Math.ceil(Math.sqrt(countryData.population/10000));
    console.log(sideLength);

    currentPopulation = countryData.population;

    console.log(cases/currentPopulation*10000);
    console.log(deaths/currentPopulation*10000);

    c.width = (squareSize+squarePadding)*sideLength;
    c.height = (squareSize+squarePadding)*sideLength;

    c2.width = (squareSize+squarePadding)*sideLength;
    c2.height = (squareSize+squarePadding)*sideLength;

    var countryDelay = 100;

    fetch(`https://disease.sh/v3/covid-19/historical/${currentCountry}?lastdays=all`)
      .then(response => response.json())
      .then(data => {
        fetch(`https://disease.sh/v3/covid-19/historical/${currentCountry2}?lastdays=all`)
          .then(response => response.json())
          .then(data2 => {
            if (!data.message) {
              const delayLoop = (fn, delay) => {
                return (key, i) => {
                  setTimeout(() => {
                    // console.log(data.timeline.deaths[key]);
                    update(data.timeline.cases[key], data.timeline.deaths[key], data2.timeline.cases[key], data2.timeline.deaths[key], key);
                  }, i * delay);
                }
              };

              const update = (cases, deaths, cases2, deaths2, key) => {
                reDraw(ctx, cases, deaths, currentPopulation, c);
                reDraw(ctx2, cases2, deaths2, currentPopulation2, c2);
                document.getElementById("date").innerHTML = key;
              };

              Object.keys(data.timeline.cases).forEach(delayLoop(update, countryDelay));
            } else {
              c.width = 200;
              c.height = 200;

              c2.width = 200;
              c2.height = 200;
              showError();
            }
        });
      });
  }).catch(() => {
    c.width = 200;
    c.height = 200;

    c2.width = 200;
    c2.height = 200;
    showError();
  });
}

startLoop();

document.getElementById("country-select").addEventListener("change", function() {
  window.localStorage.setItem("country", document.getElementById("country-select").value);
  location.reload();
});

document.getElementById("country-select2").addEventListener("change", function() {
  window.localStorage.setItem("country2", document.getElementById("country-select2").value);
  location.reload();
});
