// helper
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// BMI calculator
document.getElementById("calculate-btn").addEventListener("click", async function () {
  const weight = parseFloat(document.getElementById("weight").value);
  const heightCm = parseFloat(document.getElementById("height").value);
  const gender = document.getElementById("gender").value;
  const goal = document.getElementById("goal").value;

  if (!weight || !heightCm || heightCm < 50 || weight < 1) {
    document.getElementById("status").textContent = "Please enter valid weight and height.";
    return;
  }

  const h = heightCm / 100;
  const bmi = +(weight / (h * h)).toFixed(1);
  const bmiPrime = +(bmi / 25).toFixed(2);
  const ponderal = +(weight / (h * h * h)).toFixed(2);
  const idealLow = +(18.5 * h * h).toFixed(1);
  const idealHigh = +(25 * h * h).toFixed(1);
///////////////////////////////////////////////////////////////////////////
 let category = "";
if (bmi < 16) category = "Severe Thinness";
else if (bmi < 17) category = "Moderate Thinness";
else if (bmi < 18.5) category = "Mild Thinness";
else if (bmi < 25) category = "Normal";
else if (bmi < 30) category = "Overweight";
else if (bmi < 35) category = "Obese Class I";
else if (bmi < 40) category = "Obese Class II";
else category = "Obese Class III";

const warningBox = document.getElementById("status");
warningBox.innerHTML = "";

const riskCategories = [
  "Overweight",
  "Obese Class I",
  "Obese Class II",
  "Obese Class III"
];
const underweightCategories = [
  "Severe Thinness",
  "Moderate Thinness",
  "Mild Thinness"
];


if (riskCategories.includes(category)) {
  warningBox.innerHTML = `
    <div class="mt-6 p-4 bg-red-900 text-red-100 rounded-xl border border-red-700 shadow-md">
      <h4 class="text-lg font-bold mb-2">⚠️ <span class="text-yellow-300">Health Warning</span></h4>
      <p class="text-sm mb-3">Your BMI falls into a category associated with increased health risks. According to the CDC, being overweight or obese can lead to:</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>💓 High blood pressure</li>
        <li>🩸 High LDL cholesterol / low HDL</li>
        <li>🍬 Type II diabetes</li>
        <li>❤️ Coronary heart disease</li>
        <li>🧠 Stroke</li>
        <li>🫃 Gallbladder disease</li>
        <li>🦴 Osteoarthritis (joint pain)</li>
        <li>😴 Sleep apnea & breathing issues</li>
        <li>🎗️ Certain cancers (breast, colon, kidney)</li>
        <li>🧠 Mental health issues (depression, anxiety)</li>
        <li>⚰️ Increased risk of early mortality</li>
      </ul>
      <p class="mt-3 text-sm">Maintaining a BMI below 25 is generally recommended. Please consult a healthcare professional for personalized advice.</p>
    </div>
  `;
}
if (underweightCategories.includes(category)) {
  warningBox.innerHTML = `
    <div class="mt-6 p-4 bg-yellow-900 text-yellow-100 rounded-xl border border-yellow-700 shadow-md">
      <h4 class="text-lg font-bold mb-2">⚠️ <span class="text-orange-300">Underweight Warning</span></h4>
      <p class="text-sm mb-3">Your BMI is below the healthy range. According to the CDC, being underweight can lead to:</p>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>🥣 Malnutrition, vitamin deficiencies, anemia</li>
        <li>🦴 Osteoporosis (weak bones)</li>
        <li>🛡️ Decreased immune function</li>
        <li>🧒 Growth and development issues (children/teens)</li>
        <li>👩‍⚕️ Reproductive issues in women (hormonal imbalance, miscarriage risk)</li>
        <li>🔪 Surgical complications</li>
        <li>⚰️ Increased risk of early mortality</li>
      </ul>
      <p class="mt-3 text-sm">Being underweight may signal an underlying condition. Please consult a healthcare professional to evaluate your health status.</p>
    </div>
  `;
}


////////////////////////////////////////////////////////////////////////
  document.getElementById("bmi-value").textContent = bmi;
  document.getElementById("bmi-category").textContent = category;
  document.getElementById("bmi-prime").textContent = bmiPrime;
  document.getElementById("ponderal-index").textContent = ponderal;
  document.getElementById("ideal-weight").textContent = `${idealLow} – ${idealHigh} kg`;
  document.getElementById("bmi-marker").style.left = clamp((bmi / 40) * 100, 0, 100) + "%";

  await getDiet(category);
  await getWorkout(goal);
  loadAvatar(gender);
});

