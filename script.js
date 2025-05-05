// constants DOM
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultContainer = document.getElementById("search-result-container");
const creatureName = document.getElementById("creature-name");
const creatureId = document.getElementById("creature-id");
const creatureWeight = document.getElementById("weight");
const creatureHeight = document.getElementById("height");
const creatureTypesContainer = document.getElementById("types");
const creatureSpecialName = document.getElementById("special-name");
const creatureSpecialDesc = document.getElementById("special-desc");
const creatureStatsEle = [
  document.getElementById("hp"),
  document.getElementById("attack"),
  document.getElementById("defense"),
  document.getElementById("special-attack"),
  document.getElementById("special-defense"),
  document.getElementById("speed")
];

// API

const creaturesListUrl = "https://rpg-creature-api.freecodecamp.rocks/api/creatures";
const creaturesDataUrl = "https://rpg-creature-api.freecodecamp.rocks/api/creature/";

let creaturesListCache = null;
let creaturesDataCache = null;


// FUNCTIONS

const loadCreaturesListAndData = async () => {
  try {
    const res = await fetch(creaturesListUrl);
    const basicList = await res.json();
    
    creaturesListCache = basicList;
    
    const detailPromises = basicList.map(creature => {
      return fetch(`${creaturesDataUrl}${creature.id}`)
        .then(res => res.json())
        .catch(err => {
          console.error(`Failed to fetch:${creature.id}`, err);
          return null
        })
    });
    
    const detailedCreatures = await Promise.all(detailPromises);
    creaturesDataCache = detailedCreatures;
    
  } catch (err) {
    console.log(err);
  } 
}

loadCreaturesListAndData();

const checkCreaturesList = (input) => {
  if (!creaturesListCache) return false;

  return creaturesListCache.some(({ id, name }) => 
    input === id.toString() || 
    input === name.toLowerCase()
  );
}

const getCreatureByNameOrId = (nameOrId) => {
  const selectedCreature = creaturesDataCache.find(
    creature => 
      creature.id.toString() === nameOrId || 
      creature.name.toLowerCase() === nameOrId
  );

  return selectedCreature;
};

const updateTypesContainer = (types) => {
    types.forEach(({ name }) => {
    const div = document.createElement("div");

    div.classList.add("creature-type", name);
    div.textContent = name.toUpperCase();

    creatureTypesContainer.appendChild(div);
  });
}

const showCreatureData = (creatureData) => {
  const {
    id,
    name,
    weight,
    height,
    special,
    stats,
    types
  } = creatureData;

  resultContainer.classList.remove("visible");
  void resultContainer.offsetWidth; 
  resultContainer.classList.add("visible");
  creatureName.textContent = name.toUpperCase();
  creatureId.textContent = id;
  creatureWeight.textContent = weight;
  creatureHeight.textContent = height;
  creatureSpecialName.textContent = special.name;
  creatureSpecialDesc.textContent = special.description;

  creatureStatsEle.forEach((statEl => {
    const stat = stats.find(s => s.name === statEl.id);
    statEl.textContent = stat ? stat.base_stat : "N/A";
  }));
  
  creatureTypesContainer.innerHTML = "";
  updateTypesContainer(types);
};

const waitForDataToLoad = () => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Data failed to load within the timeout period"));
    }, 5000); 
    
    const interval = setInterval(() => {
      if (creaturesDataCache && creaturesListCache) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    }, 100);
  });
};

// INTERACTIVITY

searchButton.addEventListener("click", async () => {
  const inputValue = searchInput.value.trim().toLowerCase();
  
  try {
    await waitForDataToLoad();
  } catch (err) {
    console.log(err);
    alert("Unable to load data. Please try again later.");
    return;
  }

  if (!checkCreaturesList(inputValue)) {
    alert("Creature not found");
    return;
  }

  const creature = getCreatureByNameOrId(inputValue);
  
  if (!creature) {
    alert("Creature is not available yet")
    return;
  }
  
  showCreatureData(creature);
  searchInput.value = "";
  
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchButton.click();
});


// FOR LOGO

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const colors = ["#00BFFF", "#FF4136", "#2ECC40", "#FFDC00"];
canvas.width = 50;
canvas.height = 50;

// Variables

const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

// Utility functions

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

function proportionalSize(size) {
  return size * canvas.width / 500;
}

function rotateAxis({ x, y }, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle)
  };
}

// Objects

class Particle {
  constructor({ position, radius, color, radians, distFromCenter, angle }) {
    this.position = position;
    this.radius = radius;
    this.color = color;
    this.velocity = 0.15;
    this.radians = radians;
    this.center = { ...position };
    this.distFromCenter = distFromCenter;
    this.angle = angle;
  }

  update() {
    const lastPoint = { ...this.position };

    this.radians += this.velocity;

    const x = Math.cos(this.radians) * this.distFromCenter.x;
    const y = Math.sin(this.radians) * this.distFromCenter.y;

    const rotatedXAndY = rotateAxis({ x, y }, this.angle)
    this.position.x = this.center.x + rotatedXAndY.x;
    this.position.y = this.center.y + rotatedXAndY.y;

    this.draw(lastPoint);
  }

  draw(lastPoint) {
    c.beginPath();
    c.strokeStyle = this.color;
    c.lineWidth = this.radius;
    c.moveTo(lastPoint.x, lastPoint.y);
    c.lineTo(this.position.x, this.position.y);
    c.lineCap = "round";
    c.stroke();
    c.closePath();
  }
}

// Implementation 

let particles;
function init() {
  particles = [];
  
  const particleCount = 4;
  const angleIncrement = Math.PI / particleCount;
  const distFromCenter = {
    x: 180,
    y: 15
  };
  for (let i = 0; i < particleCount; i++) {
    const particleColor = colors [i];
    particles.push(
      new Particle({
        position: {
          x: canvas.width / 2,
          y: canvas.height / 2
        },
        radius: proportionalSize(25),
        color: particleColor,
        radians: angleIncrement * i,
        distFromCenter: {
          x: proportionalSize(distFromCenter.x),
          y: proportionalSize(distFromCenter.y)
        },
        angle: angleIncrement * i
      })
    );
  }
}


// Animation 
function animate() {
  window.requestAnimationFrame(animate);
  //change based on background
  
  c.fillStyle = "rgba(13, 11, 31, 0.05)"; 
  c.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => particle.update());
}

init();
animate();

