// =============== API Links ====================
var API ={
  PLANTS: "https://openapi.programming-hero.com/api/plants",
  CATS: "https://openapi.programming-hero.com/api/categories",
  BY_CAT: function (id) {return"https://openapi.programming-hero.com/api/category/" + id;},
  DETAIL: function (id) {return "https://openapi.programming-hero.com/api/plant/" + id;}
}


// =============== DOM Elements =================
var catList = document.getElementById("categoryList");
var catSpin = document.getElementById("catSpinner");
var plantGrid = document.getElementById("plantGrid");
var gridLoad = document.getElementById("gridLoader");
var stateMsg = document.getElementById("stateMsg");

var modal = document.getElementById("plantModal");
var mTitle = document.getElementById("modalTitle");
var mBody = document.getElementById("modalBody");

var cartBody = document.getElementById("cartBody");
var cartList = document.getElementById("cartList");
var cartEmpty = document.getElementById("cartEmpty");
var cartTotal = document.getElementById("cartTotal");
var cartCount = document.getElementById("cartCount");


// ================ Helpers ==============
function show(el, on) {
  if (!el) return;
  if (on) {el.classList.remove("hidden"); }
  else {el.classList.add("hidden")}
}


function setMsg(msg) {
  if (!msg) {
    stateMsg.classList.add("hidden");
    stateMsg.textContent = "";
  }
  else{
    stateMsg.textContent = msg;
    stateMsg.classList.remove("hidden");
  }
}

function getArray(raw, key){
  if(Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && raw.data && key && Array.isArray(raw.data[key])) return raw.data[key];
  if (raw && key && Array.isArray(raw[key])) return raw[key];
  return [];
}

function getObject(raw) {
  if (raw && raw.status === false) return null;
  if (raw && raw.data && raw.data.plant) return raw.data.plant;
  if (raw && raw.data) return raw.data;
  return null;
}

function escapeAttr(s) {
  s = s || "";
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}


// ============ Make Category Name/ID ================
function makeCategoryFields(c, i){
  if (typeof c === "string"){
    var n = c.trim();
    var idFromName = n.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return {id: idFromName || String(i + 1), name: n};
  }

  var name = c.category || c.name || c.category_name || c.title || c.label;
  if (!name) {
    for (var k in c){
      if (typeof c[k] === "string" && c[k].trim()) {name = c[k]; break;}
    }
  }

  if (!name) name = "Unknown";

  var id = c.id || c.category_id || c.value || c.slug || c.code;
  if (!id){
    var slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    id = slug || String(i + 1);
  }
  return { id: String(id), name: name };
}
  

function mapPlant(p){
  var apiId = p.id || p.plantId || p.plant_id || p._id || p.item_id;
  return {
    apiId: apiId,
    id: String(apiId || Math.random()),
    name: p.name || p.title || "Untitled Plant",
    image: p.image || p.img || p.thumbnail || "",
    description: p.description || p.thumbnail || "",
    category: p.category || p.type || "Unknown",
    price: Number(p.price || p.cost || p.amount || 0)
  };
}


// ============== Categories ==========================
async function loadCategories (){
  show(catSpin, true);
  try {
    var res = await fetch(API.CATS);
    var json = await res.json();
    var cats = getArray(json, "categories");
    renderCategories(cats);
  }catch (e){
    console.log(e);
    catList.innerHTML = '<li class="text-sm text-red-600">Failed to load categories</li>';
  }
  finally {
    show(catSpin, false);
  }
}


function renderCategories(cats){
  catList.innerHTML = "";
  var liAll = document.createElement("li");
  liAll.innerHTML =
    '<button id="btnAll" class="w-full text-left px-3 py-2 rounded bg-green-600 text-white">All Trees</button>';
    catList.appendChild(liAll);

    for (var i = 0; i < cats.length; i++) {
      var c = makeCategoryFields(cats[i], i);
      var li = document.createElement("li");
      li.innerHTML =
        '<button class="category-btn w-full text-left px-3 py-2 rounded hover:bg-emerald-100 hover:text-green-800" data-id="' + c.id + '">' +
          c.name +
        "</button>";
      catList.appendChild(li);
  }
} 


// ============ Products ==============
async function loadAllPlants() {
  show(gridLoad, true); setMsg("");
  try {
    var res = await fetch(API.PLANTS);
    var json = await res.json();
    var plants = getArray(json, "plants");
    var mapped = [];
    for (var i = 0; i < plants.length; i++) {mapped.push(mapPlant(plants[i])); }
    renderPlants(mapped);
  }
  catch (e) {
    console.log(e); setMsg("Failed to load plants");
  } finally {
    show(gridLoad, false);
  }
}