// Diet API (Open Food Facts v2) – unchanged
async function getDiet(category) {
  const list = document.getElementById("diet-list");
  list.innerHTML = "";

  const queries = {
    Underweight: "nuts avocado granola",
    Normal: "vegetables fruit whole grains",
    Overweight: "low calorie fiber",
    Obese: "leafy greens legumes"
  };
  const query = queries[category] || "healthy";

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?fields=product_name,brands&sort_by=popularity_key&page_size=5&search_terms=${encodeURIComponent(query)}`);
    const data = await res.json();

    const products = (data.products || []).filter(p => p.product_name && !/beer|alcohol|energy/i.test(p.product_name));
    if (products.length === 0) throw new Error("No products");

    products.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.product_name} (${p.brands || "Unknown"})`;
      list.appendChild(li);
    });
  } catch (e) {
    console.log("Diet API error", e);
    const fallback = {
      Underweight: ["Mixed nuts", "Avocado", "Greek yogurt", "Granola", "Olive oil"],
      Normal: ["Brown rice", "Chicken breast", "Salad", "Apple", "Natural yogurt"],
      Overweight: ["Spinach", "Lentils", "Quinoa", "Cottage cheese", "Broccoli"],
      Obese: ["Leafy greens", "Black beans", "Tofu", "Berries", "Cauliflower"]
    };
    (fallback[category] || ["Vegetables", "Lean proteins"]).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }
}

// Workout API (wger) – optimized
async function getWorkout(goal) {
  document.getElementById("goal-a").textContent = goal;
  document.getElementById("goal-b").textContent = goal;

  const listA = document.getElementById("circuit-a");
  const listB = document.getElementById("circuit-b");
  listA.innerHTML = "";
  listB.innerHTML = "";

  let exercises = [];
  try {
    // request fewer items for speed
    const res = await fetch("https://wger.de/api/v2/exercise/?language=2&limit=20");
    const data = await res.json();

    exercises = data.results
      .filter(e => e.name)
      .map(e => ({
        name: e.name.trim(),
        desc: (e.description || "").replace(/<[^>]+>/g, "").trim()
      }));

    if (exercises.length < 12) throw new Error("Not enough exercises");
  } catch (e) {
    console.log("Workout API error", e);
    exercises = [
      { name: "Push-Up", desc: "Upper body push" },
      { name: "Squat", desc: "Lower body strength" },
      { name: "Plank", desc: "Core stability" },
      { name: "Lunge", desc: "Leg strength" },
      { name: "Glute Bridge", desc: "Hip activation" },
      { name: "Bird Dog", desc: "Core coordination" },
      { name: "Side Plank", desc: "Lateral core" },
      { name: "Dead Bug", desc: "Core control" },
      { name: "Mountain Climber", desc: "Cardio core" },
      { name: "Superman", desc: "Posterior chain" },
      { name: "Calf Raise", desc: "Lower leg" },
      { name: "Hip Hinge Drill", desc: "Deadlift pattern" }
    ];
  }

  const params = goal === "lose" ? { sets: 3, reps: "12–15" } :
                 goal === "gain" ? { sets: 4, reps: "6–10" } :
                                   { sets: 3, reps: "10–12" };

  function render(ex) {
    const li = document.createElement("li");
    li.innerHTML = `<b>${ex.name}</b> — Sets: ${params.sets}, Reps: ${params.reps}<br>${ex.desc || "No description"}`;
    return li;
  }

  exercises.slice(0, 6).forEach(ex => listA.appendChild(render(ex)));
  exercises.slice(6, 12).forEach(ex => listB.appendChild(render(ex)));
}

// Avatar loader – simplified for speed
function loadAvatar(gender) {
  const viewer = document.getElementById("viewer");
  viewer.innerHTML = "";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  viewer.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(2, 4, 3);
  scene.add(light);

  const loader = new THREE.GLTFLoader();
  const file = gender === "female" ? "female.glb" : "male.glb";

  loader.load(file, gltf => {
    const model = gltf.scene;
    scene.add(model);

    // quick fit
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    model.position.sub(center);

    camera.position.set(0, size.y * 0.4, size.z * 2.5);
    controls.target.set(0, size.y * 0.4, 0);
    camera.updateProjectionMatrix();
  }, undefined, err => {
    console.log("Avatar load error", err);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  });
}