async function loadByCategory(id) {
  show(gridLoad, true); setMsg("");
  try {
    var res  = await fetch(API.BY_CAT(id));
    var json = await res.json();
    var plants = getArray(json, "plants");
    var mapped = [];
    for (var i = 0; i < plants.length; i++) { mapped.push(mapPlant(plants[i])); }
    renderPlants(mapped);
  } catch (e) {
    console.log(e); setMsg("Could not load this category.");
  } finally {
    show(gridLoad, false);
  }
}

function renderPlants(plants) {
  plantGrid.innerHTML = "";
  if (!plants || !plants.length) { setMsg("No plants found."); return; }
  setMsg("");

  var frag = document.createDocumentFragment();
  for (var i = 0; i < plants.length; i++) {
    var p = plants[i];
    var card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow p-4 flex flex-col";
    card.innerHTML =
      '<div class="rounded-lg mb-4 overflow-hidden">' +
        '<img src="' + p.image + '" alt="' + escapeAttr(p.name) + '" class="w-full h-52 md:h-40 object-cover">' +
      "</div>" +

      '<button class="plant-name text-left text-green-700 hover:text-green-800 no-underline cursor-pointer hover:underline font-semibold" ' +
              'data-id="' + (p.apiId || "") + '" ' +
              'data-name="' + escapeAttr(p.name) + '" ' +
              'data-image="' + escapeAttr(p.image) + '" ' +
              'data-category="' + escapeAttr(p.category) + '" ' +
              'data-price="' + p.price + '" ' +
              'data-description="' + escapeAttr(p.description) + '">' +
        p.name +
      "</button>" +

      '<p class="text-sm text-gray-600 mt-1">' +
        ( (p.description || "No description").slice(0, 100) + (p.description && p.description.length > 100 ? "..." : "") ) +
      "</p>" +

      '<div class="flex items-center justify-between mt-3">' +
        '<span class="px-3 py-1 bg-green-100 text-[#15803D] text-xs font-medium rounded-full">' + p.category + "</span>" +
        '<span class="font-semibold">৳' + p.price + "</span>" +
      "</div>" +

      '<button class="add-btn mt-4 w-full bg-[#15803D] text-white py-2 rounded-full cursor-pointer font-medium hover:bg-green-800 transition" ' +
              'data-name="' + escapeAttr(p.name) + '" data-price="' + p.price + '">' +
        "Add to Cart" +
      "</button>";

    frag.appendChild(card);
  }
  plantGrid.appendChild(frag);
}

  
// =============== Plants Details Modal ==============
function fillDetailFromDataset(ds) {
  mBody.innerHTML =
  '<div class="pb-4">' +
    '<img src="' + (ds.image || "") + '" alt="' + (ds.name || "Plant") + '" class="rounded-lg w-full h-40 md:h-52 object-cover">' +
  "</div>" +
  "<div>" +
    '<h4 class="text-xl font-bold mb-1">' + (ds.name || "Plant") + "</h4>" +
    '<p class="text-sm text-gray-600 mb-2">' + '<span class="font-bold pr-1 text-sm text-black">Categories:</span>' + (ds.category || "Unknown") + "</p>" +
    '<p class="text-sm text-gray-600 mb-2">' + '<span class="font-bold pr-1 text-sm text-black">Price:</span>' + '৳' + Number(ds.price || 0) + "</p>" +
    "<p>" + (ds.description || "No detailed description available.") + "</p>" +
  "</div>";
}

async function openDetails(btnEl) {
  var id = btnEl.getAttribute("data-id");
  mTitle.textContent = "Plant Details";
  mBody.innerHTML =
    '<div class="col-span-2 w-full py-10 flex items-center justify-center">' +
      '<div class="w-10 h-10 rounded-full border-4 border-green-300 border-t-transparent animate-spin"></div>' +
    "</div>";
  modal.showModal();

  if (!id) { fillDetailFromDataset(btnEl.dataset); return; }

  try {
    var res  = await fetch(API.DETAIL(id));
    var json = await res.json();
    var d    = getObject(json);

    if (!d) { fillDetailFromDataset(btnEl.dataset); return; }

    var plant = mapPlant(d);
    var stock = d.stock || d.available || "";
    var origin= d.origin || d.location || d.country || "";
    var care  = d.care || d.instructions || d.guide || "";

    mBody.innerHTML =
      '<div class="rounded-lg bg-gray-100 p-3">' +
        '<img src="' + (plant.image || "") + '" alt="' + plant.name + '" class="w-full max-h-80 object-contain">' +
      "</div>" +
      "<div>" +
        '<h4 class="text-xl font-bold mb-1">' + plant.name + "</h4>" +
        '<p class="text-sm  text-gray-600 mb-2">' + plant.category + " • ৳" + plant.price + "</p>" +
        "<p>" + (plant.description || "No detailed description available.") + "</p>" +
        (origin ? '<p class="mt-3 text-sm"><span class="font-semibold">Origin:</span> ' + origin + "</p>" : "") +
        (stock  ? '<p class="text-sm"><span class="font-semibold">Availability:</span> ' + stock + "</p>" : "") +
        (care   ? '<div class="mt-3"><p class="font-semibold text-gray-400">Care:</p><p class="text-sm text-gray-700">' + care + "</p></div>" : "") +
      "</div>";
  } catch (err) {
    console.log(err);
    fillDetailFromDataset(btnEl.dataset);
  }
}


// ============= Cart =====================
  var cart = []; 

  function animateCartBody() {
    var target = cart.length ? cartList.scrollHeight : 0;
    cartBody.style.maxHeight = target + "px";
    if (cart.length === 0) cartEmpty.classList.remove("hidden");
    else                    cartEmpty.classList.add("hidden");
    cartCount.textContent = String(cart.length);
  }

  function refreshCart() {
  cartList.innerHTML = "";
  var total = 0;

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    total += item.price;

    var li = document.createElement("li");
    li.className =
      "py-2 flex items-start justify-between border-none bg-[#F0FDF4] mb-2 px-3 rounded-md";

    li.innerHTML =
      '<div class="flex flex-col">' +
        '<span class="text-base font-bold">' + item.name + '</span>' +
        '<span class="text-gray-500 text-base py-1">৳' + item.price + '</span>' +
      '</div>' +
      '<button class="rm-btn text-[#8C8C8C] font-bold hover:text-red-700 text-[15px]" data-idx="' +
      i +
      '" title="Remove">✕</button>';

    cartList.appendChild(li);
  }

  cartTotal.textContent = "৳" + total;
  requestAnimationFrame(animateCartBody);
}


// ======================= Categories Filtering ============
  catList.addEventListener("click", function (e) {
    var allBtn = e.target.closest("#btnAll");
    if (allBtn) {
      var actives = document.querySelectorAll(".category-btn.active");
      for (var i = 0; i < actives.length; i++) {
        actives[i].classList.remove("active", "bg-green-600", "text-white");
      }
      allBtn.classList.add("bg-green-600", "text-white");
      loadAllPlants();
      return;
    }

    var btn = e.target.closest(".category-btn");
    if (!btn) return;

    var act = document.querySelectorAll(".category-btn.active");
    for (var j = 0; j < act.length; j++) {
      act[j].classList.remove("active", "bg-green-600", "text-white");
    }
    var all = document.getElementById("btnAll");
    if (all) all.classList.remove("bg-green-600", "text-white");

    btn.classList.add("active", "bg-green-600", "text-white");
    var id = btn.getAttribute("data-id");
    if (id) loadByCategory(id);
  });

  plantGrid.addEventListener("click", function (e) {
    var add = e.target.closest(".add-btn");
    if (add) {
      var name  = add.getAttribute("data-name");
      var price = Number(add.getAttribute("data-price") || 0);
      cart.push({ name: name, price: price });
      refreshCart();
      add.textContent = "Added ✓";
      setTimeout(function () { add.textContent = "Add to Cart"; }, 800);
      return;
    }
    var nameBtn = e.target.closest(".plant-name");
    if (nameBtn) { openDetails(nameBtn); }
  });


// ============ Cart Remove ==========
cartList.addEventListener("click", function (e) {
  var rm = e.target.closest(".rm-btn");
  if (!rm) return;
  var idx = Number(rm.getAttribute("data-idx"));
  if (idx >= 0) { cart.splice(idx, 1); refreshCart(); }
});

(async function init() {
  await loadCategories();
  var all = document.getElementById("btnAll");
  if (all) all.classList.add("bg-green-600", "text-white");
  await loadAllPlants();
  animateCartBody(); 
})();
  
